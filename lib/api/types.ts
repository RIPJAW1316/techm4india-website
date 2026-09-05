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
  manager: { id: string; employeeCode: string; name: string; designation: string | null } | null;
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
  projectManager: { id: string; name: string; designation: string | null } | null;
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
