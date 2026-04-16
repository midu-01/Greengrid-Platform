import { CertificationStatus } from '@prisma/client';
import { z } from 'zod';

export const createProduceValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters long.').max(120),
    description: z
      .string()
      .trim()
      .min(10, 'Description must be at least 10 characters long.')
      .max(1200),
    price: z.coerce.number().positive('Price must be greater than 0.'),
    category: z.string().trim().min(2, 'Category must be at least 2 characters long.').max(80),
    certificationStatus: z.enum(CertificationStatus).optional(),
    availableQuantity: z.coerce
      .number()
      .int('Available quantity must be an integer.')
      .min(0, 'Available quantity cannot be negative.'),
  }),
});

export const updateProduceValidationSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid produce id.'),
  }),
  body: z
    .object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters long.').max(120).optional(),
      description: z
        .string()
        .trim()
        .min(10, 'Description must be at least 10 characters long.')
        .max(1200)
        .optional(),
      price: z.coerce.number().positive('Price must be greater than 0.').optional(),
      category: z
        .string()
        .trim()
        .min(2, 'Category must be at least 2 characters long.')
        .max(80)
        .optional(),
      certificationStatus: z.enum(CertificationStatus).optional(),
      availableQuantity: z.coerce
        .number()
        .int('Available quantity must be an integer.')
        .min(0, 'Available quantity cannot be negative.')
        .optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: 'At least one field is required to update produce.',
    }),
});

export const produceIdParamValidationSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid produce id.'),
  }),
});

export const listProduceQueryValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    category: z.string().trim().max(80).optional(),
    vendorId: z.uuid('Invalid vendor id.').optional(),
    certificationStatus: z.enum(CertificationStatus).optional(),
    search: z.string().trim().max(120).optional(),
  }),
});

