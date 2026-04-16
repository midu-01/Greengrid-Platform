import { UserRole } from '@prisma/client';
import { Router } from 'express';

import { auth } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { validateRequest } from '../../middlewares/validateRequest';
import { VendorController } from './vendor.controller';
import {
  upsertVendorProfileValidationSchema,
  vendorIdParamValidationSchema,
  vendorListQueryValidationSchema,
} from './vendor.validation';

const router = Router();

router.get(
  '/me',
  auth,
  requireRole(UserRole.VENDOR),
  VendorController.getMyVendorProfile
);

router.put(
  '/me',
  auth,
  requireRole(UserRole.VENDOR),
  validateRequest(upsertVendorProfileValidationSchema),
  VendorController.upsertMyVendorProfile
);

router.get(
  '/',
  auth,
  requireRole(UserRole.ADMIN),
  validateRequest(vendorListQueryValidationSchema),
  VendorController.getAllVendorProfiles
);

router.get(
  '/:id',
  auth,
  requireRole(UserRole.ADMIN),
  validateRequest(vendorIdParamValidationSchema),
  VendorController.getVendorProfileById
);

export const VendorRoutes = router;
