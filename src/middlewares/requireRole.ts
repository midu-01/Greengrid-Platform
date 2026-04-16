import { UserRole } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../errors/AppError';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to access this resource.');
    }

    next();
  };
};
