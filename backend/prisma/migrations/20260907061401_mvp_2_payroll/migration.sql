-- CreateEnum
CREATE TYPE "PayrollComponentType" AS ENUM ('EARNING', 'DEDUCTION', 'EMPLOYER_CONTRIBUTION');

-- CreateEnum
CREATE TYPE "PayrollCalculationType" AS ENUM ('FIXED', 'PERCENTAGE', 'MANUAL');

-- CreateEnum
CREATE TYPE "CompensationStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "PayrollPeriodStatus" AS ENUM ('OPEN', 'PROCESSING', 'REVIEW', 'FINALIZED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PayrollRunStatus" AS ENUM ('DRAFT', 'PROCESSING', 'REVIEW', 'FINALIZED');

-- CreateEnum
CREATE TYPE "PayrollResultStatus" AS ENUM ('DRAFT', 'FINALIZED');

-- CreateTable
CREATE TABLE "PayrollComponent" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PayrollComponentType" NOT NULL,
    "description" TEXT,
    "calculationType" "PayrollCalculationType" NOT NULL DEFAULT 'FIXED',
    "defaultValue" DECIMAL(14,2),
    "percentageValue" DECIMAL(7,4),
    "percentageBaseComponentId" UUID,
    "isTaxable" BOOLEAN NOT NULL DEFAULT true,
    "isStatutory" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryStructure" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryStructureComponent" (
    "id" UUID NOT NULL,
    "salaryStructureId" UUID NOT NULL,
    "payrollComponentId" UUID NOT NULL,
    "value" DECIMAL(14,2),
    "percentage" DECIMAL(7,4),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SalaryStructureComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeCompensation" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "salaryStructureId" UUID NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "annualCtc" DECIMAL(14,2),
    "monthlyGrossTarget" DECIMAL(14,2),
    "status" "CompensationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeCompensation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeCompensationComponent" (
    "id" UUID NOT NULL,
    "employeeCompensationId" UUID NOT NULL,
    "payrollComponentId" UUID NOT NULL,
    "value" DECIMAL(14,2),
    "percentage" DECIMAL(7,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeCompensationComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollPeriod" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "status" "PayrollPeriodStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRun" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "payrollPeriodId" UUID NOT NULL,
    "status" "PayrollRunStatus" NOT NULL DEFAULT 'DRAFT',
    "initiatedByUserId" UUID NOT NULL,
    "approvedByUserId" UUID,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollEmployeeResult" (
    "id" UUID NOT NULL,
    "payrollRunId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "salaryStructureNameSnapshot" TEXT NOT NULL,
    "grossEarnings" DECIMAL(14,2) NOT NULL,
    "totalDeductions" DECIMAL(14,2) NOT NULL,
    "netPay" DECIMAL(14,2) NOT NULL,
    "employerContributionTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "workingDays" DECIMAL(7,2),
    "payableDays" DECIMAL(7,2),
    "leaveWithoutPayDays" DECIMAL(7,2),
    "status" "PayrollResultStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollEmployeeResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollLineItem" (
    "id" UUID NOT NULL,
    "payrollEmployeeResultId" UUID NOT NULL,
    "payrollComponentId" UUID,
    "componentCodeSnapshot" TEXT NOT NULL,
    "componentNameSnapshot" TEXT NOT NULL,
    "componentTypeSnapshot" "PayrollComponentType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "calculationMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PayrollComponent_organizationId_type_isActive_idx" ON "PayrollComponent"("organizationId", "type", "isActive");

-- CreateIndex
CREATE INDEX "PayrollComponent_percentageBaseComponentId_idx" ON "PayrollComponent"("percentageBaseComponentId");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollComponent_organizationId_code_key" ON "PayrollComponent"("organizationId", "code");

-- CreateIndex
CREATE INDEX "SalaryStructure_organizationId_isActive_idx" ON "SalaryStructure"("organizationId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryStructure_organizationId_name_key" ON "SalaryStructure"("organizationId", "name");

-- CreateIndex
CREATE INDEX "SalaryStructureComponent_payrollComponentId_idx" ON "SalaryStructureComponent"("payrollComponentId");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryStructureComponent_salaryStructureId_payrollComponent_key" ON "SalaryStructureComponent"("salaryStructureId", "payrollComponentId");

-- CreateIndex
CREATE INDEX "EmployeeCompensation_employeeId_effectiveFrom_effectiveTo_idx" ON "EmployeeCompensation"("employeeId", "effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "EmployeeCompensation_salaryStructureId_idx" ON "EmployeeCompensation"("salaryStructureId");

-- CreateIndex
CREATE INDEX "EmployeeCompensation_status_idx" ON "EmployeeCompensation"("status");

-- CreateIndex
CREATE INDEX "EmployeeCompensationComponent_payrollComponentId_idx" ON "EmployeeCompensationComponent"("payrollComponentId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeCompensationComponent_employeeCompensationId_payrol_key" ON "EmployeeCompensationComponent"("employeeCompensationId", "payrollComponentId");

-- CreateIndex
CREATE INDEX "PayrollPeriod_organizationId_status_idx" ON "PayrollPeriod"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollPeriod_organizationId_year_month_key" ON "PayrollPeriod"("organizationId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRun_payrollPeriodId_key" ON "PayrollRun"("payrollPeriodId");

-- CreateIndex
CREATE INDEX "PayrollRun_organizationId_status_idx" ON "PayrollRun"("organizationId", "status");

-- CreateIndex
CREATE INDEX "PayrollRun_payrollPeriodId_idx" ON "PayrollRun"("payrollPeriodId");

-- CreateIndex
CREATE INDEX "PayrollEmployeeResult_employeeId_status_idx" ON "PayrollEmployeeResult"("employeeId", "status");

-- CreateIndex
CREATE INDEX "PayrollEmployeeResult_payrollRunId_status_idx" ON "PayrollEmployeeResult"("payrollRunId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollEmployeeResult_payrollRunId_employeeId_key" ON "PayrollEmployeeResult"("payrollRunId", "employeeId");

-- CreateIndex
CREATE INDEX "PayrollLineItem_payrollEmployeeResultId_idx" ON "PayrollLineItem"("payrollEmployeeResultId");

-- CreateIndex
CREATE INDEX "PayrollLineItem_payrollComponentId_idx" ON "PayrollLineItem"("payrollComponentId");

-- AddForeignKey
ALTER TABLE "PayrollComponent" ADD CONSTRAINT "PayrollComponent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollComponent" ADD CONSTRAINT "PayrollComponent_percentageBaseComponentId_fkey" FOREIGN KEY ("percentageBaseComponentId") REFERENCES "PayrollComponent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryStructure" ADD CONSTRAINT "SalaryStructure_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryStructureComponent" ADD CONSTRAINT "SalaryStructureComponent_salaryStructureId_fkey" FOREIGN KEY ("salaryStructureId") REFERENCES "SalaryStructure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryStructureComponent" ADD CONSTRAINT "SalaryStructureComponent_payrollComponentId_fkey" FOREIGN KEY ("payrollComponentId") REFERENCES "PayrollComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeCompensation" ADD CONSTRAINT "EmployeeCompensation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeCompensation" ADD CONSTRAINT "EmployeeCompensation_salaryStructureId_fkey" FOREIGN KEY ("salaryStructureId") REFERENCES "SalaryStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeCompensationComponent" ADD CONSTRAINT "EmployeeCompensationComponent_employeeCompensationId_fkey" FOREIGN KEY ("employeeCompensationId") REFERENCES "EmployeeCompensation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeCompensationComponent" ADD CONSTRAINT "EmployeeCompensationComponent_payrollComponentId_fkey" FOREIGN KEY ("payrollComponentId") REFERENCES "PayrollComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollPeriod" ADD CONSTRAINT "PayrollPeriod_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRun" ADD CONSTRAINT "PayrollRun_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRun" ADD CONSTRAINT "PayrollRun_payrollPeriodId_fkey" FOREIGN KEY ("payrollPeriodId") REFERENCES "PayrollPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRun" ADD CONSTRAINT "PayrollRun_initiatedByUserId_fkey" FOREIGN KEY ("initiatedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRun" ADD CONSTRAINT "PayrollRun_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollEmployeeResult" ADD CONSTRAINT "PayrollEmployeeResult_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollEmployeeResult" ADD CONSTRAINT "PayrollEmployeeResult_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollLineItem" ADD CONSTRAINT "PayrollLineItem_payrollEmployeeResultId_fkey" FOREIGN KEY ("payrollEmployeeResultId") REFERENCES "PayrollEmployeeResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollLineItem" ADD CONSTRAINT "PayrollLineItem_payrollComponentId_fkey" FOREIGN KEY ("payrollComponentId") REFERENCES "PayrollComponent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
