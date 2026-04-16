import { CertificationStatus, CertificationType } from '@prisma/client';
import { z } from 'zod';

export const submitCertificationValidationSchema = z.object({
  body: z.object({
    certificationType: z.enum(CertificationType),
    certifyingAgency: z
      .string()
      .trim()
      .min(2, 'Certifying agency must be at least 2 characters long.')
      .max(120),
    certificationNumber: z.string().trim().max(120).optional(),
    certificationDate: z.coerce.date(),
    documentUrl: z.url('Certification document URL must be valid.').optional(),
  }),
});

export const reviewCertificationValidationSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid certification id.'),
  }),
  body: z.object({
    status: z.enum([CertificationStatus.APPROVED, CertificationStatus.REJECTED]),
    reviewNotes: z.string().trim().max(500).optional(),
  }),
});

export const certificationIdParamValidationSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid certification id.'),
  }),
});

export const certificationListQueryValidationSchema = z.object({
  query: z.object({
    status: z.enum(CertificationStatus).optional(),
    vendorId: z.uuid('Invalid vendor id.').optional(),
    certificationType: z.enum(CertificationType).optional(),
  }),
});

export const myCertificationListQueryValidationSchema = z.object({
  query: z.object({
    status: z.enum(CertificationStatus).optional(),
  }),
});
