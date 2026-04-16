import { UserRole } from '@prisma/client';
import { Router } from 'express';

import { auth } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { validateRequest } from '../../middlewares/validateRequest';
import { RentalSpaceController } from './rentalSpace.controller';
import {
  bookRentalSpaceValidationSchema,
  createRentalSpaceValidationSchema,
  listAdminBookingsQueryValidationSchema,
  listRentalSpacesQueryValidationSchema,
  rentalSpaceIdParamValidationSchema,
  updateRentalSpaceValidationSchema,
} from './rentalSpace.validation';

const router = Router();

router.get(
  '/bookings/me',
  auth,
  requireRole(UserRole.CUSTOMER),
  RentalSpaceController.getMyBookings
);

router.get(
  '/bookings',
  auth,
  requireRole(UserRole.ADMIN),
  validateRequest(listAdminBookingsQueryValidationSchema),
  RentalSpaceController.getAdminBookings
);

router.get(
  '/me/spaces',
  auth,
  requireRole(UserRole.VENDOR),
  RentalSpaceController.getMyRentalSpaces
);

router.get(
  '/',
  validateRequest(listRentalSpacesQueryValidationSchema),
  RentalSpaceController.getAvailableRentalSpaces
);

router.post(
  '/',
  auth,
  requireRole(UserRole.VENDOR),
  validateRequest(createRentalSpaceValidationSchema),
  RentalSpaceController.createRentalSpace
);

router.get(
  '/:id',
  validateRequest(rentalSpaceIdParamValidationSchema),
  RentalSpaceController.getRentalSpaceById
);

router.patch(
  '/:id',
  auth,
  requireRole(UserRole.VENDOR),
  validateRequest(updateRentalSpaceValidationSchema),
  RentalSpaceController.updateRentalSpace
);

router.delete(
  '/:id',
  auth,
  requireRole(UserRole.VENDOR),
  validateRequest(rentalSpaceIdParamValidationSchema),
  RentalSpaceController.deleteRentalSpace
);

router.post(
  '/:id/book',
  auth,
  requireRole(UserRole.CUSTOMER),
  validateRequest(bookRentalSpaceValidationSchema),
  RentalSpaceController.bookRentalSpace
);

export const RentalSpaceRoutes = router;
