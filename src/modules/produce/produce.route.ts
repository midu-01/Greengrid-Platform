import { UserRole } from '@prisma/client';
import { Router } from 'express';

import { auth } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { validateRequest } from '../../middlewares/validateRequest';
import { ProduceController } from './produce.controller';
import {
  createProduceValidationSchema,
  listProduceQueryValidationSchema,
  produceIdParamValidationSchema,
  updateProduceValidationSchema,
} from './produce.validation';

const router = Router();

router.get('/', validateRequest(listProduceQueryValidationSchema), ProduceController.getProduceListings);

router.post(
  '/',
  auth,
  requireRole(UserRole.VENDOR),
  validateRequest(createProduceValidationSchema),
  ProduceController.createProduce
);

router.get('/:id', validateRequest(produceIdParamValidationSchema), ProduceController.getProduceById);

router.patch(
  '/:id',
  auth,
  requireRole(UserRole.VENDOR),
  validateRequest(updateProduceValidationSchema),
  ProduceController.updateProduce
);

router.delete(
  '/:id',
  auth,
  requireRole(UserRole.VENDOR),
  validateRequest(produceIdParamValidationSchema),
  ProduceController.deleteProduce
);

export const ProduceRoutes = router;

