interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

interface PaginationMeta extends Record<string, unknown> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const toPositiveInteger = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);

    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return fallback;
};

export const getPaginationOptions = (query: {
  page?: unknown;
  limit?: unknown;
}): PaginationOptions => {
  const page = toPositiveInteger(query.page, DEFAULT_PAGE);
  const requestedLimit = toPositiveInteger(query.limit, DEFAULT_LIMIT);
  const limit = Math.min(requestedLimit, MAX_LIMIT);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

export const buildPaginationMeta = (
  total: number,
  pagination: Pick<PaginationOptions, 'page' | 'limit'>
): PaginationMeta => {
  const totalPages = total > 0 ? Math.ceil(total / pagination.limit) : 0;

  return {
    page: pagination.page,
    limit: pagination.limit,
    total,
    totalPages,
    hasNextPage: pagination.page < totalPages,
    hasPrevPage: pagination.page > 1,
  };
};
