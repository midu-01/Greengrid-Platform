import { CertificationStatus, CertificationType, Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { prisma } from '../../config/prisma';
import { AppError } from '../../errors/AppError';

interface SubmitCertificationPayload {
  certificationType: CertificationType;
  certifyingAgency: string;
  certificationNumber?: string;
  certificationDate: Date;
  documentUrl?: string;
}

interface ReviewCertificationPayload {
  status: CertificationStatus;
  reviewNotes?: string;
}

interface CertificationListFilters {
  status?: CertificationStatus;
  vendorId?: string;
  certificationType?: CertificationType;
}

const certificationSelect = {
  id: true,
  vendorId: true,
  certificationType: true,
  certifyingAgency: true,
  certificationNumber: true,
  certificationDate: true,
  documentUrl: true,
  status: true,
  reviewNotes: true,
  reviewedAt: true,
  reviewedById: true,
  createdAt: true,
  updatedAt: true,
} as const;

const submitCertification = async (vendorId: string, payload: SubmitCertificationPayload) => {
  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId: vendorId },
    select: {
      id: true,
    },
  });

  if (!vendorProfile) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Vendor profile is required before submitting certification.'
    );
  }

  const pendingCertification = await prisma.sustainabilityCert.findFirst({
    where: {
      vendorId,
      status: CertificationStatus.PENDING,
    },
    select: {
      id: true,
    },
  });

  if (pendingCertification) {
    throw new AppError(
      StatusCodes.CONFLICT,
      'A pending certification already exists. Wait for admin review.'
    );
  }

  const certification = await prisma.$transaction(async (tx) => {
    const createdCertification = await tx.sustainabilityCert.create({
      data: {
        vendorId,
        certificationType: payload.certificationType,
        certifyingAgency: payload.certifyingAgency,
        certificationNumber: payload.certificationNumber,
        certificationDate: payload.certificationDate,
        documentUrl: payload.documentUrl,
        status: CertificationStatus.PENDING,
      },
      select: certificationSelect,
    });

    await tx.vendorProfile.update({
      where: {
        userId: vendorId,
      },
      data: {
        certificationStatus: CertificationStatus.PENDING,
      },
    });

    return createdCertification;
  });

  return certification;
};

const getMyCertifications = async (vendorId: string, filters: Pick<CertificationListFilters, 'status'>) => {
  return prisma.sustainabilityCert.findMany({
    where: {
      vendorId,
      status: filters.status,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      ...certificationSelect,
      reviewedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

const getAllCertifications = async (filters: CertificationListFilters) => {
  const where: Prisma.SustainabilityCertWhereInput = {
    status: filters.status,
    vendorId: filters.vendorId,
    certificationType: filters.certificationType,
  };

  const [certifications, total] = await Promise.all([
    prisma.sustainabilityCert.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        ...certificationSelect,
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
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.sustainabilityCert.count({
      where,
    }),
  ]);

  return {
    certifications,
    total,
  };
};

const getCertificationById = async (certificationId: string) => {
  const certification = await prisma.sustainabilityCert.findUnique({
    where: { id: certificationId },
    select: {
      ...certificationSelect,
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
      reviewedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!certification) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Certification not found.');
  }

  return certification;
};

const reviewCertification = async (
  certificationId: string,
  adminId: string,
  payload: ReviewCertificationPayload
) => {
  const existingCertification = await prisma.sustainabilityCert.findUnique({
    where: { id: certificationId },
    select: {
      id: true,
      status: true,
      vendorId: true,
    },
  });

  if (!existingCertification) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Certification not found.');
  }

  if (existingCertification.status !== CertificationStatus.PENDING) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Certification has already been reviewed.');
  }

  const reviewedCertification = await prisma.$transaction(async (tx) => {
    const updatedCertification = await tx.sustainabilityCert.update({
      where: {
        id: certificationId,
      },
      data: {
        status: payload.status,
        reviewNotes: payload.reviewNotes,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
      select: {
        ...certificationSelect,
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await tx.vendorProfile.update({
      where: {
        userId: existingCertification.vendorId,
      },
      data: {
        certificationStatus: payload.status,
      },
    });

    return updatedCertification;
  });

  return reviewedCertification;
};

const hasApprovedCertification = async (vendorId: string): Promise<boolean> => {
  const profile = await prisma.vendorProfile.findUnique({
    where: {
      userId: vendorId,
    },
    select: {
      certificationStatus: true,
    },
  });

  return profile?.certificationStatus === CertificationStatus.APPROVED;
};

export const CertificationService = {
  submitCertification,
  getMyCertifications,
  getAllCertifications,
  getCertificationById,
  reviewCertification,
  hasApprovedCertification,
};
