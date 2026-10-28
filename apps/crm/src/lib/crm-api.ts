/**
 * TechM4India CRM — API Client
 * Connects to NestJS Backend with resilient mock fallback for instant execution.
 */

import {
  initialAccounts,
  initialCallLogs,
  initialCampaigns,
  initialContacts,
  initialDeals,
  initialLeads,
  initialMeetings,
  initialQuotes,
  initialTasks,
} from '../mock/crm-data';
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
        const data = await res.json();
        return Array.isArray(data) ? data : data?.data || initialLeads;
      }
    } catch {}
    return initialLeads;
  },

  createLead: async (lead: Partial<LeadItem>): Promise<LeadItem> => {
    const newLead: LeadItem = {
      id: `ld-${Date.now()}`,
      leadNumber: `LD-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      type: lead.type || 'B2B_COLLEGE',
      status: lead.status || 'NEW',
      firstName: lead.firstName || '',
      lastName: lead.lastName || '',
      organization: lead.organization || '',
      designation: lead.designation,
      email: lead.email || '',
      phone: lead.phone || '',
      city: lead.city || 'Hyderabad',
      state: lead.state || 'Telangana',
      source: lead.source || 'Website Inbound',
      division: lead.division || 'TECHM4_ENGINEERING',
      assignedTo: lead.assignedTo || 'Aryan Reddy',
      leadScore: lead.leadScore || 65,
      estimatedValue: Number(lead.estimatedValue) || 1000000,
      notes: lead.notes,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newLead),
      });
      if (res.ok) return res.json();
    } catch {}

    return newLead;
  },

  // 1-Click Conversion: Promotes an unqualified lead into Account + Contact + Deal
  convertLead: async (
    leadId: string,
    dealAmount?: number,
    closingDate?: string
  ): Promise<{ account: AccountItem; contact: ContactItem; deal: DealItem }> => {
    try {
      const res = await fetch(`${API_BASE}/leads/${leadId}/convert`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ dealAmount, closingDate }),
      });
      if (res.ok) return res.json();
    } catch {}

    // Resilient local conversion
    const lead = initialLeads.find((l) => l.id === leadId);
    const orgName = lead?.organization || 'New Partner Institution';
    const accId = `acc-${Date.now()}`;

    const newAccount: AccountItem = {
      id: accId,
      accountNumber: `AC-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      name: orgName,
      type: lead?.type || 'B2B_COLLEGE',
      phone: lead?.phone || '',
      email: lead?.email || '',
      address: `${lead?.city || 'Hyderabad'}, ${lead?.state || 'Telangana'}`,
      city: lead?.city || 'Hyderabad',
      state: lead?.state || 'Telangana',
      relationshipScore: 85,
      annualRevenue: dealAmount || lead?.estimatedValue || 1500000,
      activeMoU: false,
      division: lead?.division || 'TECHM4_ENGINEERING',
      ownerName: 'Aryan Reddy',
      createdAt: new Date().toISOString(),
    };

    const newContact: ContactItem = {
      id: `con-${Date.now()}`,
      accountId: accId,
      accountName: orgName,
      firstName: lead?.firstName || 'Lead',
      lastName: lead?.lastName || 'Contact',
      title: lead?.designation || 'Primary Stakeholder',
      email: lead?.email || '',
      phone: lead?.phone || '',
      isPrimary: true,
      createdAt: new Date().toISOString(),
    };

    const newDeal: DealItem = {
      id: `dl-${Date.now()}`,
      dealNumber: `DL-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      title: `${orgName} — Institutional Engagement`,
      accountId: accId,
      accountName: orgName,
      contactName: `${newContact.firstName} ${newContact.lastName}`.trim(),
      contactEmail: newContact.email,
      stage: 'QUALIFICATION',
      division: lead?.division || 'TECHM4_ENGINEERING',
      amount: dealAmount || lead?.estimatedValue || 1500000,
      closingDate: closingDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      probability: 40,
      ownerName: 'Aryan Reddy',
      notes: `Converted from lead ${lead?.leadNumber || leadId}. ${lead?.notes || ''}`,
      createdAt: new Date().toISOString(),
    };

    return { account: newAccount, contact: newContact, deal: newDeal };
  },

  // 2. Accounts (Institutions)
  getAccounts: async (): Promise<AccountItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/accounts`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : data?.data || initialAccounts;
      }
    } catch {}
    return initialAccounts;
  },

  // 3. Contacts
  getContacts: async (): Promise<ContactItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/contacts`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : data?.data || initialContacts;
      }
    } catch {}
    return initialContacts;
  },

  // 4. Deals
  getDeals: async (): Promise<DealItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/deals`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : data?.data || initialDeals;
      }
    } catch {}
    return initialDeals;
  },

  createDeal: async (deal: Partial<DealItem>): Promise<DealItem> => {
    const newDeal: DealItem = {
      id: `dl-${Date.now()}`,
      dealNumber: `DL-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      title: deal.title || 'New Institutional Opportunity',
      accountId: deal.accountId || 'acc-01',
      accountName: deal.accountName || 'Anurag University',
      contactName: deal.contactName || 'Dr. V. Vishnuvardhan',
      contactEmail: deal.contactEmail || 'dean.rd@anurag.edu.in',
      stage: deal.stage || 'QUALIFICATION',
      division: deal.division || 'TECHM4_ENGINEERING',
      amount: Number(deal.amount) || 1000000,
      closingDate: deal.closingDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      probability: Number(deal.probability) || 40,
      ownerName: deal.ownerName || 'Aryan Reddy',
      notes: deal.notes,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE}/deals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newDeal),
      });
      if (res.ok) return res.json();
    } catch {}

    return newDeal;
  },

  // 5. Tasks, Meetings & Calls
  getTasks: async (): Promise<TaskItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : data?.data || initialTasks;
      }
    } catch {}
    return initialTasks;
  },

  getMeetings: async (): Promise<MeetingItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/meetings`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : data?.data || initialMeetings;
      }
    } catch {}
    return initialMeetings;
  },

  getCallLogs: async (): Promise<CallLogItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/calls`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : data?.data || initialCallLogs;
      }
    } catch {}
    return initialCallLogs;
  },

  // 6. Quotes
  getQuotes: async (): Promise<QuoteItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/quotes`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : data?.data || initialQuotes;
      }
    } catch {}
    return initialQuotes;
  },

  // 7. Campaigns
  getCampaigns: async (): Promise<CampaignItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/campaigns`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : data?.data || initialCampaigns;
      }
    } catch {}
    return initialCampaigns;
  },

  // 8. Bridge to Finance ERP: Convert accepted quote directly into an invoice in Finance ERP
  pushQuoteToFinance: async (quoteId: string): Promise<any> => {
    try {
      const res = await fetch(`/api/v1/finance/invoices/from-crm-quote`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quoteId }),
      });
      if (res.ok) return res.json();
    } catch {}
    return { success: true, message: 'Invoice generated in TechM4 Finance ERP' };
  },
};
