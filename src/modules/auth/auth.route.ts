import { UserRole } from '@prisma/client';
import { Router } from 'express';

import { auth } from '../../middlewares/auth';
import { authRateLimiter } from '../../middlewares/rateLimiter';
import { requireRole } from '../../middlewares/requireRole';
import { validateRequest } from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { loginValidationSchema, registerValidationSchema } from './auth.validation';

const router = Router();

router.post('/register', authRateLimiter, validateRequest(registerValidationSchema), AuthController.register);
router.post('/login', authRateLimiter, validateRequest(loginValidationSchema), AuthController.login);
router.get('/me', auth, AuthController.getMe);
router.get(
  '/admin-only',
  auth,
  requireRole(UserRole.ADMIN),
  AuthController.getRoleProtectedMessage
);
router.get(
  '/vendor-only',
  auth,
  requireRole(UserRole.VENDOR, UserRole.ADMIN),
  AuthController.getRoleProtectedMessage
);

export const AuthRoutes = router;
