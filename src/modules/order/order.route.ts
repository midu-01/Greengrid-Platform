import { UserRole } from '@prisma/client';
import { Router } from 'express';

import { auth } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { validateRequest } from '../../middlewares/validateRequest';
import { OrderController } from './order.controller';
import {
  listOrderQueryValidationSchema,
  orderIdParamValidationSchema,
  placeOrderValidationSchema,
  updateOrderStatusValidationSchema,
} from './order.validation';

const router = Router();

router.post(
  '/',
  auth,
  requireRole(UserRole.CUSTOMER),
  validateRequest(placeOrderValidationSchema),
  OrderController.placeOrder
);

router.get(
  '/me',
  auth,
  requireRole(UserRole.CUSTOMER),
  validateRequest(listOrderQueryValidationSchema),
  OrderController.getMyOrders
);

router.get(
  '/vendor',
  auth,
  requireRole(UserRole.VENDOR),
  validateRequest(listOrderQueryValidationSchema),
  OrderController.getVendorOrders
);

router.get(
  '/',
  auth,
  requireRole(UserRole.ADMIN),
  validateRequest(listOrderQueryValidationSchema),
  OrderController.getAllOrders
);

router.get(
  '/:id',
  auth,
  requireRole(UserRole.CUSTOMER, UserRole.VENDOR, UserRole.ADMIN),
  validateRequest(orderIdParamValidationSchema),
  OrderController.getOrderById
);

router.patch(
  '/:id/status',
  auth,
  requireRole(UserRole.VENDOR, UserRole.ADMIN),
  validateRequest(updateOrderStatusValidationSchema),
  OrderController.updateOrderStatus
);

export const OrderRoutes = router;

