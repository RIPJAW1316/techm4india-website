-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('CURRENT', 'PERMANENT', 'OTHER');

-- CreateEnum
CREATE TYPE "EmploymentHistoryEventType" AS ENUM ('JOINED', 'PROMOTED', 'TRANSFERRED', 'DESIGNATION_CHANGED', 'DEPARTMENT_CHANGED', 'DIVISION_CHANGED', 'MANAGER_CHANGED', 'EMPLOYMENT_TYPE_CHANGED', 'STATUS_CHANGED', 'EXITED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EmploymentStatus" ADD VALUE 'INACTIVE';
ALTER TYPE "EmploymentStatus" ADD VALUE 'EXITED';

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "alternatePhone" TEXT,
ADD COLUMN     "biometricId" TEXT,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "branchId" UUID,
ADD COLUMN     "confirmationDate" DATE,
ADD COLUMN     "dateOfBirth" DATE,
ADD COLUMN     "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "gradeText" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "personalEmail" TEXT,
ADD COLUMN     "probationEndDate" DATE;

-- CreateTable
CREATE TABLE "EmployeeAddress" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "type" "AddressType" NOT NULL DEFAULT 'CURRENT',
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "email" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSkill" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT,
    "yearsExperience" DECIMAL(4,1),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeCertification" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issuedAt" DATE,
    "expiresAt" DATE,
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeEducation" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "institution" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "fieldOfStudy" TEXT,
    "startDate" DATE,
    "endDate" DATE,
    "gradeOrScore" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeEducation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmploymentHistory" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "eventType" "EmploymentHistoryEventType" NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "summary" TEXT NOT NULL,
    "previousValue" JSONB,
    "newValue" JSONB,
    "actorUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmploymentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmployeeAddress_employeeId_type_isPrimary_idx" ON "EmployeeAddress"("employeeId", "type", "isPrimary");

-- CreateIndex
CREATE INDEX "EmergencyContact_employeeId_isPrimary_idx" ON "EmergencyContact"("employeeId", "isPrimary");

-- CreateIndex
CREATE INDEX "EmployeeSkill_employeeId_idx" ON "EmployeeSkill"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeCertification_employeeId_expiresAt_idx" ON "EmployeeCertification"("employeeId", "expiresAt");

-- CreateIndex
CREATE INDEX "EmployeeEducation_employeeId_endDate_idx" ON "EmployeeEducation"("employeeId", "endDate");

-- CreateIndex
CREATE INDEX "EmploymentHistory_employeeId_effectiveDate_idx" ON "EmploymentHistory"("employeeId", "effectiveDate");

-- CreateIndex
CREATE INDEX "EmploymentHistory_actorUserId_createdAt_idx" ON "EmploymentHistory"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Employee_branchId_idx" ON "Employee"("branchId");

-- CreateIndex
CREATE INDEX "Employee_managerEmployeeId_idx" ON "Employee"("managerEmployeeId");

-- CreateIndex
CREATE INDEX "Employee_employmentType_idx" ON "Employee"("employmentType");

-- CreateIndex
CREATE INDEX "Employee_joiningDate_idx" ON "Employee"("joiningDate");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAddress" ADD CONSTRAINT "EmployeeAddress_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeCertification" ADD CONSTRAINT "EmployeeCertification_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeEducation" ADD CONSTRAINT "EmployeeEducation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentHistory" ADD CONSTRAINT "EmploymentHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentHistory" ADD CONSTRAINT "EmploymentHistory_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
