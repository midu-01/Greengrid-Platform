import { UserRole } from '@prisma/client';
import { Router } from 'express';

import { auth } from '../../middlewares/auth';
import { plantTrackingWriteRateLimiter } from '../../middlewares/rateLimiter';
import { requireRole } from '../../middlewares/requireRole';
import { validateRequest } from '../../middlewares/validateRequest';
import { PlantTrackingController } from './plantTracking.controller';
import {
  createPlantTrackingValidationSchema,
  listMyPlantTrackingQueryValidationSchema,
  listPlantTrackingUpdatesQueryValidationSchema,
  listVisiblePlantTrackingQueryValidationSchema,
  plantTrackingIdParamValidationSchema,
  updatePlantTrackingValidationSchema,
} from './plantTracking.validation';

const router = Router();

router.post(
  '/',
  auth,
  requireRole(UserRole.CUSTOMER),
  plantTrackingWriteRateLimiter,
  validateRequest(createPlantTrackingValidationSchema),
  PlantTrackingController.createTrackingRecord
);

router.get(
  '/me',
  auth,
  requireRole(UserRole.CUSTOMER),
  validateRequest(listMyPlantTrackingQueryValidationSchema),
  PlantTrackingController.listMyTrackingRecords
);

router.get(
  '/me/updates',
  auth,
  requireRole(UserRole.CUSTOMER),
  validateRequest(listPlantTrackingUpdatesQueryValidationSchema),
  PlantTrackingController.listMyTrackingUpdates
);

router.get(
  '/',
  auth,
  requireRole(UserRole.VENDOR, UserRole.ADMIN),
  validateRequest(listVisiblePlantTrackingQueryValidationSchema),
  PlantTrackingController.listVisibleTrackingRecords
);

router.get(
  '/:id',
  auth,
  requireRole(UserRole.CUSTOMER, UserRole.VENDOR, UserRole.ADMIN),
  validateRequest(plantTrackingIdParamValidationSchema),
  PlantTrackingController.getTrackingRecordById
);

router.patch(
  '/:id',
  auth,
  requireRole(UserRole.CUSTOMER, UserRole.ADMIN),
  plantTrackingWriteRateLimiter,
  validateRequest(updatePlantTrackingValidationSchema),
  PlantTrackingController.updateTrackingRecord
);

export const PlantTrackingRoutes = router;
