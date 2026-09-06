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
  status:
    "TODO" | "IN_PROGRESS" | "BLOCKED" | "REVIEW" | "COMPLETED" | "CANCELLED";
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
    overdue: number;
  };
  activeTasks: ExecutiveTask[];
  completedTasks: ExecutiveTask[];
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
