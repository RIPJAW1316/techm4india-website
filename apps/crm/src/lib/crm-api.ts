/**
 * TechM4India CRM — API Client
 * Connects directly to the Backend API without hardcoded mock fixtures.
 */

import {
  AccountItem,
  CallLogItem,
  CampaignItem,
  ContactItem,
  DealItem,
  LeadItem,
  MeetingItem,
  QuoteItem,
  TaskItem,
} from '../types';

const API_BASE = '/api/v1/crm';
const INST_API = '/api/v1/institutions';

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
      // ignore
    }
  }

  return headers;
}

export const crmApi = {
  // 1. Leads
  getLeads: async (): Promise<LeadItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/leads`, { headers: getAuthHeaders() });
      if (res.ok) {
        const raw = await res.json();
        const items = Array.isArray(raw) ? raw : raw?.data || [];
        return items.map((l: any) => {
          const nameParts = (l.contactPerson || '').trim().split(' ');
          return {
            id: l.id,
            leadNumber: l.leadNumber || 'LD-2026-000',
            type: l.vertical || 'B2B_COLLEGE',
            status: l.status || 'NEW',
            firstName: nameParts[0] || 'Lead',
            lastName: nameParts.slice(1).join(' ') || '',
            organization: l.institutionName || '',
            designation: l.designation || 'Stakeholder',
            email: l.email || '',
            phone: l.phone || '',
            city: l.city || 'Hyderabad',
            state: l.state || 'Telangana',
            source: l.source || 'CAMPUS_OUTREACH',
            division: 'TECHM4_ENGINEERING',
            assignedTo: l.assignedEmployee?.firstName
              ? `${l.assignedEmployee.firstName} ${l.assignedEmployee.lastName}`
              : 'Corporate CRM Rep',
            leadScore: Number(l.score) || 60,
            estimatedValue: Number(l.estimatedBudget) || 0,
            notes: l.notes,
            createdAt: l.createdAt || new Date().toISOString(),
          };
        });
      }
    } catch (err) {
      console.warn('Failed to fetch CRM leads:', err);
    }
    return [];
  },

  createLead: async (lead: Partial<LeadItem>): Promise<LeadItem> => {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        institutionName: lead.organization || `${lead.firstName} ${lead.lastName}'s Institution`,
        vertical: lead.type || 'ENGINEERING_COLLEGES',
        contactPerson: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Stakeholder',
        designation: lead.designation || 'Department Head',
        email: lead.email || 'lead@college.edu.in',
        phone: lead.phone || '',
        city: lead.city || 'Hyderabad',
        state: lead.state || 'Telangana',
        source: lead.source || 'CAMPUS_OUTREACH',
        estimatedBudget: Number(lead.estimatedValue) || 1000000,
        score: lead.leadScore || 65,
        notes: lead.notes,
        status: lead.status || 'NEW',
      }),
    });
    if (!res.ok) {
      throw new Error(`Create lead failed with status ${res.status}`);
    }
    const created = await res.json();
    const l = created.data || created;
    const nameParts = (l.contactPerson || '').trim().split(' ');
    return {
      id: l.id,
      leadNumber: l.leadNumber,
      type: l.vertical,
      status: l.status,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      organization: l.institutionName,
      designation: l.designation,
      email: l.email,
      phone: l.phone,
      city: l.city,
      state: l.state,
      source: l.source,
      division: 'TECHM4_ENGINEERING',
      assignedTo: 'Corporate CRM Rep',
      leadScore: l.score,
      estimatedValue: Number(l.estimatedBudget),
      notes: l.notes,
      createdAt: l.createdAt,
    };
  },

  updateLeadStatus: async (leadId: string, status: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/leads/${leadId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      throw new Error(`Update lead status failed with status ${res.status}`);
    }
  },

  convertLead: async (
    leadId: string,
    dealAmount?: number,
    expectedCloseDate?: string
  ): Promise<{ newAccount: AccountItem; newContact: ContactItem; newDeal: DealItem }> => {
    const res = await fetch(`${API_BASE}/leads/${leadId}/convert`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        dealAmount: dealAmount || 1500000,
        expectedCloseDate: expectedCloseDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const newAccount: AccountItem = data.institution || data.account || data.newAccount;
      const newContact: ContactItem = data.contact || data.newContact;
      const newDeal: DealItem = data.deal || data.newDeal;
      return {
        newAccount,
        newContact,
        newDeal,
      };
    }

    throw new Error(`Lead conversion failed with status ${res.status}`);
  },

  // 2. Accounts (Institutions Master)
  getAccounts: async (): Promise<AccountItem[]> => {
    try {
      const res = await fetch(`${INST_API}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const raw = await res.json();
        const items = Array.isArray(raw) ? raw : raw?.data || [];
        return items.map((inst: any) => ({
          id: inst.id,
          accountNumber: inst.code || `INST-${inst.id.slice(0, 4)}`,
          name: inst.name,
          type: inst.type || 'B2B_COLLEGE',
          phone: inst.primaryContactPhone || '',
          email: inst.primaryContactEmail || '',
          address: `${inst.city || 'Hyderabad'}, ${inst.state || 'Telangana'}`,
          city: inst.city || 'Hyderabad',
          state: inst.state || 'Telangana',
          relationshipScore: inst.healthScore || 80,
          annualRevenue: Number(inst.annualRevenue) || 0,
          activeMoU: Boolean(inst._count?.mous > 0),
          division: 'TECHM4_ENGINEERING',
          ownerName: 'Corporate Account Rep',
          createdAt: inst.createdAt || new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch CRM accounts:', err);
    }
    return [];
  },

  // 3. Contacts
  getContacts: async (): Promise<ContactItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/contacts`, { headers: getAuthHeaders() });
      if (res.ok) {
        const raw = await res.json();
        const items = Array.isArray(raw) ? raw : raw?.data || [];
        return items;
      }
    } catch (err) {
      console.warn('Failed to fetch CRM contacts:', err);
    }
    return [];
  },

  // 4. Deals
  getDeals: async (): Promise<DealItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/deals`, { headers: getAuthHeaders() });
      if (res.ok) {
        const raw = await res.json();
        const items = Array.isArray(raw) ? raw : raw?.data || [];
        return items.map((d: any) => ({
          id: d.id,
          dealNumber: d.dealNumber,
          title: d.title,
          accountId: d.institutionId || d.institution?.id || 'acc-01',
          accountName: d.institution?.name || 'Institution Partner',
          contactName: d.contactName || 'Primary Contact',
          contactEmail: d.contactEmail || 'partner@techm4india.com',
          stage: d.stage,
          division: 'TECHM4_ENGINEERING',
          amount: Number(d.amount),
          closingDate: d.expectedCloseDate ? d.expectedCloseDate.slice(0, 10) : '',
          probability: d.probabilityPct || 40,
          ownerName: 'Corporate Deals Rep',
          notes: d.notes,
          createdAt: d.createdAt,
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch CRM deals:', err);
    }
    return [];
  },

  createDeal: async (deal: Partial<DealItem>): Promise<DealItem> => {
    const res = await fetch(`${API_BASE}/deals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title: deal.title || 'New Opportunity',
        institutionId: deal.accountId,
        amount: Number(deal.amount) || 1000000,
        stage: deal.stage || 'QUALIFICATION',
        expectedCloseDate: deal.closingDate,
        notes: deal.notes,
      }),
    });
    if (!res.ok) {
      throw new Error(`Create deal failed with status ${res.status}`);
    }
    const created = await res.json();
    const d = created.data || created;
    return {
      id: d.id,
      dealNumber: d.dealNumber,
      title: d.title,
      accountId: d.institutionId,
      accountName: deal.accountName || d.institution?.name || 'Institution Partner',
      contactName: deal.contactName || 'Primary Contact',
      contactEmail: deal.contactEmail || '',
      stage: d.stage,
      division: 'TECHM4_ENGINEERING',
      amount: Number(d.amount),
      closingDate: d.expectedCloseDate ? d.expectedCloseDate.slice(0, 10) : deal.closingDate || '',
      probability: d.probabilityPct || 40,
      ownerName: 'Corporate Deals Rep',
      notes: d.notes,
      createdAt: d.createdAt,
    };
  },

  // 5. Tasks, Meetings & Calls
  getTasks: async (): Promise<TaskItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, { headers: getAuthHeaders() });
      if (res.ok) {
        const raw = await res.json();
        return Array.isArray(raw) ? raw : raw?.data || [];
      }
    } catch (err) {
      console.warn('Failed to fetch CRM tasks:', err);
    }
    return [];
  },

  getMeetings: async (): Promise<MeetingItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/meetings`, { headers: getAuthHeaders() });
      if (res.ok) {
        const raw = await res.json();
        return Array.isArray(raw) ? raw : raw?.data || [];
      }
    } catch (err) {
      console.warn('Failed to fetch CRM meetings:', err);
    }
    return [];
  },

  getCallLogs: async (): Promise<CallLogItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/calls`, { headers: getAuthHeaders() });
      if (res.ok) {
        const raw = await res.json();
        return Array.isArray(raw) ? raw : raw?.data || [];
      }
    } catch (err) {
      console.warn('Failed to fetch CRM call logs:', err);
    }
    return [];
  },

  // 6. Quotes
  getQuotes: async (): Promise<QuoteItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/quotes`, { headers: getAuthHeaders() });
      if (res.ok) {
        const raw = await res.json();
        const items = Array.isArray(raw) ? raw : raw?.data || [];
        return items.map((q: any) => ({
          id: q.id,
          quoteNumber: q.quoteNumber,
          dealId: q.dealId || '',
          dealTitle: q.deal?.title || 'Quoted Package',
          accountName: q.institution?.name || 'Partner Account',
          subtotal: Number(q.subtotal),
          gstAmount: Number(q.cgstAmount || 0) + Number(q.sgstAmount || 0) + Number(q.igstAmount || 0),
          totalAmount: Number(q.totalAmount),
          status: q.status || 'DRAFT',
          validUntil: q.validUntil ? q.validUntil.slice(0, 10) : '',
          createdAt: q.createdAt,
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch CRM quotes:', err);
    }
    return [];
  },

  // 7. Campaigns
  getCampaigns: async (): Promise<CampaignItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/campaigns`, { headers: getAuthHeaders() });
      if (res.ok) {
        const raw = await res.json();
        return Array.isArray(raw) ? raw : raw?.data || [];
      }
    } catch (err) {
      console.warn('Failed to fetch CRM campaigns:', err);
    }
    return [];
  },

  // 8. Bridge to Finance ERP
  pushQuoteToFinance: async (quoteId: string): Promise<any> => {
    const res = await fetch(`/api/v1/finance/invoices/from-crm-quote`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quoteId }),
    });
    if (!res.ok) {
      throw new Error(`Push quote to finance failed with status ${res.status}`);
    }
    return res.json();
  },
};
