import { CertificationStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../errors/AppError';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { VendorService } from './vendor.service';

const upsertMyVendorProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const result = await VendorService.upsertMyVendorProfile(req.user.userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Vendor profile saved successfully.',
    data: result,
  });
});

const getMyVendorProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const result = await VendorService.getMyVendorProfile(req.user.userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Vendor profile fetched successfully.',
    data: result,
  });
});

const getAllVendorProfiles = catchAsync(async (req: Request, res: Response) => {
  const certificationStatusQuery = req.query.certificationStatus;
  const locationQuery = req.query.location;
  const searchQuery = req.query.search;

  const result = await VendorService.getAllVendorProfiles({
    certificationStatus:
      typeof certificationStatusQuery === 'string'
        ? (certificationStatusQuery as CertificationStatus)
        : undefined,
    location: typeof locationQuery === 'string' ? locationQuery : undefined,
    search: typeof searchQuery === 'string' ? searchQuery : undefined,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Vendor profiles fetched successfully.',
    data: result.profiles,
    meta: {
      total: result.total,
    },
  });
});

const getVendorProfileById = catchAsync(async (req: Request, res: Response) => {
  const profileId = req.params.id;

  if (typeof profileId !== 'string') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid vendor profile id.');
  }

  const result = await VendorService.getVendorProfileById(profileId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Vendor profile details fetched successfully.',
    data: result,
  });
});

export const VendorController = {
  upsertMyVendorProfile,
  getMyVendorProfile,
  getAllVendorProfiles,
  getVendorProfileById,
};
