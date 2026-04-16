import { Prisma, RentalBookingStatus, UserRole } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { prisma } from '../../config/prisma';
import { AppError } from '../../errors/AppError';
import { buildPaginationMeta, getPaginationOptions } from '../../helpers/paginationHelper';

interface CreatePlantTrackingPayload {
  rentalBookingId?: string;
  plantName: string;
  growthStage: string;
  healthStatus: string;
  expectedHarvestDate?: Date;
  notes?: string;
}

interface UpdatePlantTrackingPayload {
  rentalBookingId?: string;
  plantName?: string;
  growthStage?: string;
  healthStatus?: string;
  expectedHarvestDate?: Date;
  notes?: string;
}

interface PlantTrackingListFilters {
  page?: unknown;
  limit?: unknown;
  userId?: string;
  vendorId?: string;
  rentalBookingId?: string;
  growthStage?: string;
  healthStatus?: string;
  updatedAfter?: Date;
}

const plantTrackingSelect = {
  id: true,
  userId: true,
  rentalBookingId: true,
  plantName: true,
  growthStage: true,
  healthStatus: true,
  expectedHarvestDate: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
  rentalBooking: {
    select: {
      id: true,
      customerId: true,
      vendorId: true,
      startDate: true,
      endDate: true,
      status: true,
      rentalSpace: {
        select: {
          id: true,
          location: true,
          size: true,
          price: true,
          availability: true,
        },
      },
    },
  },
} as const;

const getBookingForPlantTracking = async (rentalBookingId: string) => {
  const booking = await prisma.rentalBooking.findUnique({
    where: {
      id: rentalBookingId,
    },
    select: {
      id: true,
      customerId: true,
      vendorId: true,
      status: true,
    },
  });

  if (!booking) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Rental booking not found for this plant tracking record.');
  }

  if (booking.status === RentalBookingStatus.CANCELLED) {
    throw new AppError(
      StatusCodes.CONFLICT,
      'Cannot attach plant tracking to a cancelled rental booking.'
    );
  }

  return booking;
};

const createTrackingRecord = async (customerId: string, payload: CreatePlantTrackingPayload) => {
  if (payload.rentalBookingId) {
    const booking = await getBookingForPlantTracking(payload.rentalBookingId);

    if (booking.customerId !== customerId) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'You can only create plant tracking records for your own rental bookings.'
      );
    }
  }

  return prisma.plantTracking.create({
    data: {
      userId: customerId,
      rentalBookingId: payload.rentalBookingId,
      plantName: payload.plantName,
      growthStage: payload.growthStage,
      healthStatus: payload.healthStatus,
      expectedHarvestDate: payload.expectedHarvestDate,
      notes: payload.notes,
    },
    select: plantTrackingSelect,
  });
};

const getTrackingRecordById = async (actorId: string, actorRole: UserRole, trackingId: string) => {
  const tracking = await prisma.plantTracking.findUnique({
    where: {
      id: trackingId,
    },
    select: plantTrackingSelect,
  });

  if (!tracking) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Plant tracking record not found.');
  }

  if (actorRole === UserRole.CUSTOMER && tracking.userId !== actorId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You are not allowed to access this plant tracking record.');
  }

  if (actorRole === UserRole.VENDOR) {
    const vendorId = tracking.rentalBooking?.vendorId;

    if (!vendorId || vendorId !== actorId) {
      throw new AppError(StatusCodes.FORBIDDEN, 'You are not allowed to access this plant tracking record.');
    }
  }

  return tracking;
};

const buildTrackingFilters = (filters: PlantTrackingListFilters): Prisma.PlantTrackingWhereInput => {
  const andConditions: Prisma.PlantTrackingWhereInput[] = [];

  if (filters.userId) {
    andConditions.push({
      userId: filters.userId,
    });
  }

  if (filters.rentalBookingId) {
    andConditions.push({
      rentalBookingId: filters.rentalBookingId,
    });
  }

  if (filters.growthStage) {
    andConditions.push({
      growthStage: filters.growthStage,
    });
  }

  if (filters.healthStatus) {
    andConditions.push({
      healthStatus: filters.healthStatus,
    });
  }

  if (filters.updatedAfter) {
    andConditions.push({
      updatedAt: {
        gt: filters.updatedAfter,
      },
    });
  }

  if (filters.vendorId) {
    andConditions.push({
      rentalBooking: {
        is: {
          vendorId: filters.vendorId,
        },
      },
    });
  }

  return andConditions.length > 0
    ? {
        AND: andConditions,
      }
    : {};
};

const listMyTrackingRecords = async (customerId: string, filters: Omit<PlantTrackingListFilters, 'vendorId'>) => {
  const pagination = getPaginationOptions({
    page: filters.page,
    limit: filters.limit,
  });

  const where = buildTrackingFilters({
    ...filters,
    userId: customerId,
  });

  const [records, total] = await Promise.all([
    prisma.plantTracking.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
      skip: pagination.skip,
      take: pagination.limit,
      select: plantTrackingSelect,
    }),
    prisma.plantTracking.count({
      where,
    }),
  ]);

  return {
    records,
    meta: buildPaginationMeta(total, pagination),
  };
};

const listMyTrackingUpdates = async (
  customerId: string,
  filters: Pick<PlantTrackingListFilters, 'updatedAfter'>,
  limit = 25
) => {
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const where = buildTrackingFilters({
    userId: customerId,
    updatedAfter: filters.updatedAfter,
  });

  const updates = await prisma.plantTracking.findMany({
    where,
    orderBy: {
      updatedAt: 'asc',
    },
    take: safeLimit,
    select: plantTrackingSelect,
  });

  return {
    updates,
    meta: {
      count: updates.length,
      latestUpdatedAt:
        updates.length > 0
          ? updates[updates.length - 1].updatedAt.toISOString()
          : filters.updatedAfter?.toISOString() ?? null,
      serverTime: new Date().toISOString(),
    },
  };
};

const listVisibleTrackingRecords = async (
  actorId: string,
  actorRole: UserRole,
  filters: PlantTrackingListFilters
) => {
  const pagination = getPaginationOptions({
    page: filters.page,
    limit: filters.limit,
  });

  const where = buildTrackingFilters({
    ...filters,
    vendorId: actorRole === UserRole.ADMIN ? filters.vendorId : actorId,
  });

  const [records, total] = await Promise.all([
    prisma.plantTracking.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
      skip: pagination.skip,
      take: pagination.limit,
      select: plantTrackingSelect,
    }),
    prisma.plantTracking.count({
      where,
    }),
  ]);

  return {
    records,
    meta: buildPaginationMeta(total, pagination),
  };
};

const updateTrackingRecord = async (
  actorId: string,
  actorRole: UserRole,
  trackingId: string,
  payload: UpdatePlantTrackingPayload
) => {
  const existingTracking = await prisma.plantTracking.findUnique({
    where: {
      id: trackingId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!existingTracking) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Plant tracking record not found.');
  }

  if (actorRole === UserRole.CUSTOMER && existingTracking.userId !== actorId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You are not allowed to update this plant tracking record.');
  }

  const data: Prisma.PlantTrackingUpdateInput = {};

  if (payload.rentalBookingId !== undefined) {
    const booking = await getBookingForPlantTracking(payload.rentalBookingId);

    if (booking.customerId !== existingTracking.userId) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'The selected rental booking does not belong to the plant tracking owner.'
      );
    }

    data.rentalBooking = {
      connect: {
        id: booking.id,
      },
    };
  }

  if (payload.plantName !== undefined) {
    data.plantName = payload.plantName;
  }

  if (payload.growthStage !== undefined) {
    data.growthStage = payload.growthStage;
  }

  if (payload.healthStatus !== undefined) {
    data.healthStatus = payload.healthStatus;
  }

  if (payload.expectedHarvestDate !== undefined) {
    data.expectedHarvestDate = payload.expectedHarvestDate;
  }

  if (payload.notes !== undefined) {
    data.notes = payload.notes;
  }

  return prisma.plantTracking.update({
    where: {
      id: existingTracking.id,
    },
    data,
    select: plantTrackingSelect,
  });
};

export const PlantTrackingService = {
  createTrackingRecord,
  getTrackingRecordById,
  listMyTrackingRecords,
  listMyTrackingUpdates,
  listVisibleTrackingRecords,
  updateTrackingRecord,
};
