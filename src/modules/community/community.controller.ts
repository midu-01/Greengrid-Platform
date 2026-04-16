import { UserRole } from '@prisma/client';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../errors/AppError';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { CommunityService } from './community.service';

const getAuthenticatedUser = (req: Request) => {
  if (!req.user?.userId || !req.user.role) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  return {
    userId: req.user.userId,
    role: req.user.role,
  };
};

const createPost = catchAsync(async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);

  const result = await CommunityService.createPost(user.userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Community post created successfully.',
    data: result,
  });
});

const listPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await CommunityService.listPosts({
    page: req.query.page,
    limit: req.query.limit,
    userId: typeof req.query.userId === 'string' ? req.query.userId : undefined,
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Community posts fetched successfully.',
    data: result.posts,
    meta: result.meta,
  });
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.id;

  if (typeof postId !== 'string') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid community post id.');
  }

  const result = await CommunityService.getPostById(postId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Community post fetched successfully.',
    data: result,
  });
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const postId = req.params.id;

  if (typeof postId !== 'string') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid community post id.');
  }

  const result = await CommunityService.updatePost(
    user.userId,
    user.role as UserRole,
    postId,
    req.body
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Community post updated successfully.',
    data: result,
  });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const postId = req.params.id;

  if (typeof postId !== 'string') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid community post id.');
  }

  const result = await CommunityService.deletePost(user.userId, user.role as UserRole, postId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Community post deleted successfully.',
    data: result,
  });
});

export const CommunityController = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
};
