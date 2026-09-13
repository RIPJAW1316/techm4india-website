-- CreateEnum
CREATE TYPE "ComplianceCategory" AS ENUM ('TAX', 'LABOUR', 'CORPORATE', 'DATA_PRIVACY', 'ENVIRONMENTAL', 'LICENSING', 'OTHER');

-- CreateEnum
CREATE TYPE "ComplianceFrequency" AS ENUM ('ONE_TIME', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'WAIVED');

-- CreateTable
CREATE TABLE "ComplianceObligation" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "ownerEmployeeId" UUID,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "ComplianceCategory" NOT NULL DEFAULT 'OTHER',
    "authority" TEXT,
    "frequency" "ComplianceFrequency" NOT NULL DEFAULT 'ONE_TIME',
    "dueDate" DATE NOT NULL,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'PENDING',
    "createdByUserId" UUID NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceObligation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceEvidence" (
    "id" UUID NOT NULL,
    "obligationId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "documentUrl" TEXT,
    "uploadedByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComplianceObligation_organizationId_status_dueDate_idx" ON "ComplianceObligation"("organizationId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "ComplianceObligation_ownerEmployeeId_idx" ON "ComplianceObligation"("ownerEmployeeId");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceObligation_organizationId_code_key" ON "ComplianceObligation"("organizationId", "code");

-- CreateIndex
CREATE INDEX "ComplianceEvidence_obligationId_idx" ON "ComplianceEvidence"("obligationId");

-- AddForeignKey
ALTER TABLE "ComplianceObligation" ADD CONSTRAINT "ComplianceObligation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceObligation" ADD CONSTRAINT "ComplianceObligation_ownerEmployeeId_fkey" FOREIGN KEY ("ownerEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceEvidence" ADD CONSTRAINT "ComplianceEvidence_obligationId_fkey" FOREIGN KEY ("obligationId") REFERENCES "ComplianceObligation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
