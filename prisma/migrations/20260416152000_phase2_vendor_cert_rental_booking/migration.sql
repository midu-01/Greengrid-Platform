-- CreateEnum
CREATE TYPE "CertificationType" AS ENUM ('SUSTAINABILITY', 'ORGANIC');

-- CreateEnum
CREATE TYPE "RentalBookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'COMPLETED');

-- AlterTable
ALTER TABLE "SustainabilityCert"
ADD COLUMN "certificationNumber" TEXT,
ADD COLUMN "certificationType" "CertificationType" NOT NULL DEFAULT 'SUSTAINABILITY',
ADD COLUMN "documentUrl" TEXT,
ADD COLUMN "reviewNotes" TEXT,
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "reviewedById" TEXT,
ADD COLUMN "status" "CertificationStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "RentalBooking" (
    "id" TEXT NOT NULL,
    "rentalSpaceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "status" "RentalBookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorProfile_certificationStatus_idx" ON "VendorProfile"("certificationStatus");

-- CreateIndex
CREATE INDEX "VendorProfile_farmLocation_idx" ON "VendorProfile"("farmLocation");

-- CreateIndex
CREATE INDEX "RentalSpace_location_idx" ON "RentalSpace"("location");

-- CreateIndex
CREATE INDEX "SustainabilityCert_status_idx" ON "SustainabilityCert"("status");

-- CreateIndex
CREATE INDEX "SustainabilityCert_reviewedById_idx" ON "SustainabilityCert"("reviewedById");

-- CreateIndex
CREATE INDEX "RentalBooking_rentalSpaceId_idx" ON "RentalBooking"("rentalSpaceId");

-- CreateIndex
CREATE INDEX "RentalBooking_customerId_idx" ON "RentalBooking"("customerId");

-- CreateIndex
CREATE INDEX "RentalBooking_vendorId_idx" ON "RentalBooking"("vendorId");

-- CreateIndex
CREATE INDEX "RentalBooking_status_idx" ON "RentalBooking"("status");

-- CreateIndex
CREATE INDEX "RentalBooking_startDate_endDate_idx" ON "RentalBooking"("startDate", "endDate");

-- AddForeignKey
ALTER TABLE "SustainabilityCert" ADD CONSTRAINT "SustainabilityCert_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalBooking" ADD CONSTRAINT "RentalBooking_rentalSpaceId_fkey" FOREIGN KEY ("rentalSpaceId") REFERENCES "RentalSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalBooking" ADD CONSTRAINT "RentalBooking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalBooking" ADD CONSTRAINT "RentalBooking_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
