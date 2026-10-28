-- ==============================================================================
-- TECHM4INDIA ERP V2.0 - PHASE 3: DATABASE & BACKEND FOUNDATION
-- 22-Entity Domain Relational Schema Migration (PostgreSQL DDL)
-- ==============================================================================

-- CreateEnum
CREATE TYPE "JobPostingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ON_HOLD', 'CLOSED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'SCREENING', 'INTERVIEW_SCHEDULED', 'OFFER_EXTENDED', 'HIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OfferLetterStatus" AS ENUM ('ISSUED', 'ACCEPTED', 'DECLINED', 'REVOKED');

-- CreateEnum
CREATE TYPE "LeadVertical" AS ENUM ('ENGINEERING_COLLEGES', 'UNIVERSITIES_AUTONOMOUS', 'POLYTECHNICS', 'K12_STEM_SCHOOLS', 'ATL_LABS', 'AEROSPACE_DEFENCE_LABS', 'EDTECH_PARTNERS', 'CORPORATE_CSR');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "DealStage" AS ENUM ('QUALIFICATION', 'NEEDS_ANALYSIS', 'PROPOSAL_QUOTE', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'INVOICED');

-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('GOVERNMENT_UNIVERSITY', 'PRIVATE_UNIVERSITY', 'AUTONOMOUS_COLLEGE', 'AFFILIATED_COLLEGE', 'POLYTECHNIC', 'K12_SCHOOL', 'R_AND_D_LAB');

-- CreateEnum
CREATE TYPE "NaacRating" AS ENUM ('A_PLUS_PLUS', 'A_PLUS', 'A', 'B_PLUS_PLUS', 'B_PLUS', 'B', 'C', 'NOT_ACCREDITED');

-- CreateEnum
CREATE TYPE "MouStatus" AS ENUM ('DRAFT', 'PENDING_SIGNATURE', 'ACTIVE', 'RENEWAL_DUE', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "ProgramCertificationType" AS ENUM ('TECHM4_INDUSTRY_CERTIFICATE', 'UNIVERSITY_JOINT_CERTIFICATE', 'GLOBAL_AFFILIATE_DIPLOMA', 'AICTE_NEAT_APPROVED');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "LessonContentType" AS ENUM ('VIDEO', 'MARKDOWN_ARTICLE', 'CODE_KIT', 'LAB_EXERCISE', 'SLIDE_DECK');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StudentFeeStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'WAIVED');

-- CreateEnum
CREATE TYPE "GrievanceCategory" AS ENUM ('ACADEMIC', 'LAB_EQUIPMENT', 'FACULTY', 'PORTAL_ACCESS', 'FEES_BILLING');

-- CreateEnum
CREATE TYPE "GrievanceStatus" AS ENUM ('OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('INTERNAL_RND', 'CLIENT_DELIVERY', 'GOVERNMENT_DEFENSE', 'INSTITUTIONAL_LAB_SETUP');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('FEATURE', 'BUG', 'LAB_DEPLOYMENT', 'DOCUMENTATION', 'RESEARCH');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'CODE_REVIEW', 'TESTING', 'DONE');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'APPROVED', 'DISPATCHED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QualityInspectionStatus" AS ENUM ('ACCEPTED', 'REJECTED', 'PARTIALLY_ACCEPTED');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('ROBOTICS_PARTS', 'SATELLITE_RIGS', 'MICROCONTROLLERS', 'CONSUMABLES', 'SENSORS', 'FINISHED_KIT');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('PURCHASE_RECEIPT', 'LAB_DISPATCH', 'KIT_ASSEMBLY', 'SCRAP', 'RETURN');

-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('IT_LAPTOPS', 'LAB_INSTRUMENTS', 'THREE_D_PRINTERS', 'AV_MEDIA', 'FURNITURE');

-- CreateEnum
CREATE TYPE "DepreciationMethod" AS ENUM ('SLM', 'WDV');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('IN_USE', 'UNDER_MAINTENANCE', 'SPARE', 'DISPOSED');

-- CreateEnum
CREATE TYPE "CommunicationChannel" AS ENUM ('WHATSAPP_API', 'EMAIL_SES', 'SMS');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('IT_SUPPORT', 'HR_QUERY', 'FINANCE_QUERY', 'STUDENT_GRIEVANCE', 'INSTITUTION_SUPPORT');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('CRITICAL', 'HIGH', 'NORMAL', 'LOW');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ComplianceFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL');

-- CreateTable
CREATE TABLE "ats_job_postings" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "departmentId" TEXT,
    "designationId" TEXT,
    "division" "DivisionCode" NOT NULL DEFAULT 'TECHM4_SOLUTIONS',
    "location" TEXT NOT NULL DEFAULT 'Hyderabad HQ',
    "experienceMin" INTEGER NOT NULL DEFAULT 0,
    "experienceMax" INTEGER NOT NULL DEFAULT 5,
    "openPositions" INTEGER NOT NULL DEFAULT 1,
    "salaryMin" DECIMAL(12,2),
    "salaryMax" DECIMAL(12,2),
    "jobDescription" TEXT NOT NULL,
    "status" "JobPostingStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "closingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ats_job_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ats_candidates" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "currentCompany" TEXT,
    "currentCtc" DECIMAL(12,2),
    "expectedCtc" DECIMAL(12,2),
    "noticePeriodDays" INTEGER DEFAULT 30,
    "resumeUrl" TEXT,
    "source" TEXT NOT NULL DEFAULT 'PORTAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ats_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ats_job_applications" (
    "id" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stageNotes" TEXT,
    "rating" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ats_job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ats_interviews" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "roundName" TEXT NOT NULL,
    "interviewerEmployeeId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 45,
    "meetingUrl" TEXT,
    "score" INTEGER,
    "feedback" TEXT,
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ats_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ats_offer_letters" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "offeredDesignationId" TEXT,
    "offeredCtc" DECIMAL(12,2) NOT NULL,
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "status" "OfferLetterStatus" NOT NULL DEFAULT 'ISSUED',
    "signedLetterUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ats_offer_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_leads" (
    "id" TEXT NOT NULL,
    "leadNumber" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "vertical" "LeadVertical" NOT NULL DEFAULT 'ENGINEERING_COLLEGES',
    "contactPerson" TEXT NOT NULL,
    "designation" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Telangana',
    "source" TEXT NOT NULL DEFAULT 'CAMPUS_OUTREACH',
    "score" INTEGER NOT NULL DEFAULT 50,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "estimatedBudget" DECIMAL(15,2),
    "notes" TEXT,
    "assignedEmployeeId" TEXT,
    "isConverted" BOOLEAN NOT NULL DEFAULT false,
    "convertedAccountId" TEXT,
    "convertedDealId" TEXT,
    "convertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_contacts" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "designation" TEXT,
    "department" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "whatsapp" TEXT,
    "isPrimaryDecisionMaker" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_deals" (
    "id" TEXT NOT NULL,
    "dealNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "institutionId" TEXT,
    "vertical" "LeadVertical" NOT NULL DEFAULT 'ENGINEERING_COLLEGES',
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0.0,
    "stage" "DealStage" NOT NULL DEFAULT 'QUALIFICATION',
    "probabilityPct" INTEGER NOT NULL DEFAULT 10,
    "expectedCloseDate" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "ownerEmployeeId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_deal_stage_history" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "fromStage" "DealStage" NOT NULL,
    "toStage" "DealStage" NOT NULL,
    "notes" TEXT,
    "changedById" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_deal_stage_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_quotes" (
    "id" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "dealId" TEXT,
    "institutionId" TEXT,
    "subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0.0,
    "discount" DECIMAL(15,2) NOT NULL DEFAULT 0.0,
    "cgstAmount" DECIMAL(15,2) NOT NULL DEFAULT 0.0,
    "sgstAmount" DECIMAL(15,2) NOT NULL DEFAULT 0.0,
    "igstAmount" DECIMAL(15,2) NOT NULL DEFAULT 0.0,
    "totalAmount" DECIMAL(15,2) NOT NULL DEFAULT 0.0,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "validUntil" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "invoicedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_quote_items" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hsnSacCode" TEXT NOT NULL DEFAULT '998334',
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1.0,
    "unitRate" DECIMAL(15,2) NOT NULL DEFAULT 0.0,
    "taxRatePct" DECIMAL(5,2) NOT NULL DEFAULT 18.0,
    "taxableAmount" DECIMAL(15,2) NOT NULL DEFAULT 0.0,
    "totalAmount" DECIMAL(15,2) NOT NULL DEFAULT 0.0,

    CONSTRAINT "crm_quote_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_institutions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InstitutionType" NOT NULL DEFAULT 'AUTONOMOUS_COLLEGE',
    "naacRating" "NaacRating" NOT NULL DEFAULT 'NOT_ACCREDITED',
    "aisheCode" TEXT,
    "nirfRankTier" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Telangana',
    "pincode" TEXT,
    "totalStudents" INTEGER DEFAULT 0,
    "primaryContactName" TEXT,
    "primaryContactPhone" TEXT,
    "primaryContactEmail" TEXT,
    "healthScore" INTEGER NOT NULL DEFAULT 80,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_mous" (
    "id" TEXT NOT NULL,
    "mouNumber" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "scopeSummary" TEXT NOT NULL,
    "signedDocumentUrl" TEXT,
    "techm4SignatoryEmployeeId" TEXT,
    "institutionSignatoryName" TEXT NOT NULL,
    "institutionSignatoryRole" TEXT NOT NULL,
    "status" "MouStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_mous_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_programs" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "division" "DivisionCode" NOT NULL DEFAULT 'TECHM4_ENGINEERING',
    "summary" TEXT NOT NULL,
    "durationWeeks" INTEGER NOT NULL DEFAULT 12,
    "credits" INTEGER NOT NULL DEFAULT 4,
    "certificationType" "ProgramCertificationType" NOT NULL DEFAULT 'TECHM4_INDUSTRY_CERTIFICATE',
    "targetAudience" TEXT NOT NULL DEFAULT 'Undergraduate Engineering',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_curriculum_modules" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "moduleNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "totalHours" INTEGER NOT NULL DEFAULT 20,
    "labHours" INTEGER NOT NULL DEFAULT 12,
    "theoryHours" INTEGER NOT NULL DEFAULT 8,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_curriculum_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_batches" (
    "id" TEXT NOT NULL,
    "batchCode" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "institutionId" TEXT,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 60,
    "currentEnrolled" INTEGER NOT NULL DEFAULT 0,
    "leadFacultyEmployeeId" TEXT,
    "status" "BatchStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_batch_sessions" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 90,
    "meetingUrl" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_batch_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_courses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "programId" TEXT,
    "instructorEmployeeId" TEXT,
    "thumbnailUrl" TEXT,
    "difficultyLevel" "DifficultyLevel" NOT NULL DEFAULT 'BEGINNER',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lms_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_lessons" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "contentType" "LessonContentType" NOT NULL DEFAULT 'VIDEO',
    "contentUrl" TEXT,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_assignments" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "problemStatement" TEXT NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_assignment_submissions" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "repoUrl" TEXT,
    "attachmentUrl" TEXT,
    "scoreAwarded" INTEGER,
    "feedback" TEXT,
    "gradedById" TEXT,

    CONSTRAINT "lms_assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_certificates" (
    "id" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificationToken" TEXT NOT NULL,
    "qrVerificationUrl" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_students" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "userId" TEXT,
    "institutionId" TEXT,
    "batchId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "gender" TEXT,
    "dob" TIMESTAMP(3),
    "academicBranch" TEXT NOT NULL DEFAULT 'Computer Science & Engineering',
    "yearOfStudy" INTEGER NOT NULL DEFAULT 3,
    "guardianName" TEXT,
    "guardianPhone" TEXT,
    "kycVerified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_student_fees" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "feeType" TEXT NOT NULL DEFAULT 'TUITION',
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "netPayable" DECIMAL(12,2) NOT NULL,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "balanceDue" DECIMAL(12,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "StudentFeeStatus" NOT NULL DEFAULT 'UNPAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_student_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_student_grievances" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "category" "GrievanceCategory" NOT NULL DEFAULT 'ACADEMIC',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "GrievanceStatus" NOT NULL DEFAULT 'OPEN',
    "resolutionNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_student_grievances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_projects" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProjectType" NOT NULL DEFAULT 'INTERNAL_RND',
    "institutionId" TEXT,
    "division" "DivisionCode" NOT NULL DEFAULT 'TECHM4_ENGINEERING',
    "leadEmployeeId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "targetDate" TIMESTAMP(3),
    "budgetTotal" DECIMAL(15,2) NOT NULL DEFAULT 0.0,
    "budgetUtilized" DECIMAL(15,2) NOT NULL DEFAULT 0.0,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_milestones" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "billingPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "invoiceRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_tasks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "milestoneId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskType" "TaskType" NOT NULL DEFAULT 'FEATURE',
    "assigneeEmployeeId" TEXT,
    "storyPoints" INTEGER NOT NULL DEFAULT 3,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "githubPrUrl" TEXT,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_timesheets" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hoursLogged" DECIMAL(4,2) NOT NULL,
    "workDescription" TEXT NOT NULL,
    "isBillable" BOOLEAN NOT NULL DEFAULT true,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_timesheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_purchase_orders" (
    "id" TEXT NOT NULL,
    "poNumber" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "division" "DivisionCode" NOT NULL DEFAULT 'TECHM4_SOLUTIONS',
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDueDate" TIMESTAMP(3) NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0.0,
    "taxAmount" DECIMAL(15,2) NOT NULL DEFAULT 0.0,
    "totalAmount" DECIMAL(15,2) NOT NULL DEFAULT 0.0,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_goods_receipt_notes" (
    "id" TEXT NOT NULL,
    "grnNumber" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "receivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inspectedById" TEXT,
    "qualityStatus" "QualityInspectionStatus" NOT NULL DEFAULT 'ACCEPTED',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "procurement_goods_receipt_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL DEFAULT 'ROBOTICS_PARTS',
    "uom" TEXT NOT NULL DEFAULT 'UNIT',
    "hsnCode" TEXT NOT NULL DEFAULT '8471',
    "reorderLevel" INTEGER NOT NULL DEFAULT 10,
    "unitCost" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_kit_boms" (
    "id" TEXT NOT NULL,
    "kitSku" TEXT NOT NULL,
    "componentItemId" TEXT NOT NULL,
    "quantityRequired" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_kit_boms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_stock_levels" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "branchId" TEXT,
    "quantityOnHand" INTEGER NOT NULL DEFAULT 0,
    "quantityReserved" INTEGER NOT NULL DEFAULT 0,
    "quantityAvailable" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_stock_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_stock_movements" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "referenceId" TEXT,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets_register" (
    "id" TEXT NOT NULL,
    "assetTag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "AssetCategory" NOT NULL DEFAULT 'IT_LAPTOPS',
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "purchaseCost" DECIMAL(15,2) NOT NULL,
    "serialNumber" TEXT,
    "depreciationMethod" "DepreciationMethod" NOT NULL DEFAULT 'SLM',
    "depreciationRatePct" DECIMAL(5,2) NOT NULL DEFAULT 15.0,
    "currentBookValue" DECIMAL(15,2) NOT NULL,
    "assignedEmployeeId" TEXT,
    "branchId" TEXT,
    "status" "AssetStatus" NOT NULL DEFAULT 'IN_USE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_register_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets_maintenance" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "vendorName" TEXT NOT NULL,
    "cost" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "description" TEXT NOT NULL,
    "nextServiceDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentHtml" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoMetaDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_blog_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authorEmployeeId" TEXT,
    "category" TEXT NOT NULL DEFAULT 'AEROSPACE_AI',
    "tags" TEXT[],
    "bodyMarkdown" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "readingTimeMinutes" INTEGER NOT NULL DEFAULT 5,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_events" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "eventType" TEXT NOT NULL DEFAULT 'HACKATHON',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL DEFAULT 'Hyderabad HQ',
    "registrationLimit" INTEGER NOT NULL DEFAULT 100,
    "currentRegistrations" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comm_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "CommunicationChannel" NOT NULL DEFAULT 'WHATSAPP_API',
    "targetAudienceType" TEXT NOT NULL DEFAULT 'COLLEGE_DEANS',
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "repliedCount" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comm_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comm_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "CommunicationChannel" NOT NULL DEFAULT 'WHATSAPP_API',
    "subject" TEXT,
    "bodyText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comm_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "category" "TicketCategory" NOT NULL DEFAULT 'IT_SUPPORT',
    "priority" "TicketPriority" NOT NULL DEFAULT 'NORMAL',
    "subject" TEXT NOT NULL,
    "requesterUserId" TEXT,
    "assignedAgentId" TEXT,
    "slaDueAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "csatRating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_ticket_comments" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "message" TEXT NOT NULL,
    "isInternalNote" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_ticket_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_obligations" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authority" TEXT NOT NULL,
    "frequency" "ComplianceFrequency" NOT NULL DEFAULT 'MONTHLY',
    "dueDayOfMonth" INTEGER NOT NULL DEFAULT 20,
    "responsibleRoleId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_obligations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_executions" (
    "id" TEXT NOT NULL,
    "obligationId" TEXT NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "challanRefNumber" TEXT,
    "acknowledgementUrl" TEXT,
    "filedAt" TIMESTAMP(3),
    "filedById" TEXT,
    "penaltyPaid" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_executions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ats_job_postings_code_key" ON "ats_job_postings"("code");

-- CreateIndex
CREATE INDEX "ats_job_postings_status_idx" ON "ats_job_postings"("status");

-- CreateIndex
CREATE INDEX "ats_job_postings_division_idx" ON "ats_job_postings"("division");

-- CreateIndex
CREATE UNIQUE INDEX "ats_candidates_email_key" ON "ats_candidates"("email");

-- CreateIndex
CREATE INDEX "ats_candidates_email_idx" ON "ats_candidates"("email");

-- CreateIndex
CREATE INDEX "ats_job_applications_status_idx" ON "ats_job_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ats_job_applications_jobPostingId_candidateId_key" ON "ats_job_applications"("jobPostingId", "candidateId");

-- CreateIndex
CREATE INDEX "ats_interviews_applicationId_idx" ON "ats_interviews"("applicationId");

-- CreateIndex
CREATE INDEX "ats_interviews_scheduledAt_idx" ON "ats_interviews"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "crm_leads_leadNumber_key" ON "crm_leads"("leadNumber");

-- CreateIndex
CREATE INDEX "crm_leads_vertical_idx" ON "crm_leads"("vertical");

-- CreateIndex
CREATE INDEX "crm_leads_status_idx" ON "crm_leads"("status");

-- CreateIndex
CREATE INDEX "crm_leads_score_idx" ON "crm_leads"("score");

-- CreateIndex
CREATE INDEX "crm_contacts_email_idx" ON "crm_contacts"("email");

-- CreateIndex
CREATE INDEX "crm_contacts_institutionId_idx" ON "crm_contacts"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "crm_deals_dealNumber_key" ON "crm_deals"("dealNumber");

-- CreateIndex
CREATE INDEX "crm_deals_stage_idx" ON "crm_deals"("stage");

-- CreateIndex
CREATE INDEX "crm_deals_vertical_idx" ON "crm_deals"("vertical");

-- CreateIndex
CREATE INDEX "crm_deals_expectedCloseDate_idx" ON "crm_deals"("expectedCloseDate");

-- CreateIndex
CREATE INDEX "crm_deal_stage_history_dealId_idx" ON "crm_deal_stage_history"("dealId");

-- CreateIndex
CREATE UNIQUE INDEX "crm_quotes_quoteNumber_key" ON "crm_quotes"("quoteNumber");

-- CreateIndex
CREATE INDEX "crm_quotes_quoteNumber_idx" ON "crm_quotes"("quoteNumber");

-- CreateIndex
CREATE INDEX "crm_quotes_status_idx" ON "crm_quotes"("status");

-- CreateIndex
CREATE INDEX "crm_quote_items_quoteId_idx" ON "crm_quote_items"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "crm_institutions_code_key" ON "crm_institutions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "crm_institutions_aisheCode_key" ON "crm_institutions"("aisheCode");

-- CreateIndex
CREATE INDEX "crm_institutions_name_idx" ON "crm_institutions"("name");

-- CreateIndex
CREATE INDEX "crm_institutions_type_idx" ON "crm_institutions"("type");

-- CreateIndex
CREATE INDEX "crm_institutions_healthScore_idx" ON "crm_institutions"("healthScore");

-- CreateIndex
CREATE UNIQUE INDEX "crm_mous_mouNumber_key" ON "crm_mous"("mouNumber");

-- CreateIndex
CREATE INDEX "crm_mous_mouNumber_idx" ON "crm_mous"("mouNumber");

-- CreateIndex
CREATE INDEX "crm_mous_status_idx" ON "crm_mous"("status");

-- CreateIndex
CREATE UNIQUE INDEX "academic_programs_code_key" ON "academic_programs"("code");

-- CreateIndex
CREATE INDEX "academic_programs_division_idx" ON "academic_programs"("division");

-- CreateIndex
CREATE INDEX "academic_programs_isActive_idx" ON "academic_programs"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "academic_curriculum_modules_programId_moduleNumber_key" ON "academic_curriculum_modules"("programId", "moduleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "academic_batches_batchCode_key" ON "academic_batches"("batchCode");

-- CreateIndex
CREATE INDEX "academic_batches_batchCode_idx" ON "academic_batches"("batchCode");

-- CreateIndex
CREATE INDEX "academic_batches_status_idx" ON "academic_batches"("status");

-- CreateIndex
CREATE UNIQUE INDEX "academic_batch_sessions_batchId_sessionNumber_key" ON "academic_batch_sessions"("batchId", "sessionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "lms_courses_code_key" ON "lms_courses"("code");

-- CreateIndex
CREATE INDEX "lms_courses_category_idx" ON "lms_courses"("category");

-- CreateIndex
CREATE INDEX "lms_courses_isPublished_idx" ON "lms_courses"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "lms_lessons_courseId_lessonNumber_key" ON "lms_lessons"("courseId", "lessonNumber");

-- CreateIndex
CREATE UNIQUE INDEX "lms_assignment_submissions_assignmentId_studentId_key" ON "lms_assignment_submissions"("assignmentId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "lms_certificates_certificateNumber_key" ON "lms_certificates"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "lms_certificates_verificationToken_key" ON "lms_certificates"("verificationToken");

-- CreateIndex
CREATE INDEX "lms_certificates_certificateNumber_idx" ON "lms_certificates"("certificateNumber");

-- CreateIndex
CREATE INDEX "lms_certificates_verificationToken_idx" ON "lms_certificates"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "academic_students_studentId_key" ON "academic_students"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "academic_students_userId_key" ON "academic_students"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "academic_students_email_key" ON "academic_students"("email");

-- CreateIndex
CREATE INDEX "academic_students_studentId_idx" ON "academic_students"("studentId");

-- CreateIndex
CREATE INDEX "academic_students_email_idx" ON "academic_students"("email");

-- CreateIndex
CREATE INDEX "academic_students_batchId_idx" ON "academic_students"("batchId");

-- CreateIndex
CREATE INDEX "academic_student_fees_studentId_idx" ON "academic_student_fees"("studentId");

-- CreateIndex
CREATE INDEX "academic_student_fees_status_idx" ON "academic_student_fees"("status");

-- CreateIndex
CREATE UNIQUE INDEX "academic_student_grievances_ticketNumber_key" ON "academic_student_grievances"("ticketNumber");

-- CreateIndex
CREATE INDEX "academic_student_grievances_studentId_idx" ON "academic_student_grievances"("studentId");

-- CreateIndex
CREATE INDEX "academic_student_grievances_status_idx" ON "academic_student_grievances"("status");

-- CreateIndex
CREATE UNIQUE INDEX "pm_projects_code_key" ON "pm_projects"("code");

-- CreateIndex
CREATE INDEX "pm_projects_code_idx" ON "pm_projects"("code");

-- CreateIndex
CREATE INDEX "pm_projects_status_idx" ON "pm_projects"("status");

-- CreateIndex
CREATE INDEX "pm_projects_division_idx" ON "pm_projects"("division");

-- CreateIndex
CREATE INDEX "pm_milestones_projectId_idx" ON "pm_milestones"("projectId");

-- CreateIndex
CREATE INDEX "pm_tasks_projectId_idx" ON "pm_tasks"("projectId");

-- CreateIndex
CREATE INDEX "pm_tasks_status_idx" ON "pm_tasks"("status");

-- CreateIndex
CREATE INDEX "pm_timesheets_employeeId_idx" ON "pm_timesheets"("employeeId");

-- CreateIndex
CREATE INDEX "pm_timesheets_date_idx" ON "pm_timesheets"("date");

-- CreateIndex
CREATE UNIQUE INDEX "procurement_purchase_orders_poNumber_key" ON "procurement_purchase_orders"("poNumber");

-- CreateIndex
CREATE INDEX "procurement_purchase_orders_poNumber_idx" ON "procurement_purchase_orders"("poNumber");

-- CreateIndex
CREATE INDEX "procurement_purchase_orders_status_idx" ON "procurement_purchase_orders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "procurement_goods_receipt_notes_grnNumber_key" ON "procurement_goods_receipt_notes"("grnNumber");

-- CreateIndex
CREATE INDEX "procurement_goods_receipt_notes_grnNumber_idx" ON "procurement_goods_receipt_notes"("grnNumber");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_sku_key" ON "inventory_items"("sku");

-- CreateIndex
CREATE INDEX "inventory_items_sku_idx" ON "inventory_items"("sku");

-- CreateIndex
CREATE INDEX "inventory_items_category_idx" ON "inventory_items"("category");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_kit_boms_kitSku_componentItemId_key" ON "inventory_kit_boms"("kitSku", "componentItemId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_stock_levels_itemId_branchId_key" ON "inventory_stock_levels"("itemId", "branchId");

-- CreateIndex
CREATE INDEX "inventory_stock_movements_itemId_idx" ON "inventory_stock_movements"("itemId");

-- CreateIndex
CREATE INDEX "inventory_stock_movements_timestamp_idx" ON "inventory_stock_movements"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "assets_register_assetTag_key" ON "assets_register"("assetTag");

-- CreateIndex
CREATE INDEX "assets_register_assetTag_idx" ON "assets_register"("assetTag");

-- CreateIndex
CREATE INDEX "assets_register_category_idx" ON "assets_register"("category");

-- CreateIndex
CREATE INDEX "assets_register_status_idx" ON "assets_register"("status");

-- CreateIndex
CREATE INDEX "assets_maintenance_assetId_idx" ON "assets_maintenance"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "cms_pages_slug_key" ON "cms_pages"("slug");

-- CreateIndex
CREATE INDEX "cms_pages_slug_idx" ON "cms_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cms_blog_posts_slug_key" ON "cms_blog_posts"("slug");

-- CreateIndex
CREATE INDEX "cms_blog_posts_slug_idx" ON "cms_blog_posts"("slug");

-- CreateIndex
CREATE INDEX "cms_blog_posts_category_idx" ON "cms_blog_posts"("category");

-- CreateIndex
CREATE UNIQUE INDEX "cms_events_slug_key" ON "cms_events"("slug");

-- CreateIndex
CREATE INDEX "cms_events_slug_idx" ON "cms_events"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticketNumber_key" ON "support_tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "support_tickets_ticketNumber_idx" ON "support_tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_category_idx" ON "support_tickets"("category");

-- CreateIndex
CREATE INDEX "support_ticket_comments_ticketId_idx" ON "support_ticket_comments"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_executions_obligationId_periodMonth_periodYear_key" ON "compliance_executions"("obligationId", "periodMonth", "periodYear");

-- AddForeignKey
ALTER TABLE "ats_job_postings" ADD CONSTRAINT "ats_job_postings_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "hrms_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ats_job_postings" ADD CONSTRAINT "ats_job_postings_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "hrms_designations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ats_job_applications" ADD CONSTRAINT "ats_job_applications_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "ats_job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ats_job_applications" ADD CONSTRAINT "ats_job_applications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "ats_candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ats_interviews" ADD CONSTRAINT "ats_interviews_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ats_job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ats_interviews" ADD CONSTRAINT "ats_interviews_interviewerEmployeeId_fkey" FOREIGN KEY ("interviewerEmployeeId") REFERENCES "hrms_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ats_offer_letters" ADD CONSTRAINT "ats_offer_letters_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ats_job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ats_offer_letters" ADD CONSTRAINT "ats_offer_letters_offeredDesignationId_fkey" FOREIGN KEY ("offeredDesignationId") REFERENCES "hrms_designations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_leads" ADD CONSTRAINT "crm_leads_assignedEmployeeId_fkey" FOREIGN KEY ("assignedEmployeeId") REFERENCES "hrms_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_contacts" ADD CONSTRAINT "crm_contacts_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "crm_institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "crm_institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_ownerEmployeeId_fkey" FOREIGN KEY ("ownerEmployeeId") REFERENCES "hrms_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_deal_stage_history" ADD CONSTRAINT "crm_deal_stage_history_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "crm_deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_quotes" ADD CONSTRAINT "crm_quotes_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "crm_deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_quotes" ADD CONSTRAINT "crm_quotes_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "crm_institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_quote_items" ADD CONSTRAINT "crm_quote_items_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "crm_quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_mous" ADD CONSTRAINT "crm_mous_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "crm_institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_mous" ADD CONSTRAINT "crm_mous_techm4SignatoryEmployeeId_fkey" FOREIGN KEY ("techm4SignatoryEmployeeId") REFERENCES "hrms_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_curriculum_modules" ADD CONSTRAINT "academic_curriculum_modules_programId_fkey" FOREIGN KEY ("programId") REFERENCES "academic_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_batches" ADD CONSTRAINT "academic_batches_programId_fkey" FOREIGN KEY ("programId") REFERENCES "academic_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_batches" ADD CONSTRAINT "academic_batches_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "crm_institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_batches" ADD CONSTRAINT "academic_batches_leadFacultyEmployeeId_fkey" FOREIGN KEY ("leadFacultyEmployeeId") REFERENCES "hrms_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_batch_sessions" ADD CONSTRAINT "academic_batch_sessions_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "academic_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_courses" ADD CONSTRAINT "lms_courses_programId_fkey" FOREIGN KEY ("programId") REFERENCES "academic_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_courses" ADD CONSTRAINT "lms_courses_instructorEmployeeId_fkey" FOREIGN KEY ("instructorEmployeeId") REFERENCES "hrms_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_lessons" ADD CONSTRAINT "lms_lessons_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "lms_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_assignments" ADD CONSTRAINT "lms_assignments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "lms_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_assignment_submissions" ADD CONSTRAINT "lms_assignment_submissions_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "lms_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_assignment_submissions" ADD CONSTRAINT "lms_assignment_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "academic_students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_certificates" ADD CONSTRAINT "lms_certificates_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "academic_students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_certificates" ADD CONSTRAINT "lms_certificates_programId_fkey" FOREIGN KEY ("programId") REFERENCES "academic_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_students" ADD CONSTRAINT "academic_students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_students" ADD CONSTRAINT "academic_students_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "crm_institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_students" ADD CONSTRAINT "academic_students_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "academic_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_student_fees" ADD CONSTRAINT "academic_student_fees_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "academic_students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_student_grievances" ADD CONSTRAINT "academic_student_grievances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "academic_students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_projects" ADD CONSTRAINT "pm_projects_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "crm_institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_projects" ADD CONSTRAINT "pm_projects_leadEmployeeId_fkey" FOREIGN KEY ("leadEmployeeId") REFERENCES "hrms_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_milestones" ADD CONSTRAINT "pm_milestones_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "pm_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_tasks" ADD CONSTRAINT "pm_tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "pm_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_tasks" ADD CONSTRAINT "pm_tasks_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "pm_milestones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_tasks" ADD CONSTRAINT "pm_tasks_assigneeEmployeeId_fkey" FOREIGN KEY ("assigneeEmployeeId") REFERENCES "hrms_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_timesheets" ADD CONSTRAINT "pm_timesheets_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "pm_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_timesheets" ADD CONSTRAINT "pm_timesheets_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hrms_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_purchase_orders" ADD CONSTRAINT "procurement_purchase_orders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_goods_receipt_notes" ADD CONSTRAINT "procurement_goods_receipt_notes_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "procurement_purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_kit_boms" ADD CONSTRAINT "inventory_kit_boms_componentItemId_fkey" FOREIGN KEY ("componentItemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stock_levels" ADD CONSTRAINT "inventory_stock_levels_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stock_levels" ADD CONSTRAINT "inventory_stock_levels_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "hrms_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stock_movements" ADD CONSTRAINT "inventory_stock_movements_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets_register" ADD CONSTRAINT "assets_register_assignedEmployeeId_fkey" FOREIGN KEY ("assignedEmployeeId") REFERENCES "hrms_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets_register" ADD CONSTRAINT "assets_register_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "hrms_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets_maintenance" ADD CONSTRAINT "assets_maintenance_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets_register"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_blog_posts" ADD CONSTRAINT "cms_blog_posts_authorEmployeeId_fkey" FOREIGN KEY ("authorEmployeeId") REFERENCES "hrms_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_requesterUserId_fkey" FOREIGN KEY ("requesterUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_ticket_comments" ADD CONSTRAINT "support_ticket_comments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_executions" ADD CONSTRAINT "compliance_executions_obligationId_fkey" FOREIGN KEY ("obligationId") REFERENCES "compliance_obligations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

