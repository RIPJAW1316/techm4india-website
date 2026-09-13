-- CreateEnum
CREATE TYPE "JobRequisitionStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'OPEN', 'ON_HOLD', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RecruitmentApplicantStatus" AS ENUM ('APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "RecruitmentSource" AS ENUM ('WEBSITE', 'REFERRAL', 'LINKEDIN', 'JOB_PORTAL', 'CAMPUS', 'AGENCY', 'OTHER');

-- CreateEnum
CREATE TYPE "RecruitmentInterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RecruitmentInterviewMode" AS ENUM ('IN_PERSON', 'VIDEO', 'PHONE');

-- CreateEnum
CREATE TYPE "InterviewRecommendation" AS ENUM ('STRONG_HIRE', 'HIRE', 'HOLD', 'NO_HIRE');

-- CreateEnum
CREATE TYPE "RecruitmentOfferStatus" AS ENUM ('DRAFT', 'ISSUED', 'ACCEPTED', 'DECLINED', 'WITHDRAWN', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OnboardingTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'WAIVED');

-- CreateTable
CREATE TABLE "JobRequisition" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "divisionId" UUID,
    "departmentId" UUID,
    "hiringManagerEmployeeId" UUID,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "openings" INTEGER NOT NULL DEFAULT 1,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "JobRequisitionStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "location" TEXT,
    "createdByUserId" UUID NOT NULL,
    "approvedByUserId" UUID,
    "approvedAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JobRequisition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentApplicant" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "requisitionId" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "source" "RecruitmentSource" NOT NULL DEFAULT 'OTHER',
    "status" "RecruitmentApplicantStatus" NOT NULL DEFAULT 'APPLIED',
    "consentAt" TIMESTAMP(3) NOT NULL,
    "resumeUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RecruitmentApplicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentInterview" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "roundName" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "mode" "RecruitmentInterviewMode" NOT NULL DEFAULT 'VIDEO',
    "interviewerEmployeeId" UUID NOT NULL,
    "status" "RecruitmentInterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "score" DECIMAL(3,2),
    "recommendation" "InterviewRecommendation",
    "feedback" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RecruitmentInterview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentOffer" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "annualCtc" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "joiningDate" DATE NOT NULL,
    "status" "RecruitmentOfferStatus" NOT NULL DEFAULT 'DRAFT',
    "issuedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RecruitmentOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentOnboardingTask" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "ownerEmployeeId" UUID NOT NULL,
    "dueDate" DATE,
    "status" "OnboardingTaskStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RecruitmentOnboardingTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobRequisition_organizationId_code_key" ON "JobRequisition"("organizationId", "code");
CREATE INDEX "JobRequisition_organizationId_status_createdAt_idx" ON "JobRequisition"("organizationId", "status", "createdAt");
CREATE INDEX "JobRequisition_divisionId_departmentId_idx" ON "JobRequisition"("divisionId", "departmentId");
CREATE INDEX "JobRequisition_hiringManagerEmployeeId_idx" ON "JobRequisition"("hiringManagerEmployeeId");
CREATE UNIQUE INDEX "RecruitmentApplicant_requisitionId_email_key" ON "RecruitmentApplicant"("requisitionId", "email");
CREATE INDEX "RecruitmentApplicant_organizationId_status_createdAt_idx" ON "RecruitmentApplicant"("organizationId", "status", "createdAt");
CREATE INDEX "RecruitmentApplicant_organizationId_email_idx" ON "RecruitmentApplicant"("organizationId", "email");
CREATE INDEX "RecruitmentInterview_organizationId_scheduledAt_status_idx" ON "RecruitmentInterview"("organizationId", "scheduledAt", "status");
CREATE INDEX "RecruitmentInterview_applicantId_idx" ON "RecruitmentInterview"("applicantId");
CREATE INDEX "RecruitmentInterview_interviewerEmployeeId_idx" ON "RecruitmentInterview"("interviewerEmployeeId");
CREATE INDEX "RecruitmentOffer_organizationId_status_createdAt_idx" ON "RecruitmentOffer"("organizationId", "status", "createdAt");
CREATE INDEX "RecruitmentOffer_applicantId_idx" ON "RecruitmentOffer"("applicantId");
CREATE INDEX "RecruitmentOnboardingTask_organizationId_status_dueDate_idx" ON "RecruitmentOnboardingTask"("organizationId", "status", "dueDate");
CREATE INDEX "RecruitmentOnboardingTask_applicantId_idx" ON "RecruitmentOnboardingTask"("applicantId");
CREATE INDEX "RecruitmentOnboardingTask_ownerEmployeeId_idx" ON "RecruitmentOnboardingTask"("ownerEmployeeId");

-- AddForeignKey
ALTER TABLE "JobRequisition" ADD CONSTRAINT "JobRequisition_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JobRequisition" ADD CONSTRAINT "JobRequisition_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobRequisition" ADD CONSTRAINT "JobRequisition_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobRequisition" ADD CONSTRAINT "JobRequisition_hiringManagerEmployeeId_fkey" FOREIGN KEY ("hiringManagerEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RecruitmentApplicant" ADD CONSTRAINT "RecruitmentApplicant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecruitmentApplicant" ADD CONSTRAINT "RecruitmentApplicant_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "JobRequisition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecruitmentInterview" ADD CONSTRAINT "RecruitmentInterview_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecruitmentInterview" ADD CONSTRAINT "RecruitmentInterview_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "RecruitmentApplicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecruitmentInterview" ADD CONSTRAINT "RecruitmentInterview_interviewerEmployeeId_fkey" FOREIGN KEY ("interviewerEmployeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecruitmentOffer" ADD CONSTRAINT "RecruitmentOffer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecruitmentOffer" ADD CONSTRAINT "RecruitmentOffer_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "RecruitmentApplicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecruitmentOnboardingTask" ADD CONSTRAINT "RecruitmentOnboardingTask_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecruitmentOnboardingTask" ADD CONSTRAINT "RecruitmentOnboardingTask_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "RecruitmentApplicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecruitmentOnboardingTask" ADD CONSTRAINT "RecruitmentOnboardingTask_ownerEmployeeId_fkey" FOREIGN KEY ("ownerEmployeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
