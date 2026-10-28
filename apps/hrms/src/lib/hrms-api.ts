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
    } catch (err) {
      console.warn('Failed to fetch HRMS dashboard summary:', err);
    }

    return {
      overview: {
        totalEmployees: 0,
        presentToday: 0,
        onLeaveToday: 0,
        attendanceRate: '0%',
        pendingApprovals: {
          leaves: 0,
          claims: 0,
        },
      },
      todayAttendance: null,
      holidays: [],
      announcements: [],
      leaveBalances: [],
    };
  },

  // 2. Attendance & Biometric Clock
  getTodayAttendance: async (): Promise<AttendanceRecord | null> => {
    try {
      const res = await fetch(`${API_BASE}/attendance/today`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const body = await res.json();
        return body?.data || body;
      }
    } catch (err) {
      console.warn('Failed to fetch today attendance:', err);
    }
    return null;
  },

  toggleClock: async (currentClockedIn: boolean): Promise<AttendanceRecord | null> => {
    const endpoint = currentClockedIn ? '/attendance/clock-out' : '/attendance/clock-in';
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        notes: currentClockedIn ? 'Web portal clock-out' : 'Web portal clock-in',
      }),
    });
    if (!res.ok) {
      throw new Error(`Clock action failed with status ${res.status}`);
    }
    const body = await res.json();
    return body?.data || body;
  },

  // 3. Employees Directory
  getEmployees: async (): Promise<EmployeeItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/employees`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const body = await res.json();
        const items = body?.data?.items || body?.items || body?.data || body;
        if (Array.isArray(items)) return items;
      }
    } catch (err) {
      console.warn('Failed to fetch employees list:', err);
    }
    return [];
  },

  createEmployee: async (data: Partial<EmployeeItem>): Promise<EmployeeItem> => {
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Create employee failed with status ${res.status}`);
    }
    const body = await res.json();
    return body?.data || body;
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
        if (Array.isArray(items)) return items;
      }
    } catch (err) {
      console.warn('Failed to fetch leave balances:', err);
    }
    return [];
  },

  getLeaveApplications: async (): Promise<LeaveApplicationItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/leave/applications`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const body = await res.json();
        const items = body?.data?.items || body?.data || body;
        if (Array.isArray(items)) return items;
      }
    } catch (err) {
      console.warn('Failed to fetch leave applications:', err);
    }
    return [];
  },

  applyLeave: async (data: any): Promise<LeaveApplicationItem> => {
    const res = await fetch(`${API_BASE}/leave/applications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Apply leave failed with status ${res.status}`);
    }
    const body = await res.json();
    return body?.data || body;
  },

  reviewLeave: async (id: string, status: 'APPROVED' | 'REJECTED'): Promise<void> => {
    const res = await fetch(`${API_BASE}/leave/applications/${id}/review`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      throw new Error(`Review leave failed with status ${res.status}`);
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
        if (Array.isArray(items)) return items;
      }
    } catch (err) {
      console.warn('Failed to fetch payroll records:', err);
    }
    return [];
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
        if (Array.isArray(items)) return items;
      }
    } catch (err) {
      console.warn('Failed to fetch expense claims:', err);
    }
    return [];
  },

  submitClaim: async (data: any): Promise<ExpenseClaimItem> => {
    const res = await fetch(`${API_BASE}/claims`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Submit claim failed with status ${res.status}`);
    }
    const body = await res.json();
    return body?.data || body;
  },
};
