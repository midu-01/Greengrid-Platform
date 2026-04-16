import { Response } from 'express';

interface SendResponseArgs<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

interface SendErrorResponseArgs {
  statusCode: number;
  message: string;
  details?: unknown;
  code?: string;
}

export const sendResponse = <T>(res: Response, args: SendResponseArgs<T>): void => {
  const payload: Record<string, unknown> = {
    success: args.success,
    message: args.message,
    data: args.data ?? null,
  };

  if (args.meta) {
    payload.meta = args.meta;
  }

  res.status(args.statusCode).json(payload);
};

export const sendErrorResponse = (res: Response, args: SendErrorResponseArgs): void => {
  const errorPayload: Record<string, unknown> = {
    details: args.details ?? null,
  };

  if (args.code) {
    errorPayload.code = args.code;
  }

  res.status(args.statusCode).json({
    success: false,
    message: args.message,
    error: errorPayload,
  });
};
