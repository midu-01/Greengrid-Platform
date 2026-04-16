import { Prisma, RentalAvailability, RentalBookingStatus } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { prisma } from '../../config/prisma';
import { AppError } from '../../errors/AppError';

interface CreateRentalSpacePayload {
  location: string;
  size: number;
  price: number;
  availability?: RentalAvailability;
}

interface UpdateRentalSpacePayload {
  location?: string;
  size?: number;
  price?: number;
  availability?: RentalAvailability;
}

interface RentalSpaceListFilters {
  location?: unknown;
  minSize?: unknown;
  maxSize?: unknown;
  minPrice?: unknown;
  maxPrice?: unknown;
}

interface BookRentalSpacePayload {
  startDate: Date;
  endDate: Date;
}

interface AdminBookingFilters {
  status?: RentalBookingStatus;
  vendorId?: string;
  customerId?: string;
}

const rentalSpacePublicSelect = {
  id: true,
  vendorId: true,
  location: true,
  size: true,
  price: true,
  availability: true,
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

const rentalBookingSelect = {
  id: true,
  rentalSpaceId: true,
  customerId: true,
  vendorId: true,
  startDate: true,
  endDate: true,
  totalPrice: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  rentalSpace: {
    select: {
      id: true,
      location: true,
      size: true,
      price: true,
      availability: true,
    },
  },
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  vendor: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

const getFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

const createRentalSpace = async (vendorId: string, payload: CreateRentalSpacePayload) => {
  return prisma.rentalSpace.create({
    data: {
      vendorId,
      location: payload.location,
      size: payload.size,
      price: new Prisma.Decimal(payload.price),
      availability: payload.availability ?? RentalAvailability.AVAILABLE,
    },
    select: rentalSpacePublicSelect,
  });
};

const getMyRentalSpaces = async (vendorId: string) => {
  return prisma.rentalSpace.findMany({
    where: {
      vendorId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: rentalSpacePublicSelect,
  });
};

const updateRentalSpace = async (
  vendorId: string,
  rentalSpaceId: string,
  payload: UpdateRentalSpacePayload
) => {
  const existingRentalSpace = await prisma.rentalSpace.findUnique({
    where: { id: rentalSpaceId },
    select: {
      id: true,
      vendorId: true,
    },
  });

  if (!existingRentalSpace) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Rental space not found.');
  }

  if (existingRentalSpace.vendorId !== vendorId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You are not allowed to update this rental space.');
  }

  const data: Prisma.RentalSpaceUpdateInput = {};

  if (payload.location !== undefined) {
    data.location = payload.location;
  }

  if (payload.size !== undefined) {
    data.size = payload.size;
  }

  if (payload.price !== undefined) {
    data.price = new Prisma.Decimal(payload.price);
  }

  if (payload.availability !== undefined) {
    data.availability = payload.availability;
  }

  return prisma.rentalSpace.update({
    where: {
      id: rentalSpaceId,
    },
    data,
    select: rentalSpacePublicSelect,
  });
};

const deleteRentalSpace = async (vendorId: string, rentalSpaceId: string) => {
  const existingRentalSpace = await prisma.rentalSpace.findUnique({
    where: { id: rentalSpaceId },
    select: {
      id: true,
      vendorId: true,
    },
  });

  if (!existingRentalSpace) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Rental space not found.');
  }

  if (existingRentalSpace.vendorId !== vendorId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You are not allowed to delete this rental space.');
  }

  return prisma.rentalSpace.delete({
    where: {
      id: rentalSpaceId,
    },
    select: {
      id: true,
      location: true,
      availability: true,
      vendorId: true,
    },
  });
};

const getAvailableRentalSpaces = async (filters: RentalSpaceListFilters) => {
  const minSize = getFiniteNumber(filters.minSize);
  const maxSize = getFiniteNumber(filters.maxSize);
  const minPrice = getFiniteNumber(filters.minPrice);
  const maxPrice = getFiniteNumber(filters.maxPrice);

  const where: Prisma.RentalSpaceWhereInput = {
    availability: RentalAvailability.AVAILABLE,
  };

  if (typeof filters.location === 'string' && filters.location.trim().length > 0) {
    where.location = {
      contains: filters.location.trim(),
      mode: 'insensitive',
    };
  }

  if (minSize !== undefined || maxSize !== undefined) {
    where.size = {
      ...(minSize !== undefined ? { gte: minSize } : {}),
      ...(maxSize !== undefined ? { lte: maxSize } : {}),
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };
  }

  const [spaces, total] = await Promise.all([
    prisma.rentalSpace.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select: rentalSpacePublicSelect,
    }),
    prisma.rentalSpace.count({
      where,
    }),
  ]);

  return {
    spaces,
    total,
  };
};

const getRentalSpaceById = async (rentalSpaceId: string) => {
  const rentalSpace = await prisma.rentalSpace.findUnique({
    where: {
      id: rentalSpaceId,
    },
    select: rentalSpacePublicSelect,
  });

  if (!rentalSpace) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Rental space not found.');
  }

  return rentalSpace;
};

const bookRentalSpace = async (
  customerId: string,
  rentalSpaceId: string,
  payload: BookRentalSpacePayload
) => {
  const now = new Date();
  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid booking dates.');
  }

  if (startDate < now) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Booking startDate cannot be in the past.');
  }

  const booking = await prisma.$transaction(async (tx) => {
    const rentalSpace = await tx.rentalSpace.findUnique({
      where: {
        id: rentalSpaceId,
      },
      select: {
        id: true,
        vendorId: true,
        price: true,
        availability: true,
      },
    });

    if (!rentalSpace) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Rental space not found.');
    }

    if (rentalSpace.vendorId === customerId) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'You cannot book your own rental space.');
    }

    if (rentalSpace.availability !== RentalAvailability.AVAILABLE) {
      throw new AppError(StatusCodes.CONFLICT, 'Rental space is not available for booking.');
    }

    const overlappingBooking = await tx.rentalBooking.findFirst({
      where: {
        rentalSpaceId,
        status: RentalBookingStatus.CONFIRMED,
        startDate: {
          lt: endDate,
        },
        endDate: {
          gt: startDate,
        },
      },
      select: {
        id: true,
      },
    });

    if (overlappingBooking) {
      throw new AppError(
        StatusCodes.CONFLICT,
        'Rental space already has a conflicting booking for the requested date range.'
      );
    }

    const updated = await tx.rentalSpace.updateMany({
      where: {
        id: rentalSpaceId,
        availability: RentalAvailability.AVAILABLE,
      },
      data: {
        availability: RentalAvailability.OCCUPIED,
      },
    });

    if (updated.count === 0) {
      throw new AppError(StatusCodes.CONFLICT, 'Rental space was booked by another user. Try again.');
    }

    const millisecondsInDay = 1000 * 60 * 60 * 24;
    const durationInDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / millisecondsInDay));
    const totalPrice = new Prisma.Decimal(rentalSpace.price).mul(durationInDays);

    return tx.rentalBooking.create({
      data: {
        rentalSpaceId,
        customerId,
        vendorId: rentalSpace.vendorId,
        startDate,
        endDate,
        totalPrice,
        status: RentalBookingStatus.CONFIRMED,
      },
      select: rentalBookingSelect,
    });
  });

  return booking;
};

const getMyBookings = async (customerId: string) => {
  return prisma.rentalBooking.findMany({
    where: {
      customerId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: rentalBookingSelect,
  });
};

const getAdminBookings = async (filters: AdminBookingFilters) => {
  const where: Prisma.RentalBookingWhereInput = {
    status: filters.status,
    vendorId: filters.vendorId,
    customerId: filters.customerId,
  };

  const [bookings, total] = await Promise.all([
    prisma.rentalBooking.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select: rentalBookingSelect,
    }),
    prisma.rentalBooking.count({
      where,
    }),
  ]);

  return {
    bookings,
    total,
  };
};

export const RentalSpaceService = {
  createRentalSpace,
  getMyRentalSpaces,
  updateRentalSpace,
  deleteRentalSpace,
  getAvailableRentalSpaces,
  getRentalSpaceById,
  bookRentalSpace,
  getMyBookings,
  getAdminBookings,
};
