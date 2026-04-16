import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import { StatusCodes } from 'http-status-codes';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { openApiDocument } from './docs/openapi';
import { ApiRoutes } from './modules/routes';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { sendResponse } from './utils/sendResponse';

const app: Application = express();

app.disable('x-powered-by');
app.set('trust proxy', env.TRUST_PROXY);

app.use(cors());
app.use(express.json({ limit: env.REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: env.REQUEST_BODY_LIMIT }));
app.use(morgan('dev'));

app.get('/health', (_req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'GreenGrid API is running.',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.get('/docs.json', (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json(openApiDocument);
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, { explorer: true }));

app.use('/api/v1', ApiRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
