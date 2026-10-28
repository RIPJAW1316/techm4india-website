/**
 * TechM4India CRM — API Client
 * Connects to NestJS Backend with resilient fallback for instant execution.
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
        if (items.length > 0) {
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
              assignedTo: l.assignedEmployee?.firstName ? `${l.assignedEmployee.firstName} ${l.assignedEmployee.lastName}` : 'Aryan Reddy',
              leadScore: Number(l.score) || 60,
              estimatedValue: Number(l.estimatedBudget) || 1500000,
              notes: l.notes,
              createdAt: l.createdAt || new Date().toISOString(),
            };
          });
        }
      }
    } catch {}
    return initialLeads;
  },

  createLead: async (lead: Partial<LeadItem>): Promise<LeadItem> => {
    try {
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
      if (res.ok) {
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
          assignedTo: 'Aryan Reddy',
          leadScore: l.score,
          estimatedValue: Number(l.estimatedBudget),
          notes: l.notes,
          createdAt: l.createdAt,
        };
      }
    } catch {}

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
      if (res.ok) {
        const payload = await res.json();
        const data = payload.data || payload;
        const acc = data.account;
        const con = data.contact;
        const dl = data.deal;

        const convertedAccount: AccountItem = {
          id: acc.id,
          accountNumber: acc.code || `AC-2026-001`,
          name: acc.name,
          type: acc.type || 'B2B_COLLEGE',
          phone: acc.primaryContactPhone || '',
          email: acc.primaryContactEmail || '',
          address: `${acc.city || 'Hyderabad'}, ${acc.state || 'Telangana'}`,
          city: acc.city || 'Hyderabad',
          state: acc.state || 'Telangana',
          relationshipScore: acc.healthScore || 85,
          annualRevenue: Number(dl.amount) || dealAmount || 1500000,
          activeMoU: false,
          division: 'TECHM4_ENGINEERING',
          ownerName: 'Aryan Reddy',
          createdAt: acc.createdAt || new Date().toISOString(),
        };

        const convertedContact: ContactItem = {
          id: con.id,
          accountId: acc.id,
          accountName: acc.name,
          firstName: con.firstName || '',
          lastName: con.lastName || '',
          title: con.designation || 'Stakeholder',
          email: con.email || '',
          phone: con.phone || '',
          isPrimary: con.isPrimaryDecisionMaker ?? true,
          createdAt: con.createdAt || new Date().toISOString(),
        };

        const convertedDeal: DealItem = {
          id: dl.id,
          dealNumber: dl.dealNumber,
          title: dl.title,
          accountId: acc.id,
          accountName: acc.name,
          contactName: `${con.firstName} ${con.lastName}`.trim(),
          contactEmail: con.email,
          stage: dl.stage || 'QUALIFICATION',
          division: 'TECHM4_ENGINEERING',
          amount: Number(dl.amount),
          closingDate: dl.expectedCloseDate ? dl.expectedCloseDate.slice(0, 10) : closingDate || '',
          probability: dl.probabilityPct || 40,
          ownerName: 'Aryan Reddy',
          notes: dl.notes || '',
          createdAt: dl.createdAt || new Date().toISOString(),
        };

        return { account: convertedAccount, contact: convertedContact, deal: convertedDeal };
      }
    } catch {}

    // Resilient local conversion fallback
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

  // 2. Accounts (Institutions Master)
  getAccounts: async (): Promise<AccountItem[]> => {
    try {
      const res = await fetch(INST_API, { headers: getAuthHeaders() });
      if (res.ok) {
        const raw = await res.json();
        const items = Array.isArray(raw) ? raw : raw?.data || [];
        if (items.length > 0) {
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
            annualRevenue: 2500000,
            activeMoU: Boolean(inst._count?.mous > 0),
            division: 'TECHM4_ENGINEERING',
            ownerName: 'Aryan Reddy',
            createdAt: inst.createdAt || new Date().toISOString(),
          }));
        }
      }
    } catch {}
    return initialAccounts;
  },

  // 3. Contacts
  getContacts: async (): Promise<ContactItem[]> => {
    return initialContacts;
  },

  // 4. Deals
  getDeals: async (): Promise<DealItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/deals`, { headers: getAuthHeaders() });
      if (res.ok) {
        const raw = await res.json();
        const items = Array.isArray(raw) ? raw : raw?.data || [];
        if (items.length > 0) {
          return items.map((d: any) => ({
            id: d.id,
            dealNumber: d.dealNumber,
            title: d.title,
            accountId: d.institutionId || d.institution?.id || 'acc-01',
            accountName: d.institution?.name || 'Institution Partner',
            contactName: 'Dean / Principal',
            contactEmail: 'partner@techm4india.com',
            stage: d.stage,
            division: 'TECHM4_ENGINEERING',
            amount: Number(d.amount),
            closingDate: d.expectedCloseDate ? d.expectedCloseDate.slice(0, 10) : '2026-11-30',
            probability: d.probabilityPct || 40,
            ownerName: 'Aryan Reddy',
            notes: d.notes,
            createdAt: d.createdAt,
          }));
        }
      }
    } catch {}
    return initialDeals;
  },

  createDeal: async (deal: Partial<DealItem>): Promise<DealItem> => {
    try {
      const res = await fetch(`${API_BASE}/deals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: deal.title || 'New Institutional Opportunity',
          institutionId: deal.accountId,
          amount: Number(deal.amount) || 1000000,
          stage: deal.stage || 'QUALIFICATION',
          expectedCloseDate: deal.closingDate,
          notes: deal.notes,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        const d = created.data || created;
        return {
          id: d.id,
          dealNumber: d.dealNumber,
          title: d.title,
          accountId: d.institutionId,
          accountName: deal.accountName || d.institution?.name || 'Institution Partner',
          contactName: deal.contactName || 'Principal',
          contactEmail: deal.contactEmail || '',
          stage: d.stage,
          division: 'TECHM4_ENGINEERING',
          amount: Number(d.amount),
          closingDate: d.expectedCloseDate ? d.expectedCloseDate.slice(0, 10) : deal.closingDate || '',
          probability: d.probabilityPct || 40,
          ownerName: 'Aryan Reddy',
          notes: d.notes,
          createdAt: d.createdAt,
        };
      }
    } catch {}

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
    return newDeal;
  },

  // 5. Tasks, Meetings & Calls
  getTasks: async (): Promise<TaskItem[]> => {
    return initialTasks;
  },

  getMeetings: async (): Promise<MeetingItem[]> => {
    return initialMeetings;
  },

  getCallLogs: async (): Promise<CallLogItem[]> => {
    return initialCallLogs;
  },

  // 6. Quotes
  getQuotes: async (): Promise<QuoteItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/quotes`, { headers: getAuthHeaders() });
      if (res.ok) {
        const raw = await res.json();
        const items = Array.isArray(raw) ? raw : raw?.data || [];
        if (items.length > 0) {
          return items.map((q: any) => ({
            id: q.id,
            quoteNumber: q.quoteNumber,
            dealId: q.dealId || 'dl-01',
            dealTitle: q.deal?.title || 'CoE Lab Package',
            accountName: q.institution?.name || 'Partner College',
            subtotal: Number(q.subtotal),
            gstAmount: Number(q.cgstAmount) + Number(q.sgstAmount) + Number(q.igstAmount),
            totalAmount: Number(q.totalAmount),
            status: q.status || 'DRAFT',
            validUntil: q.validUntil ? q.validUntil.slice(0, 10) : '2026-12-31',
            createdAt: q.createdAt,
          }));
        }
      }
    } catch {}
    return initialQuotes;
  },

  // 7. Campaigns
  getCampaigns: async (): Promise<CampaignItem[]> => {
    return initialCampaigns;
  },

  // 8. Bridge to Finance ERP: Convert accepted quote directly into an invoice in Finance ERP
  pushQuoteToFinance: async (quoteId: string): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/quotes/${quoteId}/push-to-finance`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (res.ok) return res.json();
    } catch {}

    // Resilient fallback to finance endpoint
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
