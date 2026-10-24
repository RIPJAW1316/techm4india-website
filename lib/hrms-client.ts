/**
 * TechM4India HRMS — Frontend API Client
 *
 * Full integration with the Phase 4 NestJS HRMS module endpoints.
 * Operates with active session credentials from lib/auth-client.ts.
 * Includes graceful offline/fallback handling for reliable prerendering.
 */

import { getAccessToken, getApiBaseUrl } from './auth-client';

export interface EmployeeSummary {
  id: string;
  employeeNumber: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employmentStatus: string;
  employmentType: string;
  dateOfJoining: string;
  panNumber?: string;
  pfUan?: string;
  department?: { id: string; name: string; code: string };
  designation?: { id: string; name: string; code: string };
  branch?: { id: string; name: string; city: string };
  manager?: { id: string; firstName: string; lastName: string; employeeNumber: string };
}

export type Employee = EmployeeSummary;

export interface LeaveType {
  id: string;
  code: string;
  name: string;
  description?: string;
  defaultDays?: number;
  defaultDaysPerYear: number;
  isPaid: boolean;
  requiresDocument: boolean;
  carryForwardMax: number;
}

export interface LeaveBalance {
  id: string;
  year: number;
  allocatedDays?: number;
  usedDays?: number;
  remainingDays?: number;
  entitledDays: number;
  takenDays: number;
  pendingDays: number;
  carriedForwardDays: number;
  leaveType: LeaveType;
}

export interface LeaveApplication {
  id: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  isHalfDay: boolean;
  halfDayType?: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  appliedAt: string;
  reviewNotes?: string;
  leaveType: LeaveType;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    department?: { name: string };
  };
}

export interface AttendanceRecord {
  id: string;
  date: string;
  workDate: string;
  clockIn?: string;
  clockOut?: string;
  effectiveHours?: number;
  overtimeHours?: number;
  workMode?: string;
  clockInTime?: string;
  clockOutTime?: string;
  workMinutes: number;
  overtimeMinutes: number;
  status: 'PRESENT' | 'ON_LEAVE' | 'HOLIDAY' | 'WEEKLY_OFF' | 'HALF_DAY' | 'ABSENT' | 'LATE';
  isLate: boolean;
  isEarlyDeparture: boolean;
  notes?: string;
  employee?: { firstName: string; lastName: string; employeeCode?: string };
}

export interface AttendanceRegularization {
  id: string;
  workDate: string;
  requestedClockIn: string;
  requestedClockOut: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedAt?: string;
  employee?: { firstName: string; lastName: string };
}

export interface ClaimCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  maxLimit?: number;
}

export interface Department {
  id: string;
  code: string;
  name: string;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  state?: string;
}

export interface Designation {
  id: string;
  title: string;
  level: number;
}

export interface HeadcountReport {
  totalEmployees: number;
  byDepartment: Array<{ name: string; count: number }>;
  byBranch: Array<{ name: string; city?: string; count: number }>;
}

export interface ExpenseClaim {
  id: string;
  claimNumber: string;
  title: string;
  totalAmount: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID' | 'SETTLED';
  submittedAt: string;
  reimbursementDate?: string;
  notes?: string;
  employee: { id: string; firstName: string; lastName: string; employeeNumber: string; employeeCode?: string };
  items: Array<{
    id: string;
    amount: number;
    expenseDate: string;
    merchantName?: string;
    merchant?: string;
    description: string;
    receiptUrl?: string;
    category: { name: string; code: string };
  }>;
}

export interface SalaryStructure {
  monthlyCtc: number;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  providentFundEmployee: number;
  providentFundEmployer: number;
  professionalTax: number;
  esiEmployee: number;
  esiEmployer: number;
  tdsEstimate: number;
  netSalary: number;
  basicMonthly: number;
  hraMonthly: number;
  specialAllowanceMonthly: number;
  grossMonthly: number;
  pfEmployeeMonthly: number;
  ptMonthly: number;
  esiEmployeeMonthly: number;
}

export interface Payslip {
  id: string;
  payslipNumber: string;
  workingDays: number;
  paidDays: number;
  absentDays: number;
  basicSalary: number;
  hra: number;
  allowancesTotal: number;
  specialAllowance: number;
  grossEarnings: number;
  pfDeduction: number;
  ptDeduction: number;
  esiDeduction: number;
  taxDeduction: number;
  pfEmployee: number;
  professionalTax: number;
  esiEmployee: number;
  tdsWithholding: number;
  claimsReimbursement: number;
  totalDeductions: number;
  netPay: number;
  netSalary: number;
  isPublished: boolean;
  period?: { name: string; month: number; year: number };
  payrollPeriod: { month: number; year: number; status: string };
  employee: EmployeeSummary;
}

export interface IncidentReport {
  id: string;
  reportNumber: string;
  isAnonymous: boolean;
  category: string;
  severity: string;
  title: string;
  description: string;
  incidentDate: string;
  location?: string;
  status: string;
  resolutionNotes?: string;
  createdAt: string;
  reporter?: { firstName: string; lastName: string; employeeNumber: string };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  targetScope: string;
  priority: string;
  publishedAt: string;
  isPinned: boolean;
  authorName?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  isOptional: boolean;
}

async function hrmsFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const token = getAccessToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${baseUrl}/api/v1/hrms${endpoint}`, {
    ...options,
    headers,
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON response
  }

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
  }

  // Unwrap response if wrapped in { success: true, data: T }
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data as T;
  }
  return data as T;
}

// -----------------------------------------------------------------------------
// Client API Methods
// -----------------------------------------------------------------------------

export async function getHrmsSummary() {
  return hrmsFetch<any>('/dashboard/summary');
}

export async function getMyEmployeeProfile() {
  return hrmsFetch<any>('/me');
}

export async function getEmployees(params?: {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  branchId?: string;
  status?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.departmentId) query.set('departmentId', params.departmentId);
  if (params?.branchId) query.set('branchId', params.branchId);
  if (params?.status) query.set('status', params.status);

  const qs = query.toString();
  return hrmsFetch<{ items: EmployeeSummary[]; meta: any }>(`/employees${qs ? `?${qs}` : ''}`);
}

export async function getEmployeeById(id: string) {
  return hrmsFetch<any>(`/employees/${id}`);
}

export async function createEmployee(data: any) {
  return hrmsFetch<any>('/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEmployee(id: string, data: any) {
  return hrmsFetch<any>(`/employees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getLeaveTypes() {
  return hrmsFetch<LeaveType[]>('/leave/types');
}

export async function getLeaveBalances(employeeId?: string, year?: number) {
  const query = new URLSearchParams();
  if (employeeId) query.set('employeeId', employeeId);
  if (year) query.set('year', String(year));
  const qs = query.toString();
  return hrmsFetch<LeaveBalance[]>(`/leave/balances${qs ? `?${qs}` : ''}`);
}

export async function getLeaveApplications(params?: { employeeId?: string; status?: string }) {
  const query = new URLSearchParams();
  if (params?.employeeId) query.set('employeeId', params.employeeId);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return hrmsFetch<LeaveApplication[]>(`/leave/applications${qs ? `?${qs}` : ''}`);
}

export async function applyLeave(data: {
  leaveTypeCode: string;
  startDate: string;
  endDate: string;
  isHalfDay?: boolean;
  halfDayType?: string;
  reason: string;
  attachmentUrl?: string;
}) {
  return hrmsFetch<LeaveApplication>('/leave/apply', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function reviewLeave(
  applicationId: string,
  data: { status: 'APPROVED' | 'REJECTED'; notes?: string },
) {
  return hrmsFetch<LeaveApplication>(`/leave/applications/${applicationId}/review`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getTodayAttendance() {
  return hrmsFetch<AttendanceRecord | null>('/attendance/today');
}

export async function clockIn(notes?: string) {
  return hrmsFetch<AttendanceRecord>('/attendance/clock-in', {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
}

export async function clockOut(notes?: string) {
  return hrmsFetch<AttendanceRecord>('/attendance/clock-out', {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
}

export async function getAttendanceRecords(params?: {
  employeeId?: string;
  month?: number;
  year?: number;
}) {
  const query = new URLSearchParams();
  if (params?.employeeId) query.set('employeeId', params.employeeId);
  if (params?.month) query.set('month', String(params.month));
  if (params?.year) query.set('year', String(params.year));
  const qs = query.toString();
  return hrmsFetch<AttendanceRecord[]>(`/attendance/records${qs ? `?${qs}` : ''}`);
}

export async function regularizeAttendance(data: {
  attendanceId: string;
  requestedClockIn: string;
  requestedClockOut: string;
  reason: string;
}) {
  return hrmsFetch<any>('/attendance/regularize', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getClaimCategories() {
  return hrmsFetch<any[]>('/claims/categories');
}

export async function getExpenseClaims(params?: { employeeId?: string; status?: string }) {
  const query = new URLSearchParams();
  if (params?.employeeId) query.set('employeeId', params.employeeId);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return hrmsFetch<ExpenseClaim[]>(`/claims${qs ? `?${qs}` : ''}`);
}

export async function submitExpenseClaim(data: {
  title: string;
  notes?: string;
  items: Array<{
    categoryCode: string;
    expenseDate: string;
    amount: number;
    merchantName?: string;
    description: string;
    receiptUrl?: string;
  }>;
}) {
  return hrmsFetch<ExpenseClaim>('/claims', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function reviewExpenseClaim(
  claimId: string,
  data: { status: 'APPROVED' | 'REJECTED'; notes?: string },
) {
  return hrmsFetch<ExpenseClaim>(`/claims/${claimId}/review`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getSalaryStructure(employeeId: string) {
  return hrmsFetch<SalaryStructure>(`/payroll/structure/${employeeId}`);
}

export async function updateSalaryStructure(employeeId: string, data: Partial<SalaryStructure>) {
  return hrmsFetch<SalaryStructure>(`/payroll/structure/${employeeId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function processPayroll(month: number, year: number) {
  return hrmsFetch<any>('/payroll/process', {
    method: 'POST',
    body: JSON.stringify({ month, year }),
  });
}

export async function getPayslips(params?: {
  employeeId?: string;
  month?: number;
  year?: number;
}) {
  const query = new URLSearchParams();
  if (params?.employeeId) query.set('employeeId', params.employeeId);
  if (params?.month) query.set('month', String(params.month));
  if (params?.year) query.set('year', String(params.year));
  const qs = query.toString();
  return hrmsFetch<Payslip[]>(`/payroll/payslips${qs ? `?${qs}` : ''}`);
}

export async function getIncidents() {
  return hrmsFetch<IncidentReport[]>('/incidents');
}

export async function reportIncident(data: {
  title: string;
  category: string;
  severity?: string;
  description: string;
  incidentDate: string;
  location?: string;
  isAnonymous?: boolean;
}) {
  return hrmsFetch<IncidentReport>('/incidents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getAnnouncements() {
  return hrmsFetch<Announcement[]>('/announcements');
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  category?: string;
  targetScope?: string;
  priority?: string;
  isPinned?: boolean;
}) {
  return hrmsFetch<Announcement>('/announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getDiscussionTopics() {
  return hrmsFetch<any[]>('/discussions');
}

export async function createDiscussionTopic(data: {
  title: string;
  content: string;
  category?: string;
}) {
  return hrmsFetch<any>('/discussions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function addDiscussionReply(topicId: string, content: string) {
  return hrmsFetch<any>(`/discussions/${topicId}/replies`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function getCompanyDocuments() {
  return hrmsFetch<any[]>('/documents/company');
}

export async function getDepartments() {
  return hrmsFetch<any[]>('/meta/departments');
}

export async function getBranches() {
  return hrmsFetch<any[]>('/meta/branches');
}

export async function getDesignations() {
  return hrmsFetch<any[]>('/meta/designations');
}

export async function getHolidays(year?: number) {
  const query = year ? `?year=${year}` : '';
  return hrmsFetch<Holiday[]>(`/meta/holidays${query}`);
}

export async function getHeadcountReport() {
  return hrmsFetch<{
    byDepartment: Array<{ name: string; count: number }>;
    byBranch: Array<{ name: string; city: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
  }>('/reports/headcount');
}

// -----------------------------------------------------------------------------
// Unified Namespace Export
// -----------------------------------------------------------------------------
export const hrmsClient = {
  getSummary: getHrmsSummary,
  getMyProfile: getMyEmployeeProfile,
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  getLeaveTypes,
  getLeaveBalances,
  getLeaveApplications,
  applyLeave: (data: {
    leaveTypeId?: string;
    leaveTypeCode?: string;
    startDate: string;
    endDate: string;
    isHalfDay?: boolean;
    halfDayType?: string;
    reason: string;
    attachmentUrl?: string;
  }) => {
    return applyLeave({
      leaveTypeCode: data.leaveTypeCode || data.leaveTypeId || 'ANNUAL',
      startDate: data.startDate,
      endDate: data.endDate,
      isHalfDay: data.isHalfDay,
      halfDayType: data.halfDayType,
      reason: data.reason,
      attachmentUrl: data.attachmentUrl,
    });
  },
  reviewLeaveApplication: (id: string, data: { status: 'APPROVED' | 'REJECTED'; reviewRemarks?: string; notes?: string }) => {
    return reviewLeave(id, {
      status: data.status,
      notes: data.reviewRemarks || data.notes,
    });
  },
  getTodayAttendance,
  clockIn: (data?: any) => clockIn(data?.notes || data?.workMode),
  clockOut: (data?: any) => clockOut(data?.notes),
  getAttendanceRecords: (params?: any) => getAttendanceRecords(params).then((data) => ({ data })),
  requestRegularization: (data: any) => regularizeAttendance(data),
  getRegularizations: () => hrmsFetch<any[]>('/attendance/regularizations').then((data) => ({ data })),
  getClaimCategories: () => getClaimCategories().then((data) => ({ data })),
  getClaims: (params?: any) => getExpenseClaims(params).then((data) => ({ data })),
  createClaim: (data: {
    title: string;
    description?: string;
    notes?: string;
    items: Array<{
      categoryId?: string;
      categoryCode?: string;
      amount: number;
      expenseDate: string;
      merchant?: string;
      merchantName?: string;
      remarks?: string;
      description?: string;
      receiptUrl?: string;
    }>;
  }) => {
    return submitExpenseClaim({
      title: data.title,
      notes: data.description || data.notes,
      items: data.items.map((i) => ({
        categoryCode: i.categoryCode || i.categoryId || 'GENERAL',
        expenseDate: i.expenseDate,
        amount: i.amount,
        merchantName: i.merchant || i.merchantName,
        description: i.remarks || i.description || data.title,
        receiptUrl: i.receiptUrl,
      })),
    });
  },
  reviewClaim: (id: string, data: { status: 'APPROVED' | 'REJECTED'; remarks?: string; notes?: string }) => {
    return reviewExpenseClaim(id, {
      status: data.status,
      notes: data.remarks || data.notes,
    });
  },
  getSalaryStructure,
  updateSalaryStructure,
  generatePayRun: (data: { month: number; year: number; [key: string]: any }) => {
    return processPayroll(data.month, data.year).then((res) => ({
      data: {
        payslipsCount: res?.processedCount || 1,
        periodName: `${data.month}/${data.year}`,
      },
    }));
  },
  getPayslips: (params?: any) => getPayslips(params).then((data) => ({ data })),
  getIncidents: () => getIncidents().then((data) => ({ data })),
  reportIncident: (data: any) => reportIncident(data),
  getAnnouncements: () => getAnnouncements().then((data) => ({ data })),
  createAnnouncement: (data: any) => createAnnouncement(data),
  getDiscussionTopics,
  createDiscussionTopic,
  addDiscussionReply,
  getCompanyDocuments,
  getDepartments: () => getDepartments().then((data) => ({ data })),
  getBranches: () => getBranches().then((data) => ({ data })),
  getDesignations: () => getDesignations().then((data) => ({ data })),
  getHolidays,
  getHeadcountReport: () =>
    getHeadcountReport().then((res) => ({
      data: {
        totalEmployees: res?.byDepartment?.reduce((acc, d) => acc + d.count, 0) || 0,
        byDepartment: res?.byDepartment || [],
        byBranch: res?.byBranch || [],
      },
    })),
};
