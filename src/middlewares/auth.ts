import { UserStatus } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { prisma } from '../config/prisma';
import { AppError } from '../errors/AppError';
import { verifyAccessToken } from '../helpers/jwtHelper';

export const auth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Authorization token is missing or invalid.');
    }

    const token = authorizationHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'User not found.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError(StatusCodes.FORBIDDEN, 'User account is not active.');
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
