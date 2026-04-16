import { RentalBookingStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../errors/AppError';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { RentalSpaceService } from './rentalSpace.service';

const createRentalSpace = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const result = await RentalSpaceService.createRentalSpace(req.user.userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Rental space created successfully.',
    data: result,
  });
});

const getMyRentalSpaces = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const result = await RentalSpaceService.getMyRentalSpaces(req.user.userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Your rental spaces fetched successfully.',
    data: result,
  });
});

const updateRentalSpace = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const rentalSpaceId = req.params.id;

  if (typeof rentalSpaceId !== 'string') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid rental space id.');
  }

  const result = await RentalSpaceService.updateRentalSpace(req.user.userId, rentalSpaceId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Rental space updated successfully.',
    data: result,
  });
});

const deleteRentalSpace = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const rentalSpaceId = req.params.id;

  if (typeof rentalSpaceId !== 'string') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid rental space id.');
  }

  const result = await RentalSpaceService.deleteRentalSpace(req.user.userId, rentalSpaceId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Rental space deleted successfully.',
    data: result,
  });
});

const getAvailableRentalSpaces = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalSpaceService.getAvailableRentalSpaces(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Available rental spaces fetched successfully.',
    data: result.spaces,
    meta: {
      total: result.total,
    },
  });
});

const getRentalSpaceById = catchAsync(async (req: Request, res: Response) => {
  const rentalSpaceId = req.params.id;

  if (typeof rentalSpaceId !== 'string') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid rental space id.');
  }

  const result = await RentalSpaceService.getRentalSpaceById(rentalSpaceId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Rental space details fetched successfully.',
    data: result,
  });
});

const bookRentalSpace = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const rentalSpaceId = req.params.id;

  if (typeof rentalSpaceId !== 'string') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid rental space id.');
  }

  const result = await RentalSpaceService.bookRentalSpace(req.user.userId, rentalSpaceId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Rental space booked successfully.',
    data: result,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const result = await RentalSpaceService.getMyBookings(req.user.userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Your rental bookings fetched successfully.',
    data: result,
  });
});

const getAdminBookings = catchAsync(async (req: Request, res: Response) => {
  const statusQuery = req.query.status;
  const vendorIdQuery = req.query.vendorId;
  const customerIdQuery = req.query.customerId;

  const result = await RentalSpaceService.getAdminBookings({
    status: typeof statusQuery === 'string' ? (statusQuery as RentalBookingStatus) : undefined,
    vendorId: typeof vendorIdQuery === 'string' ? vendorIdQuery : undefined,
    customerId: typeof customerIdQuery === 'string' ? customerIdQuery : undefined,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Rental bookings fetched successfully.',
    data: result.bookings,
    meta: {
      total: result.total,
    },
  });
});

export const RentalSpaceController = {
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
