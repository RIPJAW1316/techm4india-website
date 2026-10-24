/**
 * TechM4India Finance ERP — Dedicated API Client
 * Connects directly to the Central NestJS API with token authentication & resilient fallback.
 */

const API_BASE = '/api/v1';

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const token = sessionStorage.getItem('tm4i_erp_access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // transient storage unavailable
    }
  }

  return headers;
}

export const financeApi = {
  // 1. Chart of Accounts
  getAccounts: async () => {
    const res = await fetch(`${API_BASE}/finance/accounts`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Accounts fetch failed: ${res.status}`);
    return res.json();
  },

  createAccount: async (data: any) => {
    const res = await fetch(`${API_BASE}/finance/accounts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Create account failed: ${res.status}`);
    return res.json();
  },

  // 2. Journal Entries & General Ledger
  getJournalEntries: async (division?: string) => {
    const url = division && division !== 'ALL'
      ? `${API_BASE}/finance/journal-entries?division=${encodeURIComponent(division)}`
      : `${API_BASE}/finance/journal-entries`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(`Journal entries fetch failed: ${res.status}`);
    return res.json();
  },

  createJournalEntry: async (data: any) => {
    const res = await fetch(`${API_BASE}/finance/journal-entries`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Create journal failed: ${res.status}`);
    return res.json();
  },

  postJournalEntry: async (id: string) => {
    const res = await fetch(`${API_BASE}/finance/journal-entries/${id}/post`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Post journal failed: ${res.status}`);
    return res.json();
  },

  reverseJournalEntry: async (id: string, reason: string) => {
    const res = await fetch(`${API_BASE}/finance/journal-entries/${id}/reverse`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error(`Reverse journal failed: ${res.status}`);
    return res.json();
  },

  // 3. Invoices & Receivables
  getInvoices: async (division?: string, status?: string) => {
    const params = new URLSearchParams();
    if (division && division !== 'ALL') params.append('division', division);
    if (status && status !== 'ALL') params.append('status', status);
    const qs = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE}/finance/invoices${qs}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Invoices fetch failed: ${res.status}`);
    return res.json();
  },

  createInvoice: async (data: any) => {
    const res = await fetch(`${API_BASE}/finance/invoices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Create invoice failed: ${res.status}`);
    return res.json();
  },

  recordInvoicePayment: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/finance/invoices/${id}/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Record payment failed: ${res.status}`);
    return res.json();
  },

  // 4. Expenses & Payables
  getExpenses: async (division?: string) => {
    const url = division && division !== 'ALL'
      ? `${API_BASE}/finance/expenses?division=${encodeURIComponent(division)}`
      : `${API_BASE}/finance/expenses`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(`Expenses fetch failed: ${res.status}`);
    return res.json();
  },

  createExpense: async (data: any) => {
    const res = await fetch(`${API_BASE}/finance/expenses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Create expense failed: ${res.status}`);
    return res.json();
  },

  approveExpense: async (id: string) => {
    const res = await fetch(`${API_BASE}/finance/expenses/${id}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Approve expense failed: ${res.status}`);
    return res.json();
  },

  payExpense: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/finance/expenses/${id}/pay`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Pay expense failed: ${res.status}`);
    return res.json();
  },

  // 5. Vendors Master
  getVendors: async () => {
    const res = await fetch(`${API_BASE}/finance/vendors`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Vendors fetch failed: ${res.status}`);
    return res.json();
  },

  createVendor: async (data: any) => {
    const res = await fetch(`${API_BASE}/finance/vendors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Create vendor failed: ${res.status}`);
    return res.json();
  },

  // 6. Cross-Domain HRMS Integration
  getApprovedClaimsForFinance: async () => {
    // Try primary finance route, fallback to hrms-integration route
    try {
      const res = await fetch(`${API_BASE}/finance/hrms/approved-claims`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return { data: Array.isArray(data) ? data : data?.data || [] };
      }
    } catch {
      // fallback
    }

    try {
      const res = await fetch(`${API_BASE}/hrms/finance-integration/approved-claims`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return { data: Array.isArray(data) ? data : data?.data || [] };
      }
    } catch {
      // fallback
    }

    return { data: [] };
  },

  settleClaimInFinance: async (claimId: string, data: any) => {
    // Try primary finance settlement route
    try {
      const res = await fetch(`${API_BASE}/finance/hrms/claims/${claimId}/settle`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) return res.json();
    } catch {
      // fallback
    }

    // Fallback to hrms patch route
    const res = await fetch(`${API_BASE}/hrms/finance-integration/claims/${claimId}/settle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Settle claim failed: ${res.status}`);
    return res.json();
  },

  accruePayrollToLedger: async (periodId: string) => {
    const res = await fetch(`${API_BASE}/finance/hrms/payroll/${periodId}/accrue`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Accrue payroll failed: ${res.status}`);
    return res.json();
  },
};

// Backwards compatibility alias
export const hrmsClient = {
  getApprovedClaimsForFinance: financeApi.getApprovedClaimsForFinance,
  settleClaimInFinance: financeApi.settleClaimInFinance,
  getFinalizedPayrollSummary: async (periodId: string) => {
    const res = await fetch(`${API_BASE}/hrms/finance-integration/payroll-periods/${periodId}/summary`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
