import { Prisma, UserRole } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { prisma } from '../../config/prisma';
import { AppError } from '../../errors/AppError';
import { buildPaginationMeta, getPaginationOptions } from '../../helpers/paginationHelper';

interface CreateCommunityPostPayload {
  postContent: string;
}

interface UpdateCommunityPostPayload {
  postContent?: string;
}

interface CommunityPostListFilters {
  page?: unknown;
  limit?: unknown;
  userId?: string;
  search?: string;
}

const communityPostSelect = {
  id: true,
  userId: true,
  postContent: true,
  postDate: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
} as const;

const createPost = async (userId: string, payload: CreateCommunityPostPayload) => {
  return prisma.communityPost.create({
    data: {
      userId,
      postContent: payload.postContent,
    },
    select: communityPostSelect,
  });
};

const listPosts = async (filters: CommunityPostListFilters) => {
  const pagination = getPaginationOptions({
    page: filters.page,
    limit: filters.limit,
  });

  const where: Prisma.CommunityPostWhereInput = {
    userId: filters.userId,
  };

  if (typeof filters.search === 'string' && filters.search.trim().length > 0) {
    where.postContent = {
      contains: filters.search.trim(),
      mode: 'insensitive',
    };
  }

  const [posts, total] = await Promise.all([
    prisma.communityPost.findMany({
      where,
      orderBy: {
        postDate: 'desc',
      },
      skip: pagination.skip,
      take: pagination.limit,
      select: communityPostSelect,
    }),
    prisma.communityPost.count({
      where,
    }),
  ]);

  return {
    posts,
    meta: buildPaginationMeta(total, pagination),
  };
};

const getPostById = async (postId: string) => {
  const post = await prisma.communityPost.findUnique({
    where: {
      id: postId,
    },
    select: communityPostSelect,
  });

  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Community post not found.');
  }

  return post;
};

const assertCommunityPostAccess = (
  actorId: string,
  actorRole: UserRole,
  targetUserId: string,
  action: 'update' | 'delete'
) => {
  if (actorRole === UserRole.ADMIN) {
    return;
  }

  if (actorId !== targetUserId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      `You are not allowed to ${action} this community post.`
    );
  }
};

const updatePost = async (
  actorId: string,
  actorRole: UserRole,
  postId: string,
  payload: UpdateCommunityPostPayload
) => {
  const existingPost = await prisma.communityPost.findUnique({
    where: {
      id: postId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!existingPost) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Community post not found.');
  }

  assertCommunityPostAccess(actorId, actorRole, existingPost.userId, 'update');

  const data: Prisma.CommunityPostUpdateInput = {};

  if (payload.postContent !== undefined) {
    data.postContent = payload.postContent;
  }

  return prisma.communityPost.update({
    where: {
      id: existingPost.id,
    },
    data,
    select: communityPostSelect,
  });
};

const deletePost = async (actorId: string, actorRole: UserRole, postId: string) => {
  const existingPost = await prisma.communityPost.findUnique({
    where: {
      id: postId,
    },
    select: {
      id: true,
      userId: true,
      postContent: true,
    },
  });

  if (!existingPost) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Community post not found.');
  }

  assertCommunityPostAccess(actorId, actorRole, existingPost.userId, 'delete');

  return prisma.communityPost.delete({
    where: {
      id: existingPost.id,
    },
    select: {
      id: true,
      userId: true,
      postContent: true,
      postDate: true,
    },
  });
};

export const CommunityService = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
};
