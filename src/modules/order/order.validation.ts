import { OrderStatus } from '@prisma/client';
import { z } from 'zod';

const updatableOrderStatuses: Set<OrderStatus> = new Set([
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.CANCELLED,
  OrderStatus.COMPLETED,
]);

export const placeOrderValidationSchema = z.object({
  body: z.object({
    produceId: z.uuid('Invalid produce id.'),
    quantity: z.coerce.number().int('Quantity must be an integer.').positive('Quantity must be greater than 0.'),
  }),
});

export const listOrderQueryValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    status: z.enum(OrderStatus).optional(),
    vendorId: z.uuid('Invalid vendor id.').optional(),
    customerId: z.uuid('Invalid customer id.').optional(),
  }),
});

export const orderIdParamValidationSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid order id.'),
  }),
});

export const updateOrderStatusValidationSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid order id.'),
  }),
  body: z.object({
    status: z
      .enum(OrderStatus)
      .refine((status) => updatableOrderStatuses.has(status), 'Unsupported order status update value.'),
  }),
});
