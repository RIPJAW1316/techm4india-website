-- CreateEnum
CREATE TYPE "BranchType" AS ENUM ('HEADQUARTERS', 'REGIONAL_OFFICE', 'PARTNER_LAB', 'OTHER');

-- CreateEnum
CREATE TYPE "TeamMemberRole" AS ENUM ('LEAD', 'MEMBER');

-- DropIndex
DROP INDEX "ProjectMember_employeeId_idx";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "cin" TEXT,
ADD COLUMN     "companyValues" TEXT,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "dpiitNumber" TEXT,
ADD COLUMN     "gstin" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "mission" TEXT,
ADD COLUMN     "officialEmail" TEXT,
ADD COLUMN     "officialPhone" TEXT,
ADD COLUMN     "pan" TEXT,
ADD COLUMN     "registeredAddressLine1" TEXT,
ADD COLUMN     "registeredAddressLine2" TEXT,
ADD COLUMN     "registeredCity" TEXT,
ADD COLUMN     "registeredCountry" TEXT,
ADD COLUMN     "registeredPostalCode" TEXT,
ADD COLUMN     "registeredState" TEXT,
ADD COLUMN     "tan" TEXT,
ADD COLUMN     "tradeName" TEXT,
ADD COLUMN     "vision" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "Branch" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BranchType" NOT NULL DEFAULT 'OTHER',
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostCentre" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "divisionId" UUID,
    "departmentId" UUID,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostCentre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "divisionId" UUID,
    "departmentId" UUID,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "leadEmployeeId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "role" "TeamMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Branch_organizationId_type_isActive_idx" ON "Branch"("organizationId", "type", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_organizationId_code_key" ON "Branch"("organizationId", "code");

-- CreateIndex
CREATE INDEX "CostCentre_organizationId_divisionId_departmentId_isActive_idx" ON "CostCentre"("organizationId", "divisionId", "departmentId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CostCentre_organizationId_code_key" ON "CostCentre"("organizationId", "code");

-- CreateIndex
CREATE INDEX "Team_organizationId_divisionId_departmentId_isActive_idx" ON "Team"("organizationId", "divisionId", "departmentId", "isActive");

-- CreateIndex
CREATE INDEX "Team_leadEmployeeId_idx" ON "Team"("leadEmployeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_organizationId_code_key" ON "Team"("organizationId", "code");

-- CreateIndex
CREATE INDEX "TeamMember_teamId_employeeId_removedAt_idx" ON "TeamMember"("teamId", "employeeId", "removedAt");

-- CreateIndex
CREATE INDEX "TeamMember_employeeId_removedAt_idx" ON "TeamMember"("employeeId", "removedAt");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCentre" ADD CONSTRAINT "CostCentre_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCentre" ADD CONSTRAINT "CostCentre_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCentre" ADD CONSTRAINT "CostCentre_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_leadEmployeeId_fkey" FOREIGN KEY ("leadEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
