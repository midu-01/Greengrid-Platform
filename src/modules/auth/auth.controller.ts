import { UserRole } from '@prisma/client';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../errors/AppError';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AuthService } from './auth.service';

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'User registered successfully.',
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User logged in successfully.',
    data: result,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const profile = await AuthService.getCurrentUserProfile(req.user.userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Current user profile fetched successfully.',
    data: profile,
  });
});

const getRoleProtectedMessage = catchAsync(async (req: Request, res: Response) => {
  const role = req.user?.role ?? UserRole.CUSTOMER;

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Role-guarded route accessed by ${role}.`,
    data: {
      role,
    },
  });
});

export const AuthController = {
  register,
  login,
  getMe,
  getRoleProtectedMessage,
};
