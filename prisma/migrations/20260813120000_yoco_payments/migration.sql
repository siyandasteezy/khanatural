-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'AWAITING', 'PAID', 'FAILED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentCardBrand" TEXT,
ADD COLUMN     "paymentCardLast4" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "yocoCheckoutId" TEXT,
ADD COLUMN     "yocoPaymentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_yocoCheckoutId_key" ON "Order"("yocoCheckoutId");

-- CreateIndex
CREATE INDEX "Order_paymentStatus_createdAt_idx" ON "Order"("paymentStatus", "createdAt");

