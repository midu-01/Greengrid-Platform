import { CertificationStatus, CertificationType } from '@prisma/client';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../errors/AppError';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { CertificationService } from './certification.service';

const submitCertification = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const result = await CertificationService.submitCertification(req.user.userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Certification submitted successfully.',
    data: result,
  });
});

const getMyCertifications = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const statusQuery = req.query.status;

  const result = await CertificationService.getMyCertifications(req.user.userId, {
    status: typeof statusQuery === 'string' ? (statusQuery as CertificationStatus) : undefined,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Your certifications fetched successfully.',
    data: result,
  });
});

const getAllCertifications = catchAsync(async (req: Request, res: Response) => {
  const statusQuery = req.query.status;
  const vendorIdQuery = req.query.vendorId;
  const certificationTypeQuery = req.query.certificationType;

  const result = await CertificationService.getAllCertifications({
    status: typeof statusQuery === 'string' ? (statusQuery as CertificationStatus) : undefined,
    vendorId: typeof vendorIdQuery === 'string' ? vendorIdQuery : undefined,
    certificationType:
      typeof certificationTypeQuery === 'string'
        ? (certificationTypeQuery as CertificationType)
        : undefined,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Certifications fetched successfully.',
    data: result.certifications,
    meta: {
      total: result.total,
    },
  });
});

const getCertificationById = catchAsync(async (req: Request, res: Response) => {
  const certificationId = req.params.id;

  if (typeof certificationId !== 'string') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid certification id.');
  }

  const result = await CertificationService.getCertificationById(certificationId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Certification details fetched successfully.',
    data: result,
  });
});

const reviewCertification = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const certificationId = req.params.id;

  if (typeof certificationId !== 'string') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid certification id.');
  }

  const result = await CertificationService.reviewCertification(certificationId, req.user.userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Certification reviewed successfully.',
    data: result,
  });
});

export const CertificationController = {
  submitCertification,
  getMyCertifications,
  getAllCertifications,
  getCertificationById,
  reviewCertification,
};
