import { UserRole, UserStatus } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { prisma } from '../../config/prisma';
import { AppError } from '../../errors/AppError';
import { createAccessToken } from '../../helpers/jwtHelper';
import { comparePassword, hashPassword } from '../../helpers/passwordHelper';

const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
} as const;

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface LoginPayload {
  email: string;
  password: string;
}

const register = async (payload: RegisterPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(StatusCodes.CONFLICT, 'Email is already in use.');
  }

  const hashedPassword = await hashPassword(payload.password);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role ?? UserRole.CUSTOMER,
    },
    select: userPublicSelect,
  });

  const accessToken = createAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, accessToken };
};

const login = async (payload: LoginPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials.');
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(StatusCodes.FORBIDDEN, 'User account is not active.');
  }

  const passwordMatches = await comparePassword(payload.password, user.password);

  if (!passwordMatches) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials.');
  }

  const accessToken = createAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const publicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };

  return { user: publicUser, accessToken };
};

const getCurrentUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userPublicSelect,
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  return user;
};

export const AuthService = {
  register,
  login,
  getCurrentUserProfile,
};
