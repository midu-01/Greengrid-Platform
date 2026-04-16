import { UserRole } from '@prisma/client';
import { Router } from 'express';

import { auth } from '../../middlewares/auth';
import { certificationSubmissionRateLimiter } from '../../middlewares/rateLimiter';
import { requireRole } from '../../middlewares/requireRole';
import { validateRequest } from '../../middlewares/validateRequest';
import { CertificationController } from './certification.controller';
import {
  certificationIdParamValidationSchema,
  certificationListQueryValidationSchema,
  myCertificationListQueryValidationSchema,
  reviewCertificationValidationSchema,
  submitCertificationValidationSchema,
} from './certification.validation';

const router = Router();

router.post(
  '/',
  auth,
  requireRole(UserRole.VENDOR),
  certificationSubmissionRateLimiter,
  validateRequest(submitCertificationValidationSchema),
  CertificationController.submitCertification
);

router.get(
  '/me',
  auth,
  requireRole(UserRole.VENDOR),
  validateRequest(myCertificationListQueryValidationSchema),
  CertificationController.getMyCertifications
);

router.get(
  '/',
  auth,
  requireRole(UserRole.ADMIN),
  validateRequest(certificationListQueryValidationSchema),
  CertificationController.getAllCertifications
);

router.get(
  '/:id',
  auth,
  requireRole(UserRole.ADMIN),
  validateRequest(certificationIdParamValidationSchema),
  CertificationController.getCertificationById
);

router.patch(
  '/:id/review',
  auth,
  requireRole(UserRole.ADMIN),
  validateRequest(reviewCertificationValidationSchema),
  CertificationController.reviewCertification
);

export const CertificationRoutes = router;
