import rateLimit from 'express-rate-limit';

import { env } from '../config/env';
import { sendErrorResponse } from '../utils/sendResponse';

interface RateLimiterConfig {
  max: number;
  message: string;
}

const createRateLimiter = ({ max, message }: RateLimiterConfig) =>
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      sendErrorResponse(res, {
        statusCode: 429,
        message,
      });
    },
  });

export const authRateLimiter = createRateLimiter({
  max: env.AUTH_RATE_LIMIT_MAX,
  message: 'Too many auth attempts. Please try again later.',
});

export const certificationSubmissionRateLimiter = createRateLimiter({
  max: env.CERTIFICATION_RATE_LIMIT_MAX,
  message: 'Too many certification submissions. Please try again later.',
});

export const forumWriteRateLimiter = createRateLimiter({
  max: env.FORUM_WRITE_RATE_LIMIT_MAX,
  message: 'Too many forum write requests. Please slow down and try again later.',
});

export const plantTrackingWriteRateLimiter = createRateLimiter({
  max: env.PLANT_TRACKING_WRITE_RATE_LIMIT_MAX,
  message: 'Too many plant tracking updates. Please try again shortly.',
});
