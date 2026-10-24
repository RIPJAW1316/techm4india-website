import {
  initialAnnouncements,
  initialAttendance,
  initialClaims,
  initialEmployees,
  initialHolidays,
  initialLeaveApplications,
  initialLeaveBalances,
  initialPayrollRecords,
} from '../mock/hrms-data';
import {
  AttendanceRecord,
  EmployeeItem,
  ExpenseClaimItem,
  LeaveApplicationItem,
  LeaveBalanceItem,
  PayrollRecordItem,
} from '../types';

const API_BASE = '/api/v1/hrms';

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const token =
        sessionStorage.getItem('tm4i_erp_access_token') ||
        sessionStorage.getItem('tm4i_access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // transient storage unavailable
    }
  }

  return headers;
}

export const hrmsApi = {
  // 1. Dashboard Overview
  getDashboardSummary: async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const body = await res.json();
        return body?.data || body;
      }
    } catch {
      // Fallback
    }

    return {
      overview: {
        totalEmployees: initialEmployees.length,
        presentToday: initialEmployees.length - 1,
        onLeaveToday: 1,
        attendanceRate: '96.2%',
        pendingApprovals: {
          leaves: initialLeaveApplications.filter((l) => l.status === 'PENDING').length,
          claims: initialClaims.filter((c) => c.status === 'SUBMITTED').length,
        },
      },
      todayAttendance: initialAttendance,
      holidays: initialHolidays,
      announcements: initialAnnouncements,
      leaveBalances: initialLeaveBalances,
    };
  },

  // 2. Attendance & Biometric Clock
  getTodayAttendance: async (): Promise<AttendanceRecord> => {
    try {
      const res = await fetch(`${API_BASE}/attendance/today`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const body = await res.json();
        return body?.data || body;
      }
    } catch {
      // Fallback
    }
    return initialAttendance;
  },

  toggleClock: async (currentClockedIn: boolean): Promise<AttendanceRecord> => {
    const endpoint = currentClockedIn ? '/attendance/clock-out' : '/attendance/clock-in';
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          notes: currentClockedIn ? 'Web portal clock-out' : 'Web portal clock-in',
        }),
      });
      if (res.ok) {
        const body = await res.json();
        return body?.data || body;
      }
    } catch {
      // Fallback
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return {
      ...initialAttendance,
      clockInTime: currentClockedIn ? initialAttendance.clockInTime : timeStr,
      clockOutTime: currentClockedIn ? timeStr : null,
      status: 'PRESENT',
    };
  },

  // 3. Employees Directory
  getEmployees: async (): Promise<EmployeeItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/employees`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const body = await res.json();
        const items = body?.data?.items || body?.items || body;
        if (Array.isArray(items) && items.length > 0) return items;
      }
    } catch {
      // Fallback
    }
    return initialEmployees;
  },

  createEmployee: async (data: Partial<EmployeeItem>): Promise<EmployeeItem> => {
    try {
      const res = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const body = await res.json();
        return body?.data || body;
      }
    } catch {
      // Fallback
    }

    const newEmp: EmployeeItem = {
      id: `emp-${Date.now()}`,
      employeeNumber: data.employeeNumber || `TM-00${initialEmployees.length + 1}`,
      firstName: data.firstName || 'Employee',
      lastName: data.lastName || '',
      email: data.email || 'employee@techm4india.com',
      phone: data.phone || '+91 98000 00000',
      employmentStatus: 'ACTIVE',
      employmentType: data.employmentType || 'FULL_TIME',
      dateOfJoining: data.dateOfJoining || new Date().toISOString().split('T')[0],
      department: data.department || { id: 'd-1', name: 'Engineering', code: 'ENG' },
      designation: data.designation || { id: 'des-1', title: 'Software Engineer', level: 3 },
      branch: data.branch || { id: 'b-1', name: 'Hyderabad Headquarters', city: 'Hyderabad' },
      panNumber: data.panNumber || 'ABCDE1234F',
      pfUan: data.pfUan || '100987654320',
      bankAccount: data.bankAccount || '50100123456789',
      bankIfsc: data.bankIfsc || 'HDFC0001234',
      bankName: data.bankName || 'HDFC Bank',
      ctcAnnual: data.ctcAnnual || 1200000,
    };
    return newEmp;
  },

  // 4. Leave Management
  getLeaveBalances: async (): Promise<LeaveBalanceItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/leave/balances`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const body = await res.json();
        const items = body?.data || body;
        if (Array.isArray(items) && items.length > 0) return items;
      }
    } catch {
      // Fallback
    }
    return initialLeaveBalances;
  },

  getLeaveApplications: async (): Promise<LeaveApplicationItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/leave/applications`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const body = await res.json();
        const items = body?.data?.items || body?.data || body;
        if (Array.isArray(items) && items.length > 0) return items;
      }
    } catch {
      // Fallback
    }
    return initialLeaveApplications;
  },

  applyLeave: async (data: any): Promise<LeaveApplicationItem> => {
    try {
      const res = await fetch(`${API_BASE}/leave/applications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const body = await res.json();
        return body?.data || body;
      }
    } catch {
      // Fallback
    }

    const created: LeaveApplicationItem = {
      id: `la-${Date.now()}`,
      employeeName: 'Aarav Patel',
      employeeCode: 'TM-001',
      leaveType: data.leaveType || 'Annual Leave',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date().toISOString().split('T')[0],
      totalDays: Number(data.totalDays) || 1,
      reason: data.reason || 'Personal leave request',
      status: 'PENDING',
      appliedAt: new Date().toISOString().split('T')[0],
    };
    return created;
  },

  reviewLeave: async (id: string, status: 'APPROVED' | 'REJECTED'): Promise<void> => {
    try {
      await fetch(`${API_BASE}/leave/applications/${id}/review`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
    } catch {
      // Fallback
    }
  },

  // 5. Payroll & Payslips
  getPayrollRecords: async (): Promise<PayrollRecordItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/payroll/history`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const body = await res.json();
        const items = body?.data?.items || body?.data || body;
        if (Array.isArray(items) && items.length > 0) return items;
      }
    } catch {
      // Fallback
    }
    return initialPayrollRecords;
  },

  // 6. Expense Claims
  getClaims: async (): Promise<ExpenseClaimItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/claims`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const body = await res.json();
        const items = body?.data?.items || body?.data || body;
        if (Array.isArray(items) && items.length > 0) return items;
      }
    } catch {
      // Fallback
    }
    return initialClaims;
  },

  submitClaim: async (data: any): Promise<ExpenseClaimItem> => {
    try {
      const res = await fetch(`${API_BASE}/claims`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const body = await res.json();
        return body?.data || body;
      }
    } catch {
      // Fallback
    }

    const created: ExpenseClaimItem = {
      id: `clm-${Date.now()}`,
      claimNumber: `EXP-2026-0${Math.floor(Math.random() * 90) + 10}`,
      employeeName: 'Aarav Patel',
      category: data.category || 'General Operations',
      amount: Number(data.amount) || 1500,
      expenseDate: data.expenseDate || new Date().toISOString().split('T')[0],
      merchant: data.merchant || 'Vendor Receipt',
      description: data.description || 'Corporate operational expenditure',
      status: 'SUBMITTED',
    };
    return created;
  },
};
