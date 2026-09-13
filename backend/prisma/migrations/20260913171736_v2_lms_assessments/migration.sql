-- CreateEnum
CREATE TYPE "AssignmentSubmissionStatus" AS ENUM ('SUBMITTED', 'GRADED', 'RETURNED');

-- CreateTable
CREATE TABLE "ProgramAssignment" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "programId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "maxScore" DECIMAL(6,2) NOT NULL DEFAULT 100,
    "dueDate" DATE,
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentSubmission" (
    "id" UUID NOT NULL,
    "assignmentId" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "submissionUrl" TEXT,
    "note" TEXT,
    "status" "AssignmentSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "score" DECIMAL(6,2),
    "feedback" TEXT,
    "gradedByUserId" UUID,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gradedAt" TIMESTAMP(3),

    CONSTRAINT "AssignmentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramCertificate" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuedByUserId" UUID NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgramCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProgramAssignment_organizationId_programId_idx" ON "ProgramAssignment"("organizationId", "programId");

-- CreateIndex
CREATE INDEX "AssignmentSubmission_enrollmentId_idx" ON "AssignmentSubmission"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentSubmission_assignmentId_enrollmentId_key" ON "AssignmentSubmission"("assignmentId", "enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramCertificate_enrollmentId_key" ON "ProgramCertificate"("enrollmentId");

-- CreateIndex
CREATE INDEX "ProgramCertificate_organizationId_idx" ON "ProgramCertificate"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramCertificate_organizationId_certificateNumber_key" ON "ProgramCertificate"("organizationId", "certificateNumber");

-- AddForeignKey
ALTER TABLE "ProgramAssignment" ADD CONSTRAINT "ProgramAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramAssignment" ADD CONSTRAINT "ProgramAssignment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "ProgramAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "ProgramEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCertificate" ADD CONSTRAINT "ProgramCertificate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCertificate" ADD CONSTRAINT "ProgramCertificate_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "ProgramEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
