import { OrderStatus, UserRole } from '@prisma/client';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../errors/AppError';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { OrderService } from './order.service';

const placeOrder = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const result = await OrderService.placeOrder(req.user.userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Order placed successfully.',
    data: result,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const statusQuery = req.query.status;
  const pageQuery = req.query.page;
  const limitQuery = req.query.limit;

  const result = await OrderService.getMyOrders(req.user.userId, {
    page: pageQuery,
    limit: limitQuery,
    status: typeof statusQuery === 'string' ? (statusQuery as OrderStatus) : undefined,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Your orders fetched successfully.',
    data: result.orders,
    meta: result.meta,
  });
});

const getVendorOrders = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const statusQuery = req.query.status;
  const customerIdQuery = req.query.customerId;
  const pageQuery = req.query.page;
  const limitQuery = req.query.limit;

  const result = await OrderService.getVendorOrders(req.user.userId, {
    page: pageQuery,
    limit: limitQuery,
    status: typeof statusQuery === 'string' ? (statusQuery as OrderStatus) : undefined,
    customerId: typeof customerIdQuery === 'string' ? customerIdQuery : undefined,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Vendor orders fetched successfully.',
    data: result.orders,
    meta: result.meta,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const statusQuery = req.query.status;
  const vendorIdQuery = req.query.vendorId;
  const customerIdQuery = req.query.customerId;
  const pageQuery = req.query.page;
  const limitQuery = req.query.limit;

  const result = await OrderService.getAllOrders({
    page: pageQuery,
    limit: limitQuery,
    status: typeof statusQuery === 'string' ? (statusQuery as OrderStatus) : undefined,
    vendorId: typeof vendorIdQuery === 'string' ? vendorIdQuery : undefined,
    customerId: typeof customerIdQuery === 'string' ? customerIdQuery : undefined,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Orders fetched successfully.',
    data: result.orders,
    meta: result.meta,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId || !req.user.role) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const orderId = req.params.id;

  if (typeof orderId !== 'string') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid order id.');
  }

  const result = await OrderService.getOrderById(req.user.userId, req.user.role, orderId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order details fetched successfully.',
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId || !req.user.role) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  if (req.user.role !== UserRole.VENDOR && req.user.role !== UserRole.ADMIN) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You are not allowed to update order statuses.');
  }

  const orderId = req.params.id;

  if (typeof orderId !== 'string') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid order id.');
  }

  const result = await OrderService.updateOrderStatus(req.user.userId, req.user.role, orderId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order status updated successfully.',
    data: result,
  });
});

export const OrderController = {
  placeOrder,
  getMyOrders,
  getVendorOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};

