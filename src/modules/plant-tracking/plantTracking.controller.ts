import { UserRole } from '@prisma/client';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../errors/AppError';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { PlantTrackingService } from './plantTracking.service';

const getAuthenticatedUser = (req: Request) => {
  if (!req.user?.userId || !req.user.role) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  return {
    userId: req.user.userId,
    role: req.user.role,
  };
};

const createTrackingRecord = catchAsync(async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);

  const result = await PlantTrackingService.createTrackingRecord(user.userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Plant tracking record created successfully.',
    data: result,
  });
});

const updateTrackingRecord = catchAsync(async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const trackingId = req.params.id;

  if (typeof trackingId !== 'string') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid plant tracking id.');
  }

  const result = await PlantTrackingService.updateTrackingRecord(
    user.userId,
    user.role as UserRole,
    trackingId,
    req.body
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Plant tracking record updated successfully.',
    data: result,
  });
});

const listMyTrackingRecords = catchAsync(async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);

  const result = await PlantTrackingService.listMyTrackingRecords(user.userId, {
    page: req.query.page,
    limit: req.query.limit,
    rentalBookingId:
      typeof req.query.rentalBookingId === 'string' ? req.query.rentalBookingId : undefined,
    growthStage: typeof req.query.growthStage === 'string' ? req.query.growthStage : undefined,
    healthStatus: typeof req.query.healthStatus === 'string' ? req.query.healthStatus : undefined,
    updatedAfter: req.query.updatedAfter instanceof Date ? req.query.updatedAfter : undefined,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Your plant tracking records fetched successfully.',
    data: result.records,
    meta: result.meta,
  });
});

const listMyTrackingUpdates = catchAsync(async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);

  const limitQuery = req.query.limit;
  const limit = typeof limitQuery === 'number' ? limitQuery : undefined;

  const result = await PlantTrackingService.listMyTrackingUpdates(
    user.userId,
    {
      updatedAfter: req.query.updatedAfter instanceof Date ? req.query.updatedAfter : undefined,
    },
    limit
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Plant tracking updates fetched successfully.',
    data: result.updates,
    meta: result.meta,
  });
});

const listVisibleTrackingRecords = catchAsync(async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);

  const result = await PlantTrackingService.listVisibleTrackingRecords(
    user.userId,
    user.role as UserRole,
    {
      page: req.query.page,
      limit: req.query.limit,
      userId: typeof req.query.userId === 'string' ? req.query.userId : undefined,
      vendorId: typeof req.query.vendorId === 'string' ? req.query.vendorId : undefined,
      rentalBookingId:
        typeof req.query.rentalBookingId === 'string' ? req.query.rentalBookingId : undefined,
      growthStage: typeof req.query.growthStage === 'string' ? req.query.growthStage : undefined,
      healthStatus: typeof req.query.healthStatus === 'string' ? req.query.healthStatus : undefined,
      updatedAfter: req.query.updatedAfter instanceof Date ? req.query.updatedAfter : undefined,
    }
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Plant tracking records fetched successfully.',
    data: result.records,
    meta: result.meta,
  });
});

const getTrackingRecordById = catchAsync(async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const trackingId = req.params.id;

  if (typeof trackingId !== 'string') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid plant tracking id.');
  }

  const result = await PlantTrackingService.getTrackingRecordById(
    user.userId,
    user.role as UserRole,
    trackingId
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Plant tracking record fetched successfully.',
    data: result,
  });
});

export const PlantTrackingController = {
  createTrackingRecord,
  updateTrackingRecord,
  listMyTrackingRecords,
  listMyTrackingUpdates,
  listVisibleTrackingRecords,
  getTrackingRecordById,
};
