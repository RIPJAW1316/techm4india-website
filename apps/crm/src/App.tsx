'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { CrmAccountsView } from './components/CrmAccountsView';
import { CrmActivitiesView } from './components/CrmActivitiesView';
import { CrmCampaignsView } from './components/CrmCampaignsView';
import { CrmContactsView } from './components/CrmContactsView';
import { CrmConvertLeadModal } from './components/CrmConvertLeadModal';
import { CrmDealsView } from './components/CrmDealsView';
import { CrmHeader } from './components/CrmHeader';
import { CrmHomeDashboard } from './components/CrmHomeDashboard';
import { CrmLeadsView } from './components/CrmLeadsView';
import { CrmQuotesView } from './components/CrmQuotesView';
import { CrmRailAndSidebar } from './components/CrmRailAndSidebar';
import { CrmReportsView } from './components/CrmReportsView';
import { crmApi } from './lib/crm-api';
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
} from './mock/crm-data';
import {
  AccountItem,
  CallLogItem,
  CampaignItem,
  ContactItem,
  CrmViewTab,
  DealItem,
  DealStage,
  LeadItem,
  MeetingItem,
  QuoteItem,
  TaskItem,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<CrmViewTab>('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState("Aryan Reddy's Home");
  const [searchQuery, setSearchQuery] = useState('');

  // Domain Collections
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [accounts, setAccounts] = useState<AccountItem[]>(initialAccounts);
  const [contacts, setContacts] = useState<ContactItem[]>(initialContacts);
  const [deals, setDeals] = useState<DealItem[]>(initialDeals);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [meetings, setMeetings] = useState<MeetingItem[]>(initialMeetings);
  const [callLogs, setCallLogs] = useState<CallLogItem[]>(initialCallLogs);
  const [quotes, setQuotes] = useState<QuoteItem[]>(initialQuotes);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(initialCampaigns);

  // Conversion Modal State
  const [leadToConvert, setLeadToConvert] = useState<LeadItem | null>(null);

  // Toast Notification System
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: 'success' | 'info' | 'error' }>
  >([]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `t-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // SSO Ingestion on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const ssoToken = urlParams.get('sso_token') || urlParams.get('code') || urlParams.get('token');

      if (ssoToken) {
        try {
          sessionStorage.setItem('tm4i_erp_access_token', ssoToken);
          addToast('Central SSO Session authenticated successfully.', 'success');
          // Clean URL without page reload
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch {
          // ignore
        }
      } else {
        // Fallback demo token if none present
        if (!sessionStorage.getItem('tm4i_erp_access_token')) {
          sessionStorage.setItem(
            'tm4i_erp_access_token',
            'mock-techm4-jwt-token-aryan-reddy-founder-ceo'
          );
        }
      }
    }
  }, []);

  // Handlers
  const handleCreateLead = async (leadData: Partial<LeadItem>) => {
    const newLead = await crmApi.createLead(leadData);
    setLeads((prev) => [newLead, ...prev]);
    addToast(`New Lead created: ${newLead.organization}`);
  };

  const handleConfirmConvert = async (
    leadId: string,
    accountData: Partial<AccountItem>,
    contactData: Partial<ContactItem>,
    dealData: Partial<DealItem>
  ) => {
    const res = await crmApi.convertLead(leadId, dealData.amount, dealData.closingDate);

    // Merge with user overrides
    const newAcc: AccountItem = { ...res.account, ...accountData };
    const newCon: ContactItem = { ...res.contact, ...contactData };
    const newDeal: DealItem = { ...res.deal, ...dealData };

    // Update state
    setAccounts((prev) => [newAcc, ...prev]);
    setContacts((prev) => [newCon, ...prev]);
    if (dealData.title) {
      setDeals((prev) => [newDeal, ...prev]);
    }

    // Mark lead as converted
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, isConverted: true, status: 'WON' } : l))
    );

    setLeadToConvert(null);
    addToast(`Lead converted! Created Account, Contact & Deal for ${newAcc.name}`);
  };

  const handleCreateAccount = (accData: Partial<AccountItem>) => {
    const newAcc: AccountItem = {
      id: `acc-${Date.now()}`,
      accountNumber: `AC-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      name: accData.name || 'New Institution',
      type: accData.type || 'B2B_COLLEGE',
      phone: accData.phone || '',
      email: accData.email || '',
      address: accData.address || '',
      city: accData.city || 'Hyderabad',
      state: accData.state || 'Telangana',
      naacGrade: accData.naacGrade || 'A++',
      aisheCode: accData.aisheCode,
      studentStrength: accData.studentStrength || 3000,
      relationshipScore: 80,
      annualRevenue: accData.annualRevenue || 1500000,
      activeMoU: accData.activeMoU ?? true,
      division: accData.division || 'TECHM4_ENGINEERING',
      ownerName: 'Aryan Reddy',
      createdAt: new Date().toISOString(),
    };
    setAccounts((prev) => [newAcc, ...prev]);
    addToast(`Institution Account added: ${newAcc.name}`);
  };

  const handleCreateContact = (conData: Partial<ContactItem>) => {
    const newCon: ContactItem = {
      id: `con-${Date.now()}`,
      accountId: conData.accountId || accounts[0]?.id || 'acc-01',
      accountName: conData.accountName || accounts[0]?.name || 'Anurag University',
      firstName: conData.firstName || 'New',
      lastName: conData.lastName || 'Contact',
      title: conData.title || 'Dean / Principal',
      department: conData.department,
      email: conData.email || '',
      phone: conData.phone || '',
      isPrimary: conData.isPrimary ?? false,
      createdAt: new Date().toISOString(),
    };
    setContacts((prev) => [newCon, ...prev]);
    addToast(`Stakeholder added: ${newCon.firstName} ${newCon.lastName}`);
  };

  const handleCreateDeal = async (dealData: Partial<DealItem>) => {
    const newDeal = await crmApi.createDeal(dealData);
    setDeals((prev) => [newDeal, ...prev]);
    addToast(`New Deal added to pipeline: ${newDeal.title}`);
  };

  const handleUpdateDealStage = (dealId: string, stage: DealStage) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage } : d))
    );
    addToast(`Deal stage updated to ${stage.replace('_', ' ')}`);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: t.status === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED',
            }
          : t
      )
    );
  };

  const handleCreateTask = (taskData: Partial<TaskItem>) => {
    const newTask: TaskItem = {
      id: `tsk-${Date.now()}`,
      subject: taskData.subject || 'Follow-up Task',
      dueDate: taskData.dueDate || new Date().toISOString().slice(0, 10),
      status: 'NOT_STARTED',
      priority: taskData.priority || 'NORMAL',
      relatedTo: taskData.relatedTo || 'Institution',
      relatedType: taskData.relatedType || 'ACCOUNT',
      assignedTo: taskData.assignedTo || 'Aryan Reddy',
    };
    setTasks((prev) => [newTask, ...prev]);
    addToast(`Task scheduled: ${newTask.subject}`);
  };

  const handleCreateMeeting = (meetData: Partial<MeetingItem>) => {
    const newMeet: MeetingItem = {
      id: `mt-${Date.now()}`,
      title: meetData.title || 'Institutional Meeting',
      fromTime: meetData.fromTime || '11:00 AM',
      toTime: meetData.toTime || '11:45 AM',
      relatedTo: meetData.relatedTo || 'Institution',
      relatedType: meetData.relatedType || 'ACCOUNT',
      location: meetData.location || 'Google Meet',
      meetLink: meetData.meetLink || 'https://meet.google.com/new',
      host: meetData.host || 'Aryan Reddy',
    };
    setMeetings((prev) => [newMeet, ...prev]);
    addToast(`Meeting scheduled: ${newMeet.title}`);
  };

  const handleCreateCallLog = (callData: Partial<CallLogItem>) => {
    const newCall: CallLogItem = {
      id: `call-${Date.now()}`,
      subject: callData.subject || 'Outreach Call',
      callTime: callData.callTime || 'Today, 3:00 PM',
      durationMinutes: callData.durationMinutes || 10,
      contactName: callData.contactName || '',
      organization: callData.organization || '',
      outcome: callData.outcome || 'INTERESTED',
      notes: callData.notes || '',
    };
    setCallLogs((prev) => [newCall, ...prev]);
    addToast(`Call log recorded: ${newCall.subject}`);
  };

  const handleCreateQuote = (quoteData: Partial<QuoteItem>) => {
    const newQuote: QuoteItem = {
      id: `qt-${Date.now()}`,
      quoteNumber: `QT-2026-${String(Math.floor(800 + Math.random() * 100))}`,
      accountName: quoteData.accountName || 'Institution Client',
      dealTitle: quoteData.dealTitle,
      date: new Date().toISOString().slice(0, 10),
      validUntil:
        quoteData.validUntil ||
        new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      subtotal: quoteData.subtotal || 1000000,
      taxGst: quoteData.taxGst || 180000,
      totalAmount: quoteData.totalAmount || 1180000,
      status: quoteData.status || 'SENT',
      lineItems: quoteData.lineItems || [],
    };
    setQuotes((prev) => [newQuote, ...prev]);
    addToast(`Quotation generated: ${newQuote.quoteNumber}`);
  };

  const handlePushQuoteToFinance = async (quoteId: string) => {
    await crmApi.pushQuoteToFinance(quoteId);
    setQuotes((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, status: 'CONVERTED_TO_INVOICE' } : q))
    );
    addToast(`Quotation pushed to TechM4 Finance ERP as Invoice!`);
  };

  const handleCreateCampaign = (campData: Partial<CampaignItem>) => {
    const newCamp: CampaignItem = {
      id: `cmp-${Date.now()}`,
      name: campData.name || 'Outreach Campaign',
      channel: campData.channel || 'WHATSAPP',
      targetAudience: campData.targetAudience || 'Colleges',
      status: 'ACTIVE',
      sentCount: campData.sentCount || 100,
      openedCount: campData.openedCount || 75,
      repliedCount: campData.repliedCount || 30,
      leadsGenerated: campData.leadsGenerated || 12,
      startDate: new Date().toISOString().slice(0, 10),
    };
    setCampaigns((prev) => [newCamp, ...prev]);
    addToast(`Campaign launched: ${newCamp.name}`);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#1f2946] flex flex-col font-sans">
      {/* 1. Zoho Top Utility Header */}
      <CrmHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCreateLead={() => setActiveTab('leads')}
        onOpenCreateDeal={() => setActiveTab('deals')}
        onOpenCreateTask={() => setActiveTab('activities')}
        onRefresh={() => addToast('CRM workspace refreshed with latest live data.')}
      />

      {/* 2. Main Work Area: Dual-Rail Sidebar + Active View */}
      <div className="flex-1 flex overflow-hidden">
        <CrmRailAndSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          leadCount={leads.length}
          dealCount={deals.length}
          accountCount={accounts.length}
          taskCount={tasks.filter((t) => t.status !== 'COMPLETED').length}
        />

        {/* Dynamic Content Pane */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'home' && (
            <CrmHomeDashboard
              leads={leads}
              deals={deals}
              tasks={tasks}
              meetings={meetings}
              callLogs={callLogs}
              setActiveTab={setActiveTab}
              onToggleTask={handleToggleTask}
              onOpenConvertModal={(lead) => setLeadToConvert(lead)}
              onRefresh={() => addToast('Aryan Reddy Home updated.')}
            />
          )}

          {activeTab === 'leads' && (
            <CrmLeadsView
              leads={leads}
              onCreateLead={handleCreateLead}
              onOpenConvertModal={(lead) => setLeadToConvert(lead)}
            />
          )}

          {activeTab === 'accounts' && (
            <CrmAccountsView
              accounts={accounts}
              contacts={contacts}
              deals={deals}
              onCreateAccount={handleCreateAccount}
              onOpenCreateDealForAccount={() => setActiveTab('deals')}
            />
          )}

          {activeTab === 'contacts' && (
            <CrmContactsView
              contacts={contacts}
              accounts={accounts}
              onCreateContact={handleCreateContact}
            />
          )}

          {activeTab === 'deals' && (
            <CrmDealsView
              deals={deals}
              accounts={accounts}
              onCreateDeal={handleCreateDeal}
              onUpdateDealStage={handleUpdateDealStage}
            />
          )}

          {activeTab === 'activities' && (
            <CrmActivitiesView
              tasks={tasks}
              meetings={meetings}
              callLogs={callLogs}
              onToggleTask={handleToggleTask}
              onCreateTask={handleCreateTask}
              onCreateMeeting={handleCreateMeeting}
              onCreateCallLog={handleCreateCallLog}
            />
          )}

          {activeTab === 'quotes' && (
            <CrmQuotesView
              quotes={quotes}
              accounts={accounts}
              deals={deals}
              onCreateQuote={handleCreateQuote}
              onPushToFinance={handlePushQuoteToFinance}
            />
          )}

          {activeTab === 'campaigns' && (
            <CrmCampaignsView
              campaigns={campaigns}
              onCreateCampaign={handleCreateCampaign}
            />
          )}

          {activeTab === 'reports' && (
            <CrmReportsView leads={leads} deals={deals} />
          )}
        </main>
      </div>

      {/* 3. Global 1-Click Convert Lead Modal */}
      {leadToConvert && (
        <CrmConvertLeadModal
          lead={leadToConvert}
          isOpen={!!leadToConvert}
          onClose={() => setLeadToConvert(null)}
          onConfirmConvert={handleConfirmConvert}
        />
      )}

      {/* 4. Global Floating Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3 rounded-xl border shadow-lg flex items-center gap-2.5 text-xs font-semibold backdrop-blur-xs animate-in slide-in-from-bottom-2 duration-150 pointer-events-auto ${
              toast.type === 'success'
                ? 'bg-white border-emerald-300 text-emerald-950 shadow-emerald-500/10'
                : 'bg-white border-blue-300 text-blue-950 shadow-blue-500/10'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="flex-1">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
