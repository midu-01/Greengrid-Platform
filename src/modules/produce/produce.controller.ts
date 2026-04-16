import { CertificationStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../errors/AppError';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { ProduceService } from './produce.service';

const createProduce = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const result = await ProduceService.createProduce(req.user.userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Produce listing created successfully.',
    data: result,
  });
});

const updateProduce = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const produceId = req.params.id;

  if (typeof produceId !== 'string') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid produce id.');
  }

  const result = await ProduceService.updateProduce(req.user.userId, produceId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Produce listing updated successfully.',
    data: result,
  });
});

const deleteProduce = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated.');
  }

  const produceId = req.params.id;

  if (typeof produceId !== 'string') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid produce id.');
  }

  const result = await ProduceService.deleteProduce(req.user.userId, produceId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Produce listing deleted successfully.',
    data: result,
  });
});

const getProduceListings = catchAsync(async (req: Request, res: Response) => {
  const categoryQuery = req.query.category;
  const vendorIdQuery = req.query.vendorId;
  const certificationStatusQuery = req.query.certificationStatus;
  const searchQuery = req.query.search;
  const pageQuery = req.query.page;
  const limitQuery = req.query.limit;

  const result = await ProduceService.getProduceListings({
    page: pageQuery,
    limit: limitQuery,
    category: typeof categoryQuery === 'string' ? categoryQuery : undefined,
    vendorId: typeof vendorIdQuery === 'string' ? vendorIdQuery : undefined,
    certificationStatus:
      typeof certificationStatusQuery === 'string'
        ? (certificationStatusQuery as CertificationStatus)
        : undefined,
    search: typeof searchQuery === 'string' ? searchQuery : undefined,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Produce listings fetched successfully.',
    data: result.produces,
    meta: result.meta,
  });
});

const getProduceById = catchAsync(async (req: Request, res: Response) => {
  const produceId = req.params.id;

  if (typeof produceId !== 'string') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid produce id.');
  }

  const result = await ProduceService.getProduceById(produceId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Produce details fetched successfully.',
    data: result,
  });
});

export const ProduceController = {
  createProduce,
  updateProduce,
  deleteProduce,
  getProduceListings,
  getProduceById,
};

