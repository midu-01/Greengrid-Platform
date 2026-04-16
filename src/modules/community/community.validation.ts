import { z } from 'zod';

export const createCommunityPostValidationSchema = z.object({
  body: z.object({
    postContent: z
      .string()
      .trim()
      .min(5, 'Post content must be at least 5 characters long.')
      .max(5000, 'Post content cannot exceed 5000 characters.'),
  }),
});

export const updateCommunityPostValidationSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid community post id.'),
  }),
  body: z
    .object({
      postContent: z
        .string()
        .trim()
        .min(5, 'Post content must be at least 5 characters long.')
        .max(5000, 'Post content cannot exceed 5000 characters.')
        .optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: 'At least one field is required to update a community post.',
    }),
});

export const communityPostIdParamValidationSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid community post id.'),
  }),
});

export const listCommunityPostQueryValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    userId: z.uuid('Invalid user id.').optional(),
    search: z.string().trim().max(300).optional(),
  }),
});
