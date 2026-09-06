-- CreateEnum
CREATE TYPE "CrmAccountType" AS ENUM ('PROSPECT', 'CUSTOMER', 'PARTNER', 'OTHER');

-- CreateEnum
CREATE TYPE "CrmAccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CrmLeadSource" AS ENUM ('WEBSITE', 'REFERRAL', 'OUTBOUND', 'EVENT', 'PARTNER', 'OTHER');

-- CreateEnum
CREATE TYPE "CrmLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CrmOpportunityStage" AS ENUM ('PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "CrmActivityType" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'FOLLOW_UP', 'NOTE', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'CRM_LEAD_ASSIGNED';
ALTER TYPE "NotificationType" ADD VALUE 'CRM_OPPORTUNITY_ASSIGNED';

-- CreateTable
CREATE TABLE "CrmAccount" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "accountType" "CrmAccountType" NOT NULL DEFAULT 'PROSPECT',
    "industry" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "ownerEmployeeId" UUID,
    "status" "CrmAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmContact" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "accountId" UUID,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "jobTitle" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "alternatePhone" TEXT,
    "ownerEmployeeId" UUID,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmLead" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "designation" TEXT,
    "source" "CrmLeadSource" NOT NULL DEFAULT 'OTHER',
    "status" "CrmLeadStatus" NOT NULL DEFAULT 'NEW',
    "ownerEmployeeId" UUID,
    "estimatedValue" DECIMAL(14,2),
    "currency" VARCHAR(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "lastContactedAt" TIMESTAMP(3),
    "notes" TEXT,
    "convertedAt" TIMESTAMP(3),
    "convertedAccountId" UUID,
    "convertedContactId" UUID,
    "convertedOpportunityId" UUID,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmOpportunity" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "accountId" UUID,
    "primaryContactId" UUID,
    "sourceLeadId" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stage" "CrmOpportunityStage" NOT NULL DEFAULT 'PROSPECTING',
    "estimatedValue" DECIMAL(14,2),
    "currency" VARCHAR(3),
    "expectedCloseDate" DATE,
    "closedAt" TIMESTAMP(3),
    "ownerEmployeeId" UUID,
    "lostReason" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmActivity" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "type" "CrmActivityType" NOT NULL DEFAULT 'NOTE',
    "leadId" UUID,
    "accountId" UUID,
    "contactId" UUID,
    "opportunityId" UUID,
    "ownerEmployeeId" UUID,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "occurredAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CrmAccount_organizationId_status_createdAt_idx" ON "CrmAccount"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "CrmAccount_organizationId_ownerEmployeeId_idx" ON "CrmAccount"("organizationId", "ownerEmployeeId");

-- CreateIndex
CREATE INDEX "CrmAccount_organizationId_accountType_idx" ON "CrmAccount"("organizationId", "accountType");

-- CreateIndex
CREATE INDEX "CrmAccount_organizationId_archivedAt_idx" ON "CrmAccount"("organizationId", "archivedAt");

-- CreateIndex
CREATE INDEX "CrmContact_organizationId_accountId_idx" ON "CrmContact"("organizationId", "accountId");

-- CreateIndex
CREATE INDEX "CrmContact_organizationId_ownerEmployeeId_idx" ON "CrmContact"("organizationId", "ownerEmployeeId");

-- CreateIndex
CREATE INDEX "CrmContact_organizationId_archivedAt_idx" ON "CrmContact"("organizationId", "archivedAt");

-- CreateIndex
CREATE INDEX "CrmContact_organizationId_email_idx" ON "CrmContact"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "CrmLead_convertedOpportunityId_key" ON "CrmLead"("convertedOpportunityId");

-- CreateIndex
CREATE INDEX "CrmLead_organizationId_status_createdAt_idx" ON "CrmLead"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "CrmLead_organizationId_ownerEmployeeId_idx" ON "CrmLead"("organizationId", "ownerEmployeeId");

-- CreateIndex
CREATE INDEX "CrmLead_organizationId_source_idx" ON "CrmLead"("organizationId", "source");

-- CreateIndex
CREATE INDEX "CrmLead_organizationId_nextFollowUpAt_idx" ON "CrmLead"("organizationId", "nextFollowUpAt");

-- CreateIndex
CREATE INDEX "CrmLead_organizationId_archivedAt_idx" ON "CrmLead"("organizationId", "archivedAt");

-- CreateIndex
CREATE INDEX "CrmLead_organizationId_email_idx" ON "CrmLead"("organizationId", "email");

-- CreateIndex
CREATE INDEX "CrmOpportunity_organizationId_stage_createdAt_idx" ON "CrmOpportunity"("organizationId", "stage", "createdAt");

-- CreateIndex
CREATE INDEX "CrmOpportunity_organizationId_ownerEmployeeId_idx" ON "CrmOpportunity"("organizationId", "ownerEmployeeId");

-- CreateIndex
CREATE INDEX "CrmOpportunity_organizationId_accountId_idx" ON "CrmOpportunity"("organizationId", "accountId");

-- CreateIndex
CREATE INDEX "CrmOpportunity_organizationId_expectedCloseDate_idx" ON "CrmOpportunity"("organizationId", "expectedCloseDate");

-- CreateIndex
CREATE INDEX "CrmOpportunity_organizationId_archivedAt_idx" ON "CrmOpportunity"("organizationId", "archivedAt");

-- CreateIndex
CREATE INDEX "CrmActivity_organizationId_ownerEmployeeId_createdAt_idx" ON "CrmActivity"("organizationId", "ownerEmployeeId", "createdAt");

-- CreateIndex
CREATE INDEX "CrmActivity_organizationId_dueAt_idx" ON "CrmActivity"("organizationId", "dueAt");

-- CreateIndex
CREATE INDEX "CrmActivity_organizationId_completedAt_idx" ON "CrmActivity"("organizationId", "completedAt");

-- CreateIndex
CREATE INDEX "CrmActivity_leadId_idx" ON "CrmActivity"("leadId");

-- CreateIndex
CREATE INDEX "CrmActivity_accountId_idx" ON "CrmActivity"("accountId");

-- CreateIndex
CREATE INDEX "CrmActivity_contactId_idx" ON "CrmActivity"("contactId");

-- CreateIndex
CREATE INDEX "CrmActivity_opportunityId_idx" ON "CrmActivity"("opportunityId");

-- AddForeignKey
ALTER TABLE "CrmAccount" ADD CONSTRAINT "CrmAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmAccount" ADD CONSTRAINT "CrmAccount_ownerEmployeeId_fkey" FOREIGN KEY ("ownerEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmContact" ADD CONSTRAINT "CrmContact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmContact" ADD CONSTRAINT "CrmContact_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CrmAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmContact" ADD CONSTRAINT "CrmContact_ownerEmployeeId_fkey" FOREIGN KEY ("ownerEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmLead" ADD CONSTRAINT "CrmLead_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmLead" ADD CONSTRAINT "CrmLead_ownerEmployeeId_fkey" FOREIGN KEY ("ownerEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmLead" ADD CONSTRAINT "CrmLead_convertedAccountId_fkey" FOREIGN KEY ("convertedAccountId") REFERENCES "CrmAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmLead" ADD CONSTRAINT "CrmLead_convertedContactId_fkey" FOREIGN KEY ("convertedContactId") REFERENCES "CrmContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmLead" ADD CONSTRAINT "CrmLead_convertedOpportunityId_fkey" FOREIGN KEY ("convertedOpportunityId") REFERENCES "CrmOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CrmAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_primaryContactId_fkey" FOREIGN KEY ("primaryContactId") REFERENCES "CrmContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_sourceLeadId_fkey" FOREIGN KEY ("sourceLeadId") REFERENCES "CrmLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_ownerEmployeeId_fkey" FOREIGN KEY ("ownerEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "CrmLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CrmAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CrmContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "CrmOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_ownerEmployeeId_fkey" FOREIGN KEY ("ownerEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
