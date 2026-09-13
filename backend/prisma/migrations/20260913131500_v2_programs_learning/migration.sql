-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ProgramDeliveryMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');
CREATE TYPE "ProgramContentType" AS ENUM ('TEXT', 'VIDEO', 'PDF', 'LIVE');
CREATE TYPE "ProgramLessonStatus" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "ProgramBatchStatus" AS ENUM ('PLANNED', 'OPEN', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ALUMNI');
CREATE TYPE "ProgramEnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Program" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "divisionId" UUID,
    "departmentId" UUID,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "shortDescription" TEXT NOT NULL,
    "longDescription" TEXT,
    "outcomes" TEXT,
    "eligibility" TEXT,
    "durationHours" DECIMAL(8,2) NOT NULL,
    "deliveryMode" "ProgramDeliveryMode" NOT NULL DEFAULT 'OFFLINE',
    "assessmentMethod" TEXT NOT NULL,
    "capacity" INTEGER,
    "certificateType" TEXT,
    "status" "ProgramStatus" NOT NULL DEFAULT 'DRAFT',
    "createdByUserId" UUID NOT NULL,
    "reviewedByUserId" UUID,
    "reviewedAt" TIMESTAMP(3),
    "publishedByUserId" UUID,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProgramModule" (
    "id" UUID NOT NULL,
    "programId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProgramModule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProgramLesson" (
    "id" UUID NOT NULL,
    "moduleId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "contentType" "ProgramContentType" NOT NULL,
    "contentBody" TEXT,
    "contentUrl" TEXT,
    "durationMinutes" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL,
    "status" "ProgramLessonStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProgramLesson_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProgramBatch" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "programId" UUID NOT NULL,
    "institutionId" UUID,
    "trainerEmployeeId" UUID,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startsOn" DATE NOT NULL,
    "endsOn" DATE NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "ProgramBatchStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProgramBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Student" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "institutionId" UUID,
    "studentCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "guardianName" TEXT,
    "guardianPhone" TEXT,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProgramEnrollment" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "batchId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "status" "ProgramEnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "progressPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProgramEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LessonProgress" (
    "id" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "lessonId" UUID NOT NULL,
    "progressPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Program_organizationId_code_version_key" ON "Program"("organizationId", "code", "version");
CREATE UNIQUE INDEX "Program_organizationId_slug_version_key" ON "Program"("organizationId", "slug", "version");
CREATE INDEX "Program_organizationId_status_createdAt_idx" ON "Program"("organizationId", "status", "createdAt");
CREATE INDEX "Program_divisionId_departmentId_idx" ON "Program"("divisionId", "departmentId");
CREATE UNIQUE INDEX "ProgramModule_programId_position_key" ON "ProgramModule"("programId", "position");
CREATE INDEX "ProgramModule_programId_idx" ON "ProgramModule"("programId");
CREATE UNIQUE INDEX "ProgramLesson_moduleId_position_key" ON "ProgramLesson"("moduleId", "position");
CREATE INDEX "ProgramLesson_moduleId_status_idx" ON "ProgramLesson"("moduleId", "status");
CREATE UNIQUE INDEX "ProgramBatch_organizationId_code_key" ON "ProgramBatch"("organizationId", "code");
CREATE INDEX "ProgramBatch_organizationId_status_startsOn_idx" ON "ProgramBatch"("organizationId", "status", "startsOn");
CREATE INDEX "ProgramBatch_programId_idx" ON "ProgramBatch"("programId");
CREATE INDEX "ProgramBatch_institutionId_idx" ON "ProgramBatch"("institutionId");
CREATE INDEX "ProgramBatch_trainerEmployeeId_idx" ON "ProgramBatch"("trainerEmployeeId");
CREATE UNIQUE INDEX "Student_organizationId_studentCode_key" ON "Student"("organizationId", "studentCode");
CREATE INDEX "Student_organizationId_status_createdAt_idx" ON "Student"("organizationId", "status", "createdAt");
CREATE INDEX "Student_organizationId_email_idx" ON "Student"("organizationId", "email");
CREATE INDEX "Student_institutionId_idx" ON "Student"("institutionId");
CREATE UNIQUE INDEX "ProgramEnrollment_batchId_studentId_key" ON "ProgramEnrollment"("batchId", "studentId");
CREATE INDEX "ProgramEnrollment_organizationId_status_enrolledAt_idx" ON "ProgramEnrollment"("organizationId", "status", "enrolledAt");
CREATE INDEX "ProgramEnrollment_studentId_idx" ON "ProgramEnrollment"("studentId");
CREATE UNIQUE INDEX "LessonProgress_enrollmentId_lessonId_key" ON "LessonProgress"("enrollmentId", "lessonId");
CREATE INDEX "LessonProgress_lessonId_idx" ON "LessonProgress"("lessonId");

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Program" ADD CONSTRAINT "Program_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Program" ADD CONSTRAINT "Program_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProgramModule" ADD CONSTRAINT "ProgramModule_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgramLesson" ADD CONSTRAINT "ProgramLesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ProgramModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgramBatch" ADD CONSTRAINT "ProgramBatch_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProgramBatch" ADD CONSTRAINT "ProgramBatch_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProgramBatch" ADD CONSTRAINT "ProgramBatch_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProgramBatch" ADD CONSTRAINT "ProgramBatch_trainerEmployeeId_fkey" FOREIGN KEY ("trainerEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Student" ADD CONSTRAINT "Student_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Student" ADD CONSTRAINT "Student_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProgramEnrollment" ADD CONSTRAINT "ProgramEnrollment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProgramEnrollment" ADD CONSTRAINT "ProgramEnrollment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ProgramBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProgramEnrollment" ADD CONSTRAINT "ProgramEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "ProgramEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ProgramLesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
