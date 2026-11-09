-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('REQUESTED', 'QUOTED', 'AWAITING_PAYMENT', 'IN_PROGRESS', 'SKETCH_REVIEW', 'DELIVERED', 'DECLINED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UsageType" AS ENUM ('PERSONAL', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('CREATED', 'STATUS_CHANGED', 'QUOTE_SENT', 'QUOTE_APPROVED', 'PAYMENT_RECORDED', 'NOTE');

-- CreateEnum
CREATE TYPE "EventActor" AS ENUM ('ARTIST', 'CLIENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "PaymentKind" AS ENUM ('DEPOSIT', 'FINAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MANUAL');

-- CreateTable
CREATE TABLE "portfolio_images" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_types" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "basePriceMinor" INTEGER NOT NULL,
    "turnaroundDays" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commission_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "commissionTypeId" TEXT NOT NULL,
    "typeNameSnapshot" TEXT NOT NULL,
    "basePriceMinorSnapshot" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "usage" "UsageType" NOT NULL,
    "deadline" DATE,
    "status" "RequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "quotedPriceMinor" INTEGER,
    "quoteSentAt" TIMESTAMP(3),
    "quoteApprovedAt" TIMESTAMP(3),
    "trackingTokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_files" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "originalName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_events" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "actor" "EventActor" NOT NULL,
    "fromStatus" "RequestStatus",
    "toStatus" "RequestStatus",
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "kind" "PaymentKind" NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" "PaymentMethod" NOT NULL DEFAULT 'MANUAL',
    "provider" TEXT,
    "providerRef" TEXT,
    "paidAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "portfolio_images_artistId_sortOrder_idx" ON "portfolio_images"("artistId", "sortOrder");

-- CreateIndex
CREATE INDEX "commission_types_artistId_sortOrder_idx" ON "commission_types"("artistId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "commission_types_id_artistId_key" ON "commission_types"("id", "artistId");

-- CreateIndex
CREATE UNIQUE INDEX "requests_trackingTokenHash_key" ON "requests"("trackingTokenHash");

-- CreateIndex
CREATE INDEX "requests_artistId_status_idx" ON "requests"("artistId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "requests_id_artistId_key" ON "requests"("id", "artistId");

-- CreateIndex
CREATE INDEX "request_files_artistId_requestId_idx" ON "request_files"("artistId", "requestId");

-- CreateIndex
CREATE INDEX "request_events_artistId_requestId_createdAt_idx" ON "request_events"("artistId", "requestId", "createdAt");

-- CreateIndex
CREATE INDEX "payments_artistId_requestId_idx" ON "payments"("artistId", "requestId");

-- AddForeignKey
ALTER TABLE "portfolio_images" ADD CONSTRAINT "portfolio_images_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_types" ADD CONSTRAINT "commission_types_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_commissionTypeId_artistId_fkey" FOREIGN KEY ("commissionTypeId", "artistId") REFERENCES "commission_types"("id", "artistId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_files" ADD CONSTRAINT "request_files_requestId_artistId_fkey" FOREIGN KEY ("requestId", "artistId") REFERENCES "requests"("id", "artistId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_events" ADD CONSTRAINT "request_events_requestId_artistId_fkey" FOREIGN KEY ("requestId", "artistId") REFERENCES "requests"("id", "artistId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_requestId_artistId_fkey" FOREIGN KEY ("requestId", "artistId") REFERENCES "requests"("id", "artistId") ON DELETE CASCADE ON UPDATE CASCADE;
