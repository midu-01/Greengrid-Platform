import { z } from 'zod';

const growthStages = [
  'SEED',
  'SEEDLING',
  'VEGETATIVE',
  'FLOWERING',
  'HARVEST_READY',
  'HARVESTED',
] as const;

const healthStatuses = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL', 'DISEASED'] as const;

export const growthStageEnum = z.enum(growthStages);
export const healthStatusEnum = z.enum(healthStatuses);

export const createPlantTrackingValidationSchema = z.object({
  body: z.object({
    rentalBookingId: z.uuid('Invalid rental booking id.').optional(),
    plantName: z.string().trim().min(2, 'Plant name must be at least 2 characters long.').max(120),
    growthStage: growthStageEnum,
    healthStatus: healthStatusEnum,
    expectedHarvestDate: z.coerce.date().optional(),
    notes: z
      .string()
      .trim()
      .min(2, 'Notes must be at least 2 characters long.')
      .max(2000, 'Notes cannot exceed 2000 characters.')
      .optional(),
  }),
});

export const updatePlantTrackingValidationSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid plant tracking id.'),
  }),
  body: z
    .object({
      rentalBookingId: z.uuid('Invalid rental booking id.').optional(),
      plantName: z.string().trim().min(2, 'Plant name must be at least 2 characters long.').max(120).optional(),
      growthStage: growthStageEnum.optional(),
      healthStatus: healthStatusEnum.optional(),
      expectedHarvestDate: z.coerce.date().optional(),
      notes: z
        .string()
        .trim()
        .min(2, 'Notes must be at least 2 characters long.')
        .max(2000, 'Notes cannot exceed 2000 characters.')
        .optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: 'At least one field is required to update a plant tracking record.',
    }),
});

export const plantTrackingIdParamValidationSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid plant tracking id.'),
  }),
});

export const listMyPlantTrackingQueryValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    rentalBookingId: z.uuid('Invalid rental booking id.').optional(),
    growthStage: growthStageEnum.optional(),
    healthStatus: healthStatusEnum.optional(),
    updatedAfter: z.coerce.date().optional(),
  }),
});

export const listPlantTrackingUpdatesQueryValidationSchema = z.object({
  query: z.object({
    updatedAfter: z.coerce.date().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});

export const listVisiblePlantTrackingQueryValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    userId: z.uuid('Invalid user id.').optional(),
    vendorId: z.uuid('Invalid vendor id.').optional(),
    rentalBookingId: z.uuid('Invalid rental booking id.').optional(),
    growthStage: growthStageEnum.optional(),
    healthStatus: healthStatusEnum.optional(),
    updatedAfter: z.coerce.date().optional(),
  }),
});
