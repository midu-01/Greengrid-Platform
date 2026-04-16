-- CreateTable
CREATE TABLE "PlantTracking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rentalBookingId" TEXT,
    "plantName" TEXT NOT NULL,
    "growthStage" TEXT NOT NULL,
    "healthStatus" TEXT NOT NULL,
    "expectedHarvestDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantTracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlantTracking_userId_idx" ON "PlantTracking"("userId");

-- CreateIndex
CREATE INDEX "PlantTracking_rentalBookingId_idx" ON "PlantTracking"("rentalBookingId");

-- CreateIndex
CREATE INDEX "PlantTracking_updatedAt_idx" ON "PlantTracking"("updatedAt");

-- CreateIndex
CREATE INDEX "PlantTracking_userId_updatedAt_idx" ON "PlantTracking"("userId", "updatedAt");

-- AddForeignKey
ALTER TABLE "PlantTracking" ADD CONSTRAINT "PlantTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantTracking" ADD CONSTRAINT "PlantTracking_rentalBookingId_fkey" FOREIGN KEY ("rentalBookingId") REFERENCES "RentalBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
