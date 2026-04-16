import dotenv from 'dotenv';

dotenv.config();

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const getPositiveNumberEnv = (key: string, defaultValue: number): number => {
  const value = process.env[key];

  if (!value) {
    return defaultValue;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return defaultValue;
  }

  return parsedValue;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 5000),
  TRUST_PROXY: process.env.TRUST_PROXY === 'true',
  REQUEST_BODY_LIMIT: process.env.REQUEST_BODY_LIMIT ?? '1mb',
  DATABASE_URL: getRequiredEnv('DATABASE_URL'),
  JWT_SECRET: getRequiredEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '1d',
  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
  RATE_LIMIT_WINDOW_MS: getPositiveNumberEnv('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  AUTH_RATE_LIMIT_MAX: getPositiveNumberEnv('AUTH_RATE_LIMIT_MAX', 25),
  CERTIFICATION_RATE_LIMIT_MAX: getPositiveNumberEnv('CERTIFICATION_RATE_LIMIT_MAX', 10),
  FORUM_WRITE_RATE_LIMIT_MAX: getPositiveNumberEnv('FORUM_WRITE_RATE_LIMIT_MAX', 40),
  PLANT_TRACKING_WRITE_RATE_LIMIT_MAX: getPositiveNumberEnv('PLANT_TRACKING_WRITE_RATE_LIMIT_MAX', 60),
};
