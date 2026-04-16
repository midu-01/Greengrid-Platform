-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';

-- AlterTable
ALTER TABLE "Order"
ADD COLUMN "quantity" INTEGER,
ADD COLUMN "unitPrice" DECIMAL(10,2),
ADD COLUMN "totalPrice" DECIMAL(12,2);

UPDATE "Order"
SET
  "quantity" = COALESCE("quantity", 1),
  "unitPrice" = COALESCE("unitPrice", 0),
  "totalPrice" = COALESCE("totalPrice", 0)
WHERE "quantity" IS NULL OR "unitPrice" IS NULL OR "totalPrice" IS NULL;

ALTER TABLE "Order"
ALTER COLUMN "quantity" SET NOT NULL,
ALTER COLUMN "unitPrice" SET NOT NULL,
ALTER COLUMN "totalPrice" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Produce_certificationStatus_idx" ON "Produce"("certificationStatus");

-- CreateIndex
CREATE INDEX "Produce_name_idx" ON "Produce"("name");

-- CreateIndex
CREATE INDEX "Order_orderDate_idx" ON "Order"("orderDate");

-- CreateIndex
CREATE INDEX "Order_userId_status_idx" ON "Order"("userId", "status");

-- CreateIndex
CREATE INDEX "Order_vendorId_status_idx" ON "Order"("vendorId", "status");
