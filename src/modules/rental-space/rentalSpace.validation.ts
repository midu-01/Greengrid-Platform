import { RentalAvailability, RentalBookingStatus } from '@prisma/client';
import { z } from 'zod';

export const createRentalSpaceValidationSchema = z.object({
  body: z.object({
    location: z.string().trim().min(2, 'Location must be at least 2 characters long.').max(200),
    size: z.coerce.number().positive('Size must be greater than 0.'),
    price: z.coerce.number().positive('Price must be greater than 0.'),
    availability: z.enum(RentalAvailability).optional(),
  }),
});

export const updateRentalSpaceValidationSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid rental space id.'),
  }),
  body: z
    .object({
      location: z.string().trim().min(2, 'Location must be at least 2 characters long.').max(200).optional(),
      size: z.coerce.number().positive('Size must be greater than 0.').optional(),
      price: z.coerce.number().positive('Price must be greater than 0.').optional(),
      availability: z.enum(RentalAvailability).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: 'At least one field is required to update a rental space.',
    }),
});

export const rentalSpaceIdParamValidationSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid rental space id.'),
  }),
});

export const listRentalSpacesQueryValidationSchema = z.object({
  query: z.object({
    location: z.string().trim().max(200).optional(),
    minSize: z.coerce.number().positive().optional(),
    maxSize: z.coerce.number().positive().optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
  }),
});

export const bookRentalSpaceValidationSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid rental space id.'),
  }),
  body: z
    .object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    })
    .refine((value) => value.endDate > value.startDate, {
      message: 'Booking endDate must be greater than startDate.',
      path: ['endDate'],
    }),
});

export const listAdminBookingsQueryValidationSchema = z.object({
  query: z.object({
    status: z.enum(RentalBookingStatus).optional(),
    vendorId: z.uuid('Invalid vendor id.').optional(),
    customerId: z.uuid('Invalid customer id.').optional(),
  }),
});
