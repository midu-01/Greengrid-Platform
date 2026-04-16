import { CertificationStatus, Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { prisma } from '../../config/prisma';
import { AppError } from '../../errors/AppError';

interface UpsertVendorProfilePayload {
  farmName: string;
  farmLocation: string;
}

interface VendorListFilters {
  certificationStatus?: CertificationStatus;
  location?: string;
  search?: string;
}

const vendorProfileAdminSelect = {
  id: true,
  userId: true,
  farmName: true,
  farmLocation: true,
  certificationStatus: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  },
} as const;

const upsertMyVendorProfile = async (vendorId: string, payload: UpsertVendorProfilePayload) => {
  const profile = await prisma.vendorProfile.upsert({
    where: {
      userId: vendorId,
    },
    update: {
      farmName: payload.farmName,
      farmLocation: payload.farmLocation,
    },
    create: {
      userId: vendorId,
      farmName: payload.farmName,
      farmLocation: payload.farmLocation,
    },
    select: vendorProfileAdminSelect,
  });

  return profile;
};

const getMyVendorProfile = async (vendorId: string) => {
  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: vendorId },
    select: vendorProfileAdminSelect,
  });

  if (!profile) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Vendor profile not found.');
  }

  return profile;
};

const getAllVendorProfiles = async (filters: VendorListFilters) => {
  const andConditions: Prisma.VendorProfileWhereInput[] = [];

  if (filters.certificationStatus) {
    andConditions.push({
      certificationStatus: filters.certificationStatus,
    });
  }

  if (filters.location) {
    andConditions.push({
      farmLocation: {
        contains: filters.location,
        mode: 'insensitive',
      },
    });
  }

  if (filters.search) {
    andConditions.push({
      OR: [
        {
          farmName: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          farmLocation: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          user: {
            name: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            email: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        },
      ],
    });
  }

  const where: Prisma.VendorProfileWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const [profiles, total] = await Promise.all([
    prisma.vendorProfile.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select: vendorProfileAdminSelect,
    }),
    prisma.vendorProfile.count({
      where,
    }),
  ]);

  return {
    profiles,
    total,
  };
};

const getVendorProfileById = async (profileId: string) => {
  const profile = await prisma.vendorProfile.findUnique({
    where: { id: profileId },
    select: {
      ...vendorProfileAdminSelect,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          sustainabilityCerts: {
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              certificationType: true,
              certifyingAgency: true,
              certificationDate: true,
              status: true,
              reviewNotes: true,
              reviewedAt: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!profile) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Vendor profile not found.');
  }

  return profile;
};

export const VendorService = {
  upsertMyVendorProfile,
  getMyVendorProfile,
  getAllVendorProfiles,
  getVendorProfileById,
};
