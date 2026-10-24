import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/auth-client';
import HrmsLayout from '@/app/hrms/layout';
import HrmsDashboardPage from '@/app/hrms/page';
import HrmsEmployeesPage from '@/app/hrms/employees/page';
import HrmsAttendancePage from '@/app/hrms/attendance/page';
import HrmsLeavePage from '@/app/hrms/leave/page';
import HrmsPayrollPage from '@/app/hrms/payroll/page';
import HrmsClaimsPage from '@/app/hrms/claims/page';
import HrmsDocumentsPage from '@/app/hrms/documents/page';
import HrmsIncidentsPage from '@/app/hrms/incidents/page';
import HrmsAnnouncementsPage from '@/app/hrms/announcements/page';
import HrmsReportsPage from '@/app/hrms/reports/page';
import HrmsSettingsPage from '@/app/hrms/settings/page';
import HrmsAuthCallbackPage from '@/app/hrms/auth/callback/page';
import DirectLoginPage from './pages/DirectLogin';

export default function App() {
  const pathname = usePathname();
  const router = useRouter();
  const [hasToken, setHasToken] = useState<boolean>(() => !!getAccessToken());

  useEffect(() => {
    setHasToken(!!getAccessToken());
  }, [pathname]);

  // Normalize path: support both /employees and /hrms/employees
  let normalizedPath = pathname;
  if (normalizedPath.startsWith('/hrms')) {
    normalizedPath = normalizedPath.slice(5) || '/';
  }
  // Remove trailing slash if longer than 1 char
  if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  // Handle SSO Callback Route directly
  if (normalizedPath === '/auth/callback') {
    return <HrmsAuthCallbackPage />;
  }

  // If unauthenticated or explicit /login route, present direct login view
  if (!hasToken || normalizedPath === '/login') {
    return <DirectLoginPage onLoginSuccess={() => setHasToken(true)} />;
  }

  // Render the appropriate HRMS view inside the layout shell
  const renderActiveRoute = () => {
    switch (normalizedPath) {
      case '/':
      case '/overview':
        return <HrmsDashboardPage />;
      case '/employees':
        return <HrmsEmployeesPage />;
      case '/attendance':
        return <HrmsAttendancePage />;
      case '/leave':
        return <HrmsLeavePage />;
      case '/payroll':
        return <HrmsPayrollPage />;
      case '/claims':
        return <HrmsClaimsPage />;
      case '/documents':
        return <HrmsDocumentsPage />;
      case '/incidents':
        return <HrmsIncidentsPage />;
      case '/announcements':
        return <HrmsAnnouncementsPage />;
      case '/reports':
        return <HrmsReportsPage />;
      case '/settings':
        return <HrmsSettingsPage />;
      default:
        return (
          <div className="p-8 text-center space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
            <p className="text-sm text-slate-500">The requested HRMS section does not exist.</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-[#1f2946] text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Return to HRMS Overview
            </button>
          </div>
        );
    }
  };

  return <HrmsLayout>{renderActiveRoute()}</HrmsLayout>;
}
