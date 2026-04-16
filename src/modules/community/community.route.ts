import { Router } from 'express';

import { auth } from '../../middlewares/auth';
import { forumWriteRateLimiter } from '../../middlewares/rateLimiter';
import { validateRequest } from '../../middlewares/validateRequest';
import { CommunityController } from './community.controller';
import {
  communityPostIdParamValidationSchema,
  createCommunityPostValidationSchema,
  listCommunityPostQueryValidationSchema,
  updateCommunityPostValidationSchema,
} from './community.validation';

const router = Router();

router.get('/', validateRequest(listCommunityPostQueryValidationSchema), CommunityController.listPosts);

router.post(
  '/',
  auth,
  forumWriteRateLimiter,
  validateRequest(createCommunityPostValidationSchema),
  CommunityController.createPost
);

router.get(
  '/:id',
  validateRequest(communityPostIdParamValidationSchema),
  CommunityController.getPostById
);

router.patch(
  '/:id',
  auth,
  forumWriteRateLimiter,
  validateRequest(updateCommunityPostValidationSchema),
  CommunityController.updatePost
);

router.delete(
  '/:id',
  auth,
  forumWriteRateLimiter,
  validateRequest(communityPostIdParamValidationSchema),
  CommunityController.deletePost
);

export const CommunityRoutes = router;
