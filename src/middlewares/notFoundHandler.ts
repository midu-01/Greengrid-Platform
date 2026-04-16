import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { sendErrorResponse } from '../utils/sendResponse';

export const notFoundHandler = (req: Request, res: Response): void => {
  sendErrorResponse(res, {
    statusCode: StatusCodes.NOT_FOUND,
    message: `Route not found: ${req.originalUrl}`,
    details: {
      method: req.method,
      path: req.originalUrl,
    },
  });
};
