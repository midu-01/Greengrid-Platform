import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';

export const validateRequest = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsedRequest = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    }) as {
      body: Request['body'];
      params: Request['params'];
      query: Request['query'];
    };

    req.body = parsedRequest.body;
    req.params = parsedRequest.params;
    req.query = parsedRequest.query;

    next();
  };
};
