import { OrderStatus, Prisma, UserRole } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { prisma } from '../../config/prisma';
import { AppError } from '../../errors/AppError';
import { buildPaginationMeta, getPaginationOptions } from '../../helpers/paginationHelper';

interface PlaceOrderPayload {
  produceId: string;
  quantity: number;
}

interface OrderListFilters {
  page?: unknown;
  limit?: unknown;
  status?: OrderStatus;
  vendorId?: string;
  customerId?: string;
}

interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

const orderSelect = {
  id: true,
  userId: true,
  produceId: true,
  vendorId: true,
  quantity: true,
  unitPrice: true,
  totalPrice: true,
  status: true,
  orderDate: true,
  createdAt: true,
  updatedAt: true,
  produce: {
    select: {
      id: true,
      name: true,
      category: true,
      certificationStatus: true,
      price: true,
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  vendor: {
    select: {
      id: true,
      name: true,
      email: true,
      vendorProfile: {
        select: {
          id: true,
          farmName: true,
          farmLocation: true,
          certificationStatus: true,
        },
      },
    },
  },
} as const;

const updatableStatuses: Set<OrderStatus> = new Set([
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.CANCELLED,
  OrderStatus.COMPLETED,
]);

const allowedStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.PROCESSING]: [],
  [OrderStatus.SHIPPED]: [],
  [OrderStatus.DELIVERED]: [],
};

const placeOrder = async (customerId: string, payload: PlaceOrderPayload) => {
  if (payload.quantity <= 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Order quantity must be greater than 0.');
  }

  return prisma.$transaction(async (tx) => {
    const produce = await tx.produce.findUnique({
      where: {
        id: payload.produceId,
      },
      select: {
        id: true,
        name: true,
        vendorId: true,
        availableQuantity: true,
        price: true,
      },
    });

    if (!produce) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Produce listing not found.');
    }

    if (produce.vendorId === customerId) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'You cannot order your own produce listing.');
    }

    if (produce.availableQuantity < payload.quantity) {
      throw new AppError(StatusCodes.CONFLICT, 'Insufficient produce stock for this order quantity.');
    }

    const stockUpdateResult = await tx.produce.updateMany({
      where: {
        id: payload.produceId,
        availableQuantity: {
          gte: payload.quantity,
        },
      },
      data: {
        availableQuantity: {
          decrement: payload.quantity,
        },
      },
    });

    if (stockUpdateResult.count === 0) {
      throw new AppError(StatusCodes.CONFLICT, 'Produce stock changed. Please try placing the order again.');
    }

    const unitPrice = new Prisma.Decimal(produce.price);
    const totalPrice = unitPrice.mul(payload.quantity);

    return tx.order.create({
      data: {
        userId: customerId,
        produceId: payload.produceId,
        vendorId: produce.vendorId,
        quantity: payload.quantity,
        unitPrice,
        totalPrice,
        status: OrderStatus.PENDING,
      },
      select: orderSelect,
    });
  });
};

const getMyOrders = async (customerId: string, filters: OrderListFilters) => {
  const pagination = getPaginationOptions({
    page: filters.page,
    limit: filters.limit,
  });

  const where: Prisma.OrderWhereInput = {
    userId: customerId,
    status: filters.status,
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: pagination.skip,
      take: pagination.limit,
      select: orderSelect,
    }),
    prisma.order.count({
      where,
    }),
  ]);

  return {
    orders,
    meta: buildPaginationMeta(total, pagination),
  };
};

const getVendorOrders = async (vendorId: string, filters: OrderListFilters) => {
  const pagination = getPaginationOptions({
    page: filters.page,
    limit: filters.limit,
  });

  const where: Prisma.OrderWhereInput = {
    vendorId,
    status: filters.status,
    userId: filters.customerId,
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: pagination.skip,
      take: pagination.limit,
      select: orderSelect,
    }),
    prisma.order.count({
      where,
    }),
  ]);

  return {
    orders,
    meta: buildPaginationMeta(total, pagination),
  };
};

const getAllOrders = async (filters: OrderListFilters) => {
  const pagination = getPaginationOptions({
    page: filters.page,
    limit: filters.limit,
  });

  const where: Prisma.OrderWhereInput = {
    status: filters.status,
    vendorId: filters.vendorId,
    userId: filters.customerId,
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: pagination.skip,
      take: pagination.limit,
      select: orderSelect,
    }),
    prisma.order.count({
      where,
    }),
  ]);

  return {
    orders,
    meta: buildPaginationMeta(total, pagination),
  };
};

const getOrderById = async (actorId: string, actorRole: UserRole, orderId: string) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    select: orderSelect,
  });

  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Order not found.');
  }

  if (actorRole === UserRole.CUSTOMER && order.userId !== actorId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You are not allowed to access this order.');
  }

  if (actorRole === UserRole.VENDOR && order.vendorId !== actorId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You are not allowed to access this order.');
  }

  return order;
};

const updateOrderStatus = async (
  actorId: string,
  actorRole: UserRole,
  orderId: string,
  payload: UpdateOrderStatusPayload
) => {
  if (!updatableStatuses.has(payload.status)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Unsupported order status update value.');
  }

  return prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        userId: true,
        vendorId: true,
        produceId: true,
        quantity: true,
        status: true,
      },
    });

    if (!existingOrder) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Order not found.');
    }

    if (actorRole === UserRole.VENDOR && existingOrder.vendorId !== actorId) {
      throw new AppError(StatusCodes.FORBIDDEN, 'You are not allowed to update this order status.');
    }

    if (actorRole === UserRole.CUSTOMER) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Customers are not allowed to update order statuses.');
    }

    if (!updatableStatuses.has(existingOrder.status)) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'This order is in a legacy status and cannot be updated with this endpoint.'
      );
    }

    if (existingOrder.status === payload.status) {
      return tx.order.findUniqueOrThrow({
        where: {
          id: existingOrder.id,
        },
        select: orderSelect,
      });
    }

    const allowedNextStatuses = allowedStatusTransitions[existingOrder.status];

    if (!allowedNextStatuses.includes(payload.status)) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Order status cannot be changed from ${existingOrder.status} to ${payload.status}.`
      );
    }

    if (payload.status === OrderStatus.CANCELLED) {
      await tx.produce.update({
        where: {
          id: existingOrder.produceId,
        },
        data: {
          availableQuantity: {
            increment: existingOrder.quantity,
          },
        },
      });
    }

    return tx.order.update({
      where: {
        id: existingOrder.id,
      },
      data: {
        status: payload.status,
      },
      select: orderSelect,
    });
  });
};

export const OrderService = {
  placeOrder,
  getMyOrders,
  getVendorOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};
