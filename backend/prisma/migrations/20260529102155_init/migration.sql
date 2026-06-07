-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SALES_PARTNER', 'SERVICE_PARTNER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "SalesPartnerType" AS ENUM ('BR', 'CR', 'FT', 'AG', 'IN', 'GT');

-- CreateEnum
CREATE TYPE "ServicePartnerType" AS ENUM ('WORKSHOP', 'PART_VENDOR', 'TOWING_SERVICE', 'ALPHA_GO');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('LEAD_CREATED', 'ASSIGNED', 'CAR_RECEIVED', 'INSPECTION_STARTED', 'INSPECTION_COMPLETED', 'QUOTE_SHARED', 'QUOTE_APPROVED', 'WORK_STARTED', 'WORK_COMPLETED', 'BILL_GENERATED', 'PAYMENT_DONE', 'VEHICLE_DELIVERED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('RC_DOCUMENT', 'VEHICLE_PHOTO', 'INSURANCE_DOCUMENT', 'QUOTE_DOCUMENT', 'INVOICE_DOCUMENT', 'SERVICE_DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('UNPAID', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "companyName" TEXT,
    "city" TEXT,
    "address" TEXT,
    "salesPartnerType" "SalesPartnerType",
    "vendorCode" TEXT,
    "servicePartnerType" "ServicePartnerType",
    "serviceCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "gstOrLicense" TEXT,
    "refreshTokenHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "leadCode" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerMobile" TEXT NOT NULL,
    "customerAddress" TEXT,
    "vehicleNumber" TEXT NOT NULL,
    "vehicleBrand" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "fuelType" "FuelType",
    "vehicleYear" INTEGER,
    "vehicleColor" TEXT,
    "insuranceCompany" TEXT,
    "serviceType" TEXT NOT NULL,
    "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "LeadStatus" NOT NULL DEFAULT 'LEAD_CREATED',
    "location" TEXT NOT NULL,
    "notes" TEXT,
    "salesPartnerId" TEXT NOT NULL,
    "assignedServicePartnerId" TEXT,
    "estimatedCompletion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadTimeline" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "performedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "items" JSONB NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "documentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "gst" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "items" JSONB NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'UNPAID',
    "paidAt" TIMESTAMP(3),
    "documentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SequenceCounter" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SequenceCounter_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "User_vendorCode_key" ON "User"("vendorCode");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_salesPartnerType_idx" ON "User"("salesPartnerType");

-- CreateIndex
CREATE INDEX "User_servicePartnerType_idx" ON "User"("servicePartnerType");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_leadCode_key" ON "Lead"("leadCode");

-- CreateIndex
CREATE INDEX "Lead_leadCode_idx" ON "Lead"("leadCode");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_salesPartnerId_idx" ON "Lead"("salesPartnerId");

-- CreateIndex
CREATE INDEX "Lead_assignedServicePartnerId_idx" ON "Lead"("assignedServicePartnerId");

-- CreateIndex
CREATE INDEX "Lead_customerMobile_idx" ON "Lead"("customerMobile");

-- CreateIndex
CREATE INDEX "LeadTimeline_leadId_idx" ON "LeadTimeline"("leadId");

-- CreateIndex
CREATE INDEX "LeadTimeline_status_idx" ON "LeadTimeline"("status");

-- CreateIndex
CREATE INDEX "Document_leadId_idx" ON "Document"("leadId");

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "Document"("type");

-- CreateIndex
CREATE INDEX "Quotation_leadId_idx" ON "Quotation"("leadId");

-- CreateIndex
CREATE INDEX "Quotation_status_idx" ON "Quotation"("status");

-- CreateIndex
CREATE INDEX "Invoice_leadId_idx" ON "Invoice"("leadId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_readAt_idx" ON "Notification"("readAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_salesPartnerId_fkey" FOREIGN KEY ("salesPartnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedServicePartnerId_fkey" FOREIGN KEY ("assignedServicePartnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadTimeline" ADD CONSTRAINT "LeadTimeline_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadTimeline" ADD CONSTRAINT "LeadTimeline_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
