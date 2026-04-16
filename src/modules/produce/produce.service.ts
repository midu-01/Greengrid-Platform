import { CertificationStatus, Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { prisma } from '../../config/prisma';
import { AppError } from '../../errors/AppError';
import { buildPaginationMeta, getPaginationOptions } from '../../helpers/paginationHelper';

interface CreateProducePayload {
  name: string;
  description: string;
  price: number;
  category: string;
  certificationStatus?: CertificationStatus;
  availableQuantity: number;
}

interface UpdateProducePayload {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  certificationStatus?: CertificationStatus;
  availableQuantity?: number;
}

interface ProduceListFilters {
  page?: unknown;
  limit?: unknown;
  category?: unknown;
  vendorId?: unknown;
  certificationStatus?: unknown;
  search?: unknown;
}

const producePublicSelect = {
  id: true,
  vendorId: true,
  name: true,
  description: true,
  price: true,
  category: true,
  certificationStatus: true,
  availableQuantity: true,
  createdAt: true,
  updatedAt: true,
  vendor: {
    select: {
      id: true,
      name: true,
      email: true,
      vendorProfile: {
        select: {
          id: true,
          farmName: true,
          farmLocation: true,
          certificationStatus: true,
        },
      },
    },
  },
} as const;

const getVendorProfileCertificationStatus = async (vendorId: string) => {
  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: {
      userId: vendorId,
    },
    select: {
      certificationStatus: true,
    },
  });

  if (!vendorProfile) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Vendor profile is required before creating produce listings.'
    );
  }

  return vendorProfile.certificationStatus;
};

const resolveProduceCertificationStatus = (
  vendorCertificationStatus: CertificationStatus,
  requestedStatus?: CertificationStatus
) => {
  if (requestedStatus === CertificationStatus.APPROVED) {
    if (vendorCertificationStatus !== CertificationStatus.APPROVED) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'Only vendors with approved certification can publish verified produce listings.'
      );
    }

    return CertificationStatus.APPROVED;
  }

  if (requestedStatus) {
    return requestedStatus;
  }

  return vendorCertificationStatus === CertificationStatus.APPROVED
    ? CertificationStatus.APPROVED
    : CertificationStatus.PENDING;
};

const createProduce = async (vendorId: string, payload: CreateProducePayload) => {
  const vendorCertificationStatus = await getVendorProfileCertificationStatus(vendorId);
  const certificationStatus = resolveProduceCertificationStatus(
    vendorCertificationStatus,
    payload.certificationStatus
  );

  return prisma.produce.create({
    data: {
      vendorId,
      name: payload.name,
      description: payload.description,
      price: new Prisma.Decimal(payload.price),
      category: payload.category,
      certificationStatus,
      availableQuantity: payload.availableQuantity,
    },
    select: producePublicSelect,
  });
};

const updateProduce = async (vendorId: string, produceId: string, payload: UpdateProducePayload) => {
  const existingProduce = await prisma.produce.findUnique({
    where: { id: produceId },
    select: {
      id: true,
      vendorId: true,
      certificationStatus: true,
    },
  });

  if (!existingProduce) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Produce listing not found.');
  }

  if (existingProduce.vendorId !== vendorId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You are not allowed to update this produce listing.');
  }

  const data: Prisma.ProduceUpdateInput = {};

  if (payload.name !== undefined) {
    data.name = payload.name;
  }

  if (payload.description !== undefined) {
    data.description = payload.description;
  }

  if (payload.price !== undefined) {
    data.price = new Prisma.Decimal(payload.price);
  }

  if (payload.category !== undefined) {
    data.category = payload.category;
  }

  if (payload.availableQuantity !== undefined) {
    data.availableQuantity = payload.availableQuantity;
  }

  if (payload.certificationStatus !== undefined) {
    const vendorCertificationStatus = await getVendorProfileCertificationStatus(vendorId);
    data.certificationStatus = resolveProduceCertificationStatus(
      vendorCertificationStatus,
      payload.certificationStatus
    );
  }

  return prisma.produce.update({
    where: {
      id: produceId,
    },
    data,
    select: producePublicSelect,
  });
};

const deleteProduce = async (vendorId: string, produceId: string) => {
  const existingProduce = await prisma.produce.findUnique({
    where: { id: produceId },
    select: {
      id: true,
      vendorId: true,
    },
  });

  if (!existingProduce) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Produce listing not found.');
  }

  if (existingProduce.vendorId !== vendorId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You are not allowed to delete this produce listing.');
  }

  return prisma.produce.delete({
    where: {
      id: produceId,
    },
    select: {
      id: true,
      vendorId: true,
      name: true,
    },
  });
};

const getProduceListings = async (filters: ProduceListFilters) => {
  const pagination = getPaginationOptions({
    page: filters.page,
    limit: filters.limit,
  });

  const where: Prisma.ProduceWhereInput = {
    availableQuantity: {
      gt: 0,
    },
  };

  if (typeof filters.category === 'string' && filters.category.trim().length > 0) {
    where.category = {
      contains: filters.category.trim(),
      mode: 'insensitive',
    };
  }

  if (typeof filters.vendorId === 'string' && filters.vendorId.trim().length > 0) {
    where.vendorId = filters.vendorId;
  }

  if (typeof filters.certificationStatus === 'string') {
    where.certificationStatus = filters.certificationStatus as CertificationStatus;
  }

  if (typeof filters.search === 'string' && filters.search.trim().length > 0) {
    where.name = {
      contains: filters.search.trim(),
      mode: 'insensitive',
    };
  }

  const [produces, total] = await Promise.all([
    prisma.produce.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: pagination.skip,
      take: pagination.limit,
      select: producePublicSelect,
    }),
    prisma.produce.count({
      where,
    }),
  ]);

  return {
    produces,
    meta: buildPaginationMeta(total, pagination),
  };
};

const getProduceById = async (produceId: string) => {
  const produce = await prisma.produce.findUnique({
    where: {
      id: produceId,
    },
    select: producePublicSelect,
  });

  if (!produce) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Produce listing not found.');
  }

  return produce;
};

export const ProduceService = {
  createProduce,
  updateProduce,
  deleteProduce,
  getProduceListings,
  getProduceById,
};

