export type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

export type EmployeeContext = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string | null;
  division: { id: string; slug: string; name: string } | null;
  department: { id: string; slug: string; name: string } | null;
};

export type AuthContext = {
  user: { id: string; email: string; roles: string[] };
  employee: EmployeeContext | null;
  permissions: string[];
};

export type EmployeeProfile = EmployeeContext & {
  email: string;
  phone: string | null;
  joiningDate: string | null;
  profilePhotoUrl: string | null;
  employmentStatus: string;
  manager: {
    id: string;
    employeeCode: string;
    name: string;
    designation: string | null;
  } | null;
  roles: string[];
};

export type Project = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  progress: number;
  startDate: string | null;
  dueDate: string | null;
  division: { id: string; slug: string; name: string };
  projectManager: {
    id: string;
    name: string;
    designation: string | null;
  } | null;
  myMembership?: { role: string } | null;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "BLOCKED" | "REVIEW" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  completedAt: string | null;
  project: { id: string; code: string; name: string };
  assignee: { id: string; name: string; designation: string | null } | null;
  createdBy: { id: string; name: string; designation: string | null } | null;
  commentsCount: number;
};

export type TaskSummary = {
  total: number;
  todo: number;
  inProgress: number;
  blocked: number;
  review: number;
  completed: number;
  cancelled: number;
  overdue: number;
  dueToday: number;
  upcoming: number;
};

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  resourceType: string | null;
  resourceId: string | null;
};

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  businessDate: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  status: string;
  source: string;
  notes: string | null;
  employee?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    division?: { name: string; slug: string } | null;
  };
};
export type AttendanceSummary = {
  date: string;
  employeesExpected: number;
  present: number;
  absent: number;
  onLeave: number;
  remote: number;
  halfDay: number;
  missingCheckout: number;
  holiday: number;
};
export type LeaveType = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  unit: string;
  annualAllowance: number | null;
  balanceTracked?: boolean;
  isActive: boolean;
  isPaid: boolean;
};
export type LeaveBalance = {
  id: string;
  year: number;
  openingBalance: number;
  accrued: number;
  used: number;
  adjusted: number;
  carriedForward: number;
  leaveType: LeaveType;
  employee?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    division?: { name: string } | null;
  };
};
export type LeaveApplication = {
  id: string;
  startDate: string;
  endDate: string;
  dayCount: number;
  reason: string;
  status: string;
  reviewComment: string | null;
  createdAt: string;
  leaveType: LeaveType;
  employee?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    division?: { name: string; slug: string } | null;
  };
};
export type Holiday = {
  id: string;
  name: string;
  date: string;
  type: string;
  description: string | null;
  isOptional: boolean;
  divisionId: string | null;
  branchId: string | null;
};

export type CrmOwner = {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
};
export type CrmLead = {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  designation: string | null;
  source: string;
  status: string;
  ownerEmployeeId: string | null;
  owner?: CrmOwner | null;
  estimatedValue: string | number | null;
  currency: string | null;
  nextFollowUpAt: string | null;
  lastContactedAt: string | null;
  notes: string | null;
  convertedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  convertedAccount?: { id: string; name: string } | null;
  convertedContact?: { id: string; firstName: string; lastName: string } | null;
  convertedOpportunity?: { id: string; name: string; stage: string } | null;
};
export type CrmAccount = {
  id: string;
  name: string;
  displayName: string | null;
  accountType: string;
  status: string;
  industry: string | null;
  email: string | null;
  phone: string | null;
  ownerEmployeeId: string | null;
  owner?: CrmOwner | null;
  archivedAt: string | null;
  createdAt: string;
  _count?: { contacts: number; opportunities: number; activities: number };
};
export type CrmContact = {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  email: string | null;
  owner?: CrmOwner | null;
  account?: { id: string; name: string } | null;
  createdAt: string;
};
export type CrmOpportunity = {
  id: string;
  name: string;
  stage: string;
  estimatedValue: string | number | null;
  currency: string | null;
  expectedCloseDate: string | null;
  closedAt: string | null;
  lostReason: string | null;
  ownerEmployeeId: string | null;
  owner?: CrmOwner | null;
  account?: { id: string; name: string } | null;
  primaryContact?: { id: string; firstName: string; lastName: string } | null;
  archivedAt: string | null;
  createdAt: string;
};
export type CrmActivity = {
  id: string;
  type: string;
  subject: string;
  description: string | null;
  dueAt: string | null;
  completedAt: string | null;
  owner?: CrmOwner | null;
  lead?: { id: string; firstName: string; lastName: string } | null;
  account?: { id: string; name: string } | null;
  opportunity?: { id: string; name: string; stage: string } | null;
  createdAt: string;
};
export type CrmDashboard = {
  leadCounts: Record<string, number>;
  leadSources: Record<string, number>;
  openLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  opportunityStages: {
    stage: string;
    currency: string;
    count: number;
    estimatedValue: string;
  }[];
  openOpportunityCount: number;
  wonCount: number;
  lostCount: number;
  pipelineByCurrency: Record<string, string>;
  wonByCurrency: Record<string, string>;
  upcomingFollowUps: CrmActivity[];
  overdueFollowUps: CrmActivity[];
  recentActivities: CrmActivity[];
};

export type ExecutiveSummary = {
  employeesTotal: number;
  employeesActive: number;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
  activeProjects: number;
};

export type ExecutiveEmployee = {
  id: string;
  employeeCode: string;
  name: string;
  designation: string | null;
  status: string;
  division: { id: string; name: string; slug: string };
  department: { id: string; name: string } | null;
  workSummary: {
    active: number;
    completed: number;
    overdue: number;
    total: number;
  };
};

export type ExecutiveProject = {
  id: string;
  code: string;
  name: string;
  status: string;
  division: { id: string; name: string; slug: string };
};

export type ExecutiveTask = {
  id: string;
  title: string;
  description: string | null;
  status: Task["status"];
  priority: Task["priority"];
  dueDate: string | null;
  completedAt: string | null;
  project: { id: string; code: string; name: string };
  assignee: { id: string; name: string; designation: string | null } | null;
  createdBy: { id: string; name: string; designation: string | null } | null;
};

export type ExecutiveWorkDetail = {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    name: string;
    designation: string | null;
    employmentStatus: string;
    division: { id: string; name: string; slug: string };
    department: { id: string; name: string } | null;
  };
  taskSummary: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    overdue: number;
  };
  activeTasks: ExecutiveTask[];
  completedTasks: ExecutiveTask[];
  cancelledTasks: ExecutiveTask[];
  projects: Array<{ id: string; code: string; name: string }>;
};

export type CompanyProfile = {
  id: string;
  legalName: string;
  slug: string;
  displayName: string | null;
  tradeName: string | null;
  registeredAddressLine1: string | null;
  registeredAddressLine2: string | null;
  registeredCity: string | null;
  registeredState: string | null;
  registeredPostalCode: string | null;
  registeredCountry: string | null;
  website: string | null;
  officialEmail: string | null;
  officialPhone: string | null;
  mission: string | null;
  vision: string | null;
  companyValues: string | null;
  logoUrl: string | null;
  status: string;
  identifiers: {
    cin: string | null;
    dpiitNumber: string | null;
    gstin: string | null;
    pan: string | null;
    tan: string | null;
  };
};

export type CompanyDivision = {
  id: string;
  slug: string;
  name: string;
  status: string;
  _count: { departments: number; employees: number };
};
export type CompanyDepartment = {
  id: string;
  divisionId: string;
  slug: string;
  name: string;
  status: string;
  _count: { employees: number };
};
export type CompanyBranch = {
  id: string;
  code: string;
  name: string;
  type: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
export type CompanyTeam = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  division: { id: string; name: string; slug: string } | null;
  department: { id: string; name: string; slug: string } | null;
  leadEmployee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  } | null;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
};
export type CompanyTeamMember = {
  id: string;
  role: string;
  joinedAt: string;
  removedAt: string | null;
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    designation: string | null;
    employmentStatus: string;
    division: { id: string; name: string; slug: string } | null;
    department: { id: string; name: string; slug: string } | null;
  };
};
export type CompanyCostCentre = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  division: { id: string; name: string; slug: string } | null;
  department: { id: string; name: string; slug: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type HrEmployeeSummary = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  officialEmail: string;
  designation: string | null;
  gradeText: string | null;
  phone: string | null;
  personalEmail: string | null;
  joiningDate: string | null;
  confirmationDate?: string | null;
  probationEndDate?: string | null;
  employmentType: string;
  employmentStatus: string;
  division: { id: string; name: string; slug: string } | null;
  department: { id: string; name: string; slug: string } | null;
  branch: {
    id: string;
    code: string;
    name: string;
    type: string;
    city: string | null;
    state: string | null;
  } | null;
  manager: {
    id: string;
    employeeCode: string;
    name: string;
    designation: string | null;
  } | null;
  directReportCount: number;
  teams: Array<{
    id: string;
    code: string;
    name: string;
    role: string;
    joinedAt: string;
  }>;
};

export type HrEmployeeDetail = HrEmployeeSummary & {
  firstName: string;
  lastName: string;
  alternatePhone: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  bloodGroup: string | null;
  profilePhotoUrl: string | null;
  directReports: Array<{
    id: string;
    employeeCode: string;
    name: string;
    designation: string | null;
    employmentStatus: string;
  }>;
  addresses: Array<{
    id: string;
    type: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isPrimary: boolean;
  }>;
  emergencyContacts: Array<{
    id: string;
    name: string;
    relationship: string;
    phone: string;
    alternatePhone: string | null;
    email: string | null;
    isPrimary: boolean;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: string | null;
    yearsExperience: number | string | null;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    issuedAt: string | null;
    expiresAt: string | null;
    credentialId: string | null;
    credentialUrl: string | null;
  }>;
  education: Array<{
    id: string;
    institution: string;
    qualification: string;
    fieldOfStudy: string | null;
    startDate: string | null;
    endDate: string | null;
    gradeOrScore: string | null;
  }>;
  employmentHistory: Array<{
    id: string;
    eventType: string;
    effectiveDate: string;
    summary: string;
    previousValue: unknown;
    newValue: unknown;
    createdAt: string;
  }>;
};

export type RecruitmentDashboard = {
  requisitions: Partial<Record<JobRequisitionStatus, number>>;
  applicants: Partial<Record<RecruitmentApplicantStatus, number>>;
  upcomingInterviews: number;
  outstandingOnboardingTasks: number;
};

export type JobRequisitionStatus =
  "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "OPEN" | "ON_HOLD" | "CLOSED" | "CANCELLED";

export type RecruitmentApplicantStatus =
  "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFERED" | "HIRED" | "REJECTED" | "WITHDRAWN";

export type JobRequisition = {
  id: string;
  code: string;
  title: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
  openings: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: JobRequisitionStatus;
  description: string;
  requirements: string | null;
  location: string | null;
  division: { id: string; name: string; slug: string } | null;
  department: { id: string; name: string; slug: string } | null;
  hiringManager: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    designation: string | null;
  } | null;
  _count: { applicants: number };
  createdAt: string;
  updatedAt: string;
};

export type RecruitmentInterview = {
  id: string;
  roundName: string;
  scheduledAt: string;
  durationMinutes: number;
  mode: "IN_PERSON" | "VIDEO" | "PHONE";
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  score: string | null;
  recommendation: "STRONG_HIRE" | "HIRE" | "HOLD" | "NO_HIRE" | null;
  feedback: string | null;
  interviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    designation: string | null;
  };
};

export type RecruitmentOffer = {
  id: string;
  annualCtc: string;
  currency: string;
  joiningDate: string;
  status: "DRAFT" | "ISSUED" | "ACCEPTED" | "DECLINED" | "WITHDRAWN" | "EXPIRED";
  issuedAt: string | null;
  respondedAt: string | null;
};

export type RecruitmentOnboardingTask = {
  id: string;
  title: string;
  dueDate: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "WAIVED";
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    designation: string | null;
  };
};

export type RecruitmentApplicant = {
  id: string;
  requisitionId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  source: string;
  status: RecruitmentApplicantStatus;
  consentAt: string;
  resumeUrl: string | null;
  notes: string | null;
  requisition: { id: string; code: string; title: string; status?: JobRequisitionStatus };
  interviews?: RecruitmentInterview[];
  offers?: RecruitmentOffer[];
  onboardingTasks?: RecruitmentOnboardingTask[];
  _count?: { interviews: number; onboardingTasks: number };
  createdAt: string;
  updatedAt: string;
};

export type ProgramStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
export type ProgramDeliveryMode = "ONLINE" | "OFFLINE" | "HYBRID";
export type ProgramContentType = "TEXT" | "VIDEO" | "PDF" | "LIVE";
export type ProgramLessonStatus = "DRAFT" | "PUBLISHED";
export type ProgramBatchStatus = "PLANNED" | "OPEN" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type StudentStatus = "ACTIVE" | "INACTIVE" | "ALUMNI";
export type ProgramEnrollmentStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export type ProgramLesson = {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  contentType: ProgramContentType;
  contentBody: string | null;
  contentUrl: string | null;
  durationMinutes: number;
  position: number;
  status: ProgramLessonStatus;
};

export type ProgramModule = {
  id: string;
  programId: string;
  title: string;
  description: string | null;
  position: number;
  lessons?: ProgramLesson[];
};

export type Program = {
  id: string;
  code: string;
  name: string;
  slug: string;
  version: string;
  category: string;
  subCategory: string | null;
  shortDescription: string;
  longDescription: string | null;
  durationHours: string;
  deliveryMode: ProgramDeliveryMode;
  assessmentMethod: string;
  capacity: number | null;
  status: ProgramStatus;
  division: { id: string; name: string; slug: string } | null;
  department: { id: string; name: string; slug: string } | null;
  modules?: ProgramModule[];
  _count?: { modules: number; batches: number };
  createdAt: string;
  updatedAt: string;
};

export type Student = {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  status: StudentStatus;
  consentAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ProgramEnrollment = {
  id: string;
  batchId: string;
  studentId: string;
  status: ProgramEnrollmentStatus;
  progressPercent: string;
  enrolledAt: string;
  completedAt: string | null;
  student?: {
    id: string;
    studentCode: string;
    firstName: string;
    lastName: string;
  };
};

export type ProgramBatch = {
  id: string;
  programId: string;
  code: string;
  name: string;
  startsOn: string;
  endsOn: string;
  capacity: number;
  status: ProgramBatchStatus;
  program?: { id: string; code: string; name: string; status: ProgramStatus };
  trainer?: {
    id: string;
    firstName: string;
    lastName: string;
    designation: string | null;
  } | null;
  enrollments?: ProgramEnrollment[];
  _count?: { enrollments: number };
  createdAt: string;
  updatedAt: string;
};

export type ProgramAssignment = {
  id: string;
  programId: string;
  title: string;
  instructions: string | null;
  maxScore: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AssignmentSubmissionStatus = "SUBMITTED" | "GRADED" | "RETURNED";

export type AssignmentSubmission = {
  id: string;
  assignmentId: string;
  enrollmentId: string;
  submissionUrl: string | null;
  status: AssignmentSubmissionStatus;
  score: string | null;
  feedback: string | null;
  submittedAt: string;
  gradedAt: string | null;
};

export type ProgramCertificate = {
  id: string;
  enrollmentId: string;
  certificateNumber: string;
  title: string;
  issuedAt: string;
};

export type AnalyticsOverview = {
  education: {
    programs: number;
    publishedPrograms: number;
    students: number;
    activeEnrollments: number;
    certificatesIssued: number;
  };
  operations: {
    openTickets: number;
    pendingCompliance: number;
    publishedContent: number;
  };
  supplyChain: {
    activeVendors: number;
    purchaseOrders: number;
    assets: number;
  };
  people: {
    openReviews: number;
    openRequisitions: number;
  };
};

export type PerformanceCycleType = "ANNUAL" | "HALF_YEARLY" | "QUARTERLY" | "PROBATION";
export type PerformanceCycleStatus = "DRAFT" | "ACTIVE" | "CLOSED";
export type PerformanceGoalCategory = "BUSINESS" | "TECHNICAL" | "BEHAVIORAL" | "LEARNING";
export type PerformanceGoalStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type PerformanceReviewStatus =
  "PENDING_SELF" | "PENDING_MANAGER" | "PENDING_FINALIZATION" | "FINALIZED" | "ACKNOWLEDGED";

export type PerformanceEmployeeRef = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string | null;
};

export type PerformanceCycle = {
  id: string;
  code: string;
  name: string;
  type: PerformanceCycleType;
  startsOn: string;
  endsOn: string;
  ratingScaleMax: number;
  description: string | null;
  status: PerformanceCycleStatus;
  _count?: { goals: number; reviews: number };
  createdAt: string;
  updatedAt: string;
};

export type PerformanceGoal = {
  id: string;
  cycleId: string;
  employeeId: string;
  title: string;
  description: string | null;
  category: PerformanceGoalCategory;
  metric: string | null;
  targetValue: string | null;
  weight: string;
  status: PerformanceGoalStatus;
  progressPercent: string;
  employee?: PerformanceEmployeeRef;
  createdAt: string;
  updatedAt: string;
};

export type PerformanceReview = {
  id: string;
  cycleId: string;
  employeeId: string;
  reviewerEmployeeId: string;
  status: PerformanceReviewStatus;
  selfRating: string | null;
  selfComments: string | null;
  managerRating: string | null;
  managerComments: string | null;
  finalRating: string | null;
  calibrationNotes: string | null;
  acknowledgement: string | null;
  cycle?: {
    id: string;
    code: string;
    name: string;
    status: PerformanceCycleStatus;
    ratingScaleMax: number;
  };
  employee?: PerformanceEmployeeRef;
  reviewer?: PerformanceEmployeeRef;
  createdAt: string;
  updatedAt: string;
};

export type VendorStatus = "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED" | "BLACKLISTED";
export type VendorCategory = "GOODS" | "SERVICES" | "BOTH";

export type Vendor = {
  id: string;
  code: string;
  name: string;
  legalName: string | null;
  category: VendorCategory;
  status: VendorStatus;
  contactEmail: string | null;
  contactPhone: string | null;
  paymentTermsDays: number;
  _count?: { purchaseOrders: number; assets: number };
  createdAt: string;
  updatedAt: string;
};

export type InventoryItemStatus = "ACTIVE" | "DISCONTINUED";

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitOfMeasure: string;
  unitCost: string;
  quantityOnHand: string;
  reorderLevel: string;
  status: InventoryItemStatus;
  createdAt: string;
  updatedAt: string;
};

export type StockMovementType = "RECEIPT" | "ISSUE" | "ADJUSTMENT";

export type StockMovement = {
  id: string;
  itemId: string;
  type: StockMovementType;
  quantity: string;
  balanceAfter: string;
  reference: string | null;
  note: string | null;
  createdAt: string;
};

export type PurchaseOrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "ISSUED"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CLOSED"
  | "CANCELLED";

export type PurchaseOrderItem = {
  id: string;
  itemId: string | null;
  description: string;
  quantity: string;
  unitCost: string;
  receivedQuantity: string;
};

export type PurchaseOrder = {
  id: string;
  code: string;
  title: string;
  status: PurchaseOrderStatus;
  currency: string;
  orderDate: string;
  expectedDate: string | null;
  totalAmount: string;
  vendor?: { id: string; code: string; name: string; status: VendorStatus };
  items?: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type AssetCategory =
  "IT_EQUIPMENT" | "FURNITURE" | "VEHICLE" | "MACHINERY" | "FACILITY" | "OTHER";
export type AssetStatus = "IN_STORE" | "ASSIGNED" | "IN_REPAIR" | "RETIRED";

export type Asset = {
  id: string;
  assetTag: string;
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  serialNumber: string | null;
  location: string | null;
  purchaseCost: string | null;
  vendor?: { id: string; code: string; name: string } | null;
  assignedTo?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type SupportTicketCategory =
  "TECHNICAL" | "ACCESS" | "HR" | "FINANCE" | "FACILITIES" | "OTHER";
export type SupportTicketStatus =
  "OPEN" | "IN_PROGRESS" | "PENDING" | "RESOLVED" | "CLOSED" | "REOPENED";

type SupportPerson = {
  id: string;
  firstName: string;
  lastName: string;
  designation: string | null;
};

export type SupportTicketComment = {
  id: string;
  ticketId: string;
  authorUserId: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
};

export type SupportTicket = {
  id: string;
  code: string;
  subject: string;
  description: string;
  category: SupportTicketCategory;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: SupportTicketStatus;
  slaDueAt: string | null;
  requester?: SupportPerson | null;
  assignee?: SupportPerson | null;
  comments?: SupportTicketComment[];
  _count?: { comments: number };
  createdAt: string;
  updatedAt: string;
};

export type CmsContentType = "PAGE" | "ARTICLE" | "ANNOUNCEMENT" | "FAQ";
export type CmsContentStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";

export type CmsRevision = {
  id: string;
  pageId: string;
  version: number;
  title: string;
  summary: string | null;
  body: string;
  authorUserId: string;
  createdAt: string;
};

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  type: CmsContentType;
  status: CmsContentStatus;
  publishedRevisionId: string | null;
  publishedAt: string | null;
  revisions?: CmsRevision[];
  _count?: { revisions: number };
  createdAt: string;
  updatedAt: string;
};

export type ComplianceCategory =
  "TAX" | "LABOUR" | "CORPORATE" | "DATA_PRIVACY" | "ENVIRONMENTAL" | "LICENSING" | "OTHER";
export type ComplianceFrequency = "ONE_TIME" | "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "ANNUAL";
export type ComplianceStatus = "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED" | "WAIVED";

export type ComplianceEvidence = {
  id: string;
  obligationId: string;
  title: string;
  note: string | null;
  documentUrl: string | null;
  uploadedByUserId: string;
  createdAt: string;
};

export type ComplianceObligation = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  category: ComplianceCategory;
  authority: string | null;
  frequency: ComplianceFrequency;
  dueDate: string;
  status: ComplianceStatus;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    designation: string | null;
  } | null;
  evidence?: ComplianceEvidence[];
  _count?: { evidence: number };
  createdAt: string;
  updatedAt: string;
};

export type ProjectMilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "MISSED";

export type ProjectMilestone = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  dueDate: string;
  status: ProjectMilestoneStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectRiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ProjectRiskLikelihood = "LOW" | "MEDIUM" | "HIGH";
export type ProjectRiskStatus = "OPEN" | "MITIGATING" | "CLOSED" | "ACCEPTED";

export type ProjectRisk = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  severity: ProjectRiskSeverity;
  likelihood: ProjectRiskLikelihood;
  status: ProjectRiskStatus;
  mitigation: string | null;
  owner?: { id: string; firstName: string; lastName: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectSprintStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export type ProjectSprint = {
  id: string;
  projectId: string;
  name: string;
  goal: string | null;
  startsOn: string;
  endsOn: string;
  status: ProjectSprintStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProjectTimeLog = {
  id: string;
  projectId: string;
  employeeId: string;
  workDate: string;
  hours: string;
  note: string | null;
  employee?: { id: string; firstName: string; lastName: string };
  createdAt: string;
};
