-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TRAINING_INSTITUTE', 'CORPORATE', 'OTHER');

-- CreateEnum
CREATE TYPE "InstitutionStatus" AS ENUM ('PROSPECT', 'ONBOARDING', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InstitutionEngagementType" AS ENUM ('WORKSHOP', 'TRAINING', 'BOOTCAMP', 'PROGRAM', 'CONSULTING', 'PARTNERSHIP', 'OTHER');

-- CreateEnum
CREATE TYPE "InstitutionEngagementStatus" AS ENUM ('PLANNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ARCHIVED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'INSTITUTION_ASSIGNED';
ALTER TYPE "NotificationType" ADD VALUE 'INSTITUTION_ENGAGEMENT_ASSIGNED';

-- CreateTable
CREATE TABLE "Institution" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "type" "InstitutionType" NOT NULL DEFAULT 'OTHER',
    "status" "InstitutionStatus" NOT NULL DEFAULT 'PROSPECT',
    "website" TEXT,
    "officialEmail" TEXT,
    "officialPhone" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "primaryContactId" UUID,
    "relationshipOwnerEmployeeId" UUID,
    "crmAccountId" UUID,
    "establishedYear" INTEGER,
    "studentStrength" INTEGER,
    "notes" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionContact" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "roleTitle" TEXT,
    "department" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "alternatePhone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isDecisionMaker" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionEngagement" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "InstitutionEngagementType" NOT NULL DEFAULT 'OTHER',
    "status" "InstitutionEngagementStatus" NOT NULL DEFAULT 'PLANNED',
    "startDate" DATE,
    "endDate" DATE,
    "ownerEmployeeId" UUID,
    "crmOpportunityId" UUID,
    "estimatedParticipants" INTEGER,
    "notes" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionEngagement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Institution_organizationId_status_createdAt_idx" ON "Institution"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Institution_organizationId_type_idx" ON "Institution"("organizationId", "type");

-- CreateIndex
CREATE INDEX "Institution_organizationId_relationshipOwnerEmployeeId_idx" ON "Institution"("organizationId", "relationshipOwnerEmployeeId");

-- CreateIndex
CREATE INDEX "Institution_organizationId_city_state_idx" ON "Institution"("organizationId", "city", "state");

-- CreateIndex
CREATE INDEX "Institution_organizationId_crmAccountId_idx" ON "Institution"("organizationId", "crmAccountId");

-- CreateIndex
CREATE INDEX "Institution_organizationId_archivedAt_idx" ON "Institution"("organizationId", "archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_organizationId_code_key" ON "Institution"("organizationId", "code");

-- CreateIndex
CREATE INDEX "InstitutionContact_institutionId_archivedAt_idx" ON "InstitutionContact"("institutionId", "archivedAt");

-- CreateIndex
CREATE INDEX "InstitutionContact_institutionId_email_idx" ON "InstitutionContact"("institutionId", "email");

-- CreateIndex
CREATE INDEX "InstitutionEngagement_institutionId_status_createdAt_idx" ON "InstitutionEngagement"("institutionId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "InstitutionEngagement_organizationId_type_idx" ON "InstitutionEngagement"("organizationId", "type");

-- CreateIndex
CREATE INDEX "InstitutionEngagement_organizationId_ownerEmployeeId_idx" ON "InstitutionEngagement"("organizationId", "ownerEmployeeId");

-- CreateIndex
CREATE INDEX "InstitutionEngagement_organizationId_startDate_endDate_idx" ON "InstitutionEngagement"("organizationId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "InstitutionEngagement_organizationId_crmOpportunityId_idx" ON "InstitutionEngagement"("organizationId", "crmOpportunityId");

-- CreateIndex
CREATE INDEX "InstitutionEngagement_organizationId_archivedAt_idx" ON "InstitutionEngagement"("organizationId", "archivedAt");

-- AddForeignKey
ALTER TABLE "Institution" ADD CONSTRAINT "Institution_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Institution" ADD CONSTRAINT "Institution_relationshipOwnerEmployeeId_fkey" FOREIGN KEY ("relationshipOwnerEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Institution" ADD CONSTRAINT "Institution_crmAccountId_fkey" FOREIGN KEY ("crmAccountId") REFERENCES "CrmAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Institution" ADD CONSTRAINT "Institution_primaryContactId_fkey" FOREIGN KEY ("primaryContactId") REFERENCES "InstitutionContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionContact" ADD CONSTRAINT "InstitutionContact_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionEngagement" ADD CONSTRAINT "InstitutionEngagement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionEngagement" ADD CONSTRAINT "InstitutionEngagement_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionEngagement" ADD CONSTRAINT "InstitutionEngagement_ownerEmployeeId_fkey" FOREIGN KEY ("ownerEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionEngagement" ADD CONSTRAINT "InstitutionEngagement_crmOpportunityId_fkey" FOREIGN KEY ("crmOpportunityId") REFERENCES "CrmOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
