import { CertificationStatus } from '@prisma/client';
import { z } from 'zod';

export const upsertVendorProfileValidationSchema = z.object({
  body: z.object({
    farmName: z.string().trim().min(2, 'Farm name must be at least 2 characters long.').max(120),
    farmLocation: z.string().trim().min(2, 'Farm location must be at least 2 characters long.').max(200),
  }),
});

export const vendorListQueryValidationSchema = z.object({
  query: z.object({
    certificationStatus: z.enum(CertificationStatus).optional(),
    location: z.string().trim().max(200).optional(),
    search: z.string().trim().max(120).optional(),
  }),
});

export const vendorIdParamValidationSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid vendor profile id.'),
  }),
});
