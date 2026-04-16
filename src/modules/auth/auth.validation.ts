import { UserRole } from '@prisma/client';
import { z } from 'zod';

export const registerValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters long.').max(80),
    email: z.email().toLowerCase(),
    password: z.string().min(6, 'Password must be at least 6 characters long.').max(100),
    role: z.enum([UserRole.CUSTOMER, UserRole.VENDOR]).optional(),
  }),
});

export const loginValidationSchema = z.object({
  body: z.object({
    email: z.email().toLowerCase(),
    password: z.string().min(6).max(100),
  }),
});
