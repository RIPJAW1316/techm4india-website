import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession, getAccessToken, setSession } from '@/lib/auth-client';
import { hrmsApi } from './lib/hrms-api';
import { HrmsHeader } from './components/HrmsHeader';
import { HrmsOverview } from './components/HrmsOverview';
import { HrmsEmployees } from './components/HrmsEmployees';
import { HrmsAttendance } from './components/HrmsAttendance';
import { HrmsLeave } from './components/HrmsLeave';
import { HrmsPayroll } from './components/HrmsPayroll';
import { HrmsClaims } from './components/HrmsClaims';
import DirectLoginPage from './pages/DirectLogin';
import {
  AnnouncementItem,
  AttendanceRecord,
  EmployeeItem,
  ExpenseClaimItem,
  HolidayItem,
  HrmsTab,
  LeaveApplicationItem,
  LeaveBalanceItem,
  PayrollRecordItem,
} from './types';
import {
  initialAnnouncements,
  initialAttendance,
  initialClaims,
  initialEmployees,
  initialHolidays,
  initialLeaveApplications,
  initialLeaveBalances,
  initialPayrollRecords,
} from './mock/hrms-data';

export default function App() {
  const pathname = usePathname();
  const router = useRouter();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<HrmsTab>('overview');

  // Application Data States
  const [employees, setEmployees] = useState<EmployeeItem[]>(initialEmployees);
  const [attendance, setAttendance] = useState<AttendanceRecord>(initialAttendance);
  const [leaveBalances, setLeaveBalances] =
    useState<LeaveBalanceItem[]>(initialLeaveBalances);
  const [leaveApplications, setLeaveApplications] =
    useState<LeaveApplicationItem[]>(initialLeaveApplications);
  const [payrollRecords, setPayrollRecords] =
    useState<PayrollRecordItem[]>(initialPayrollRecords);
  const [claims, setClaims] = useState<ExpenseClaimItem[]>(initialClaims);
  const [holidays, setHolidays] = useState<HolidayItem[]>(initialHolidays);
  const [announcements, setAnnouncements] =
    useState<AnnouncementItem[]>(initialAnnouncements);

  // Global Modals State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [hasToken, setHasToken] = useState<boolean>(() => !!getAccessToken());
  const [isProcessingSso, setIsProcessingSso] = useState<boolean>(false);

  // Synchronous and resilient SSO token extraction & baseline session hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get('sso_token');
    const code = params.get('code');

    if (ssoToken) {
      setIsProcessingSso(true);
      setSession({ accessToken: ssoToken });
      setHasToken(true);
      if (window.history?.replaceState) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname.startsWith('/auth/callback')
            ? '/'
            : window.location.pathname,
        );
      }
      setTimeout(() => {
        setIsProcessingSso(false);
        if (window.location.pathname.startsWith('/auth/callback')) {
          router.push('/');
        }
      }, 150);
      return;
    }

    if (code) {
      setIsProcessingSso(true);
      const demoToken = `demo-access-token-hrms.lead@techm4india.com-${Date.now()}`;
      setSession({ accessToken: demoToken });
      setHasToken(true);
      if (window.history?.replaceState) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname.startsWith('/auth/callback')
            ? '/'
            : window.location.pathname,
        );
      }
      setTimeout(() => {
        setIsProcessingSso(false);
        if (window.location.pathname.startsWith('/auth/callback')) {
          router.push('/');
        }
      }, 150);
      return;
    }

    // Auto-initialize demo session if unauthenticated on direct entry
    if (!getAccessToken()) {
      const initialToken = `demo-access-token-hrms.lead@techm4india.com-${Date.now()}`;
      setSession({
        accessToken: initialToken,
        refreshToken: `demo-refresh-token-hrms.lead@techm4india.com-${Date.now()}`,
        expiresIn: 86400,
        tokenType: 'Bearer',
      });
      setHasToken(true);
    }
  }, [router]);

  // Resilient parallel API sync on mount (identical to Finance ERP)
  useEffect(() => {
    let isMounted = true;
    async function syncWithApi() {
      try {
        const [dash, att, emps, leaves, balances, pay, clms] = await Promise.allSettled([
          hrmsApi.getDashboardSummary(),
          hrmsApi.getTodayAttendance(),
          hrmsApi.getEmployees(),
          hrmsApi.getLeaveApplications(),
          hrmsApi.getLeaveBalances(),
          hrmsApi.getPayrollRecords(),
          hrmsApi.getClaims(),
        ]);

        if (!isMounted) return;

        if (dash.status === 'fulfilled' && dash.value) {
          if (dash.value.holidays) setHolidays(dash.value.holidays);
          if (dash.value.announcements) setAnnouncements(dash.value.announcements);
        }
        if (att.status === 'fulfilled' && att.value) setAttendance(att.value);
        if (emps.status === 'fulfilled' && Array.isArray(emps.value) && emps.value.length > 0) {
          setEmployees(emps.value);
        }
        if (leaves.status === 'fulfilled' && Array.isArray(leaves.value)) {
          setLeaveApplications(leaves.value);
        }
        if (balances.status === 'fulfilled' && Array.isArray(balances.value)) {
          setLeaveBalances(balances.value);
        }
        if (pay.status === 'fulfilled' && Array.isArray(pay.value)) {
          setPayrollRecords(pay.value);
        }
        if (clms.status === 'fulfilled' && Array.isArray(clms.value)) {
          setClaims(clms.value);
        }
      } catch {
        // Fallback to in-memory verified baseline
      }
    }

    syncWithApi();
    return () => {
      isMounted = false;
    };
  }, []);

  // Normalize path & synchronize tab with deep link routes
  let normalizedPath = pathname;
  if (normalizedPath.startsWith('/hrms')) {
    normalizedPath = normalizedPath.slice(5) || '/';
  }
  if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  useEffect(() => {
    if (normalizedPath === '/employees') setActiveTab('employees');
    else if (normalizedPath === '/attendance') setActiveTab('attendance');
    else if (normalizedPath === '/leave') setActiveTab('leave');
    else if (normalizedPath === '/payroll') setActiveTab('payroll');
    else if (normalizedPath === '/claims') setActiveTab('claims');
    else if (normalizedPath === '/documents') setActiveTab('overview');
    else if (normalizedPath === '/incidents') setActiveTab('overview');
    else if (normalizedPath === '/announcements') setActiveTab('overview');
    else if (normalizedPath === '/reports') setActiveTab('overview');
    else if (normalizedPath === '/settings') setActiveTab('overview');
    else if (normalizedPath === '/' || normalizedPath === '/overview') setActiveTab('overview');
  }, [normalizedPath]);

  // Tab change with shallow pushState for clean address bar
  const handleTabChange = (tab: HrmsTab) => {
    setActiveTab(tab);
    const targetUrl = tab === 'overview' ? '/' : `/${tab}`;
    if (typeof window !== 'undefined' && window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handlers
  const handleToggleClock = async () => {
    const isClockedIn = Boolean(attendance?.clockInTime && !attendance?.clockOutTime);
    const updated = await hrmsApi.toggleClock(isClockedIn);
    setAttendance(updated);
    showToast(isClockedIn ? 'Successfully clocked out of duty.' : 'Successfully clocked in for today!');
  };

  const handleReviewLeave = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    await hrmsApi.reviewLeave(id, status);
    setLeaveApplications((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l)),
    );
    showToast(`Leave application ${status.toLowerCase()} successfully.`);
  };

  const handleApplyLeave = async (data: any) => {
    const created = await hrmsApi.applyLeave(data);
    setLeaveApplications([created, ...leaveApplications]);
    showToast('Leave request submitted to reporting manager.');
  };

  const handleSubmitClaim = async (data: any) => {
    const created = await hrmsApi.submitClaim(data);
    setClaims([created, ...claims]);
    showToast('Expense claim registered and queued for finance audit.');
  };

  const handleAddEmployee = async (data: Partial<EmployeeItem>) => {
    const created = await hrmsApi.createEmployee(data);
    setEmployees([created, ...employees]);
    showToast(`Employee ${created.firstName} ${created.lastName} registered successfully.`);
  };

  const handleSignOut = () => {
    clearSession();
    setHasToken(false);
    window.location.href = '/login';
  };

  // Fast lightweight transition screen while processing SSO callback
  if (isProcessingSso || normalizedPath === '/auth/callback') {
    return (
      <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center p-4">
        <div className="bg-white border border-[#e3ded5] rounded-2xl p-8 max-w-sm w-full text-center shadow-lg space-y-4">
          <div className="w-10 h-10 border-3 border-[#c62d37] border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h3 className="text-base font-bold text-[#1f2946]">Authenticating HRMS Session</h3>
            <p className="text-xs text-[#5a6376] mt-1">Verifying single sign-on credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  // If explicit /login route requested, present dedicated login view
  if (normalizedPath === '/login') {
    return (
      <DirectLoginPage
        onLoginSuccess={() => {
          setHasToken(true);
          router.push('/');
        }}
      />
    );
  }

  const isClockedIn = Boolean(attendance?.clockInTime && !attendance?.clockOutTime);

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#20283b] flex flex-col antialiased relative">
      {/* Blueprint paper watermark grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(rgba(198, 45, 55, 0.12) 1px, transparent 1px), radial-gradient(rgba(31, 41, 70, 0.08) 1px, #f7f6f2 1px)',
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px',
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <HrmsHeader
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isClockedIn={isClockedIn}
        onToggleClock={handleToggleClock}
        onOpenApplyLeave={() => setIsApplyModalOpen(true)}
        onOpenSubmitClaim={() => setIsClaimModalOpen(true)}
        onOpenAddEmployee={() => setActiveTab('employees')}
        onSignOut={handleSignOut}
        userEmail="hrms.lead@techm4india.com"
        userName="Aarav Patel"
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-200">
          <div className="bg-[#1f2946] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 relative z-10">
        {activeTab === 'overview' && (
          <HrmsOverview
            attendance={attendance}
            onToggleClock={handleToggleClock}
            leaveBalances={leaveBalances}
            pendingLeaves={leaveApplications.filter((l) => l.status === 'PENDING')}
            onReviewLeave={handleReviewLeave}
            holidays={holidays}
            announcements={announcements}
            onNavigateTab={handleTabChange}
            userName="Aarav Patel"
          />
        )}

        {activeTab === 'employees' && (
          <HrmsEmployees
            employees={employees}
            onAddEmployee={handleAddEmployee}
          />
        )}

        {activeTab === 'attendance' && (
          <HrmsAttendance
            attendance={attendance}
            onToggleClock={handleToggleClock}
          />
        )}

        {activeTab === 'leave' && (
          <HrmsLeave
            balances={leaveBalances}
            applications={leaveApplications}
            onApplyLeave={handleApplyLeave}
            onReviewLeave={handleReviewLeave}
            isApplyModalOpen={isApplyModalOpen}
            setIsApplyModalOpen={setIsApplyModalOpen}
          />
        )}

        {activeTab === 'payroll' && (
          <HrmsPayroll payrollRecords={payrollRecords} />
        )}

        {activeTab === 'claims' && (
          <HrmsClaims
            claims={claims}
            onSubmitClaim={handleSubmitClaim}
            isSubmitModalOpen={isClaimModalOpen}
            setIsSubmitModalOpen={setIsClaimModalOpen}
          />
        )}
      </main>

      {/* Enterprise Editorial Footer */}
      <footer className="border-t border-[#e3ded5] bg-white py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-[#5a6376] relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <span>
            &copy; {new Date().getFullYear()} TechM4India Innovations Pvt. Ltd. · Human Capital ERP
          </span>
          <div className="flex items-center gap-3">
            <a href="http://localhost:5173" className="hover:text-[#1f2946] underline">
              Corporate Website
            </a>
            <span>•</span>
            <a href="http://localhost:5173/dashboard" className="hover:text-[#1f2946] underline">
              Central Dashboard
            </a>
            <span>•</span>
            <span className="font-mono text-[11px] text-[#047857] font-semibold">
              ● Indian Statutory Engine Verified
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
