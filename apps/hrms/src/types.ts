export type HrmsTab =
  | 'overview'
  | 'employees'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'claims';

export interface EmployeeItem {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employmentStatus: 'ACTIVE' | 'PROBATION' | 'NOTICE_PERIOD' | 'TERMINATED';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  dateOfJoining: string;
  department: { id: string; name: string; code: string };
  designation: { id: string; title: string; level: number };
  branch: { id: string; name: string; city: string };
  panNumber?: string;
  pfUan?: string;
  bankAccount?: string;
  bankIfsc?: string;
  bankName?: string;
  ctcAnnual?: number;
}

export interface AttendanceRecord {
  id: string;
  workDate: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE' | 'HALF_DAY';
  workMode: 'OFFICE' | 'REMOTE' | 'FIELD';
  totalHours?: number;
  shiftName: string;
  notes?: string;
}

export interface LeaveApplicationItem {
  id: string;
  employeeName: string;
  employeeCode: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  appliedAt: string;
}

export interface LeaveBalanceItem {
  code: string;
  name: string;
  entitledDays: number;
  takenDays: number;
  remainingDays: number;
  isPaid: boolean;
}

export interface PayrollRecordItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  department: string;
  designation: string;
  periodMonth: string;
  grossSalary: number;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  pfDeduction: number;
  esiDeduction: number;
  profTax: number;
  tdsDeduction: number;
  totalDeductions: number;
  netPay: number;
  status: 'PROCESSED' | 'PAID' | 'DRAFT';
}

export interface ExpenseClaimItem {
  id: string;
  claimNumber: string;
  employeeName: string;
  category: string;
  amount: number;
  expenseDate: string;
  merchant: string;
  description: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';
}

export interface AnnouncementItem {
  id: string;
  title: string;
  category: string;
  content: string;
  publishedAt: string;
  author: string;
  isPinned: boolean;
}

export interface HolidayItem {
  name: string;
  date: string;
  dayOfWeek: string;
  isOptional: boolean;
}
