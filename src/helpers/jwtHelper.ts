import jwt, { SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';
import { JwtPayloadData } from '../interfaces/auth';

export const createAccessToken = (payload: JwtPayloadData): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
};

export const verifyAccessToken = (token: string): JwtPayloadData => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayloadData;
};
