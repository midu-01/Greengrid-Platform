import { Prisma } from '@prisma/client';
import { ErrorRequestHandler } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';

import { AppError } from '../errors/AppError';
import { sendErrorResponse } from '../utils/sendResponse';

export const globalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong.';
  let details: unknown;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Validation failed.';
    details = error.issues;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      statusCode = StatusCodes.CONFLICT;
      message = 'A unique constraint violation occurred.';
      details = error.meta;
    } else if (error.code === 'P2025') {
      statusCode = StatusCodes.NOT_FOUND;
      message = 'The requested resource does not exist.';
      details = error.meta;
    } else {
      statusCode = StatusCodes.BAD_REQUEST;
      message = 'Database request failed.';
      details = { code: error.code, meta: error.meta };
    }
  } else if (error instanceof TokenExpiredError) {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Access token expired.';
  } else if (error instanceof JsonWebTokenError) {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Invalid access token.';
  } else if (error instanceof Error) {
    message = error.message;
  }

  sendErrorResponse(res, {
    statusCode,
    message,
    details,
  });
};
