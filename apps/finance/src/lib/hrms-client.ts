/**
 * TechM4 Finance ERP — Cross-Domain Client
 * Connects directly to Central API via reverse proxy on port 3002
 */

const API_BASE = '/api/v1';

export const hrmsClient = {
  getApprovedClaimsForFinance: async () => {
    try {
      const res = await fetch(`${API_BASE}/hrms/finance-integration/approved-claims`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { data };
    } catch {
      return { data: [] };
    }
  },
  settleClaimInFinance: async (claimId: string, data: any) => {
    const res = await fetch(`${API_BASE}/hrms/finance-integration/claims/${claimId}/settle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  getFinalizedPayrollSummary: async (periodId: string) => {
    const res = await fetch(`${API_BASE}/hrms/finance-integration/payroll-periods/${periodId}/summary`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
