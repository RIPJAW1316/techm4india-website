import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Megaphone,
  PlusCircle,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import {
  AnnouncementItem,
  AttendanceRecord,
  HolidayItem,
  LeaveApplicationItem,
  LeaveBalanceItem,
} from '../types';

interface HrmsOverviewProps {
  attendance: AttendanceRecord;
  onToggleClock: () => void;
  leaveBalances: LeaveBalanceItem[];
  pendingLeaves: LeaveApplicationItem[];
  onReviewLeave: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  holidays: HolidayItem[];
  announcements: AnnouncementItem[];
  onNavigateTab: (tab: any) => void;
  userName?: string;
}

export const HrmsOverview: React.FC<HrmsOverviewProps> = ({
  attendance,
  onToggleClock,
  leaveBalances,
  pendingLeaves,
  onReviewLeave,
  holidays,
  announcements,
  onNavigateTab,
  userName = 'Aarav Patel',
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isClockedIn = Boolean(attendance?.clockInTime && !attendance?.clockOutTime);

  return (
    <div className="space-y-6">
      {/* Welcome & Organization Banner */}
      <section className="bg-white border border-[#e3ded5] rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c62d37] to-[#1f2946] flex items-center justify-center text-white font-black text-2xl shadow-md shrink-0">
              {userName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f2946] tracking-tight">
                  Welcome, {userName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
                  <CheckCircle2 className="w-3 h-3" />
                  Active Session
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#5a6376] mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Role: HR Operations Manager</span>
                <span>•</span>
                <span className="font-semibold text-[#1f2946]">Org: TECHM4INDIA</span>
                <span>•</span>
                <span>Port: 3002</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('leave')}
              className="px-4 py-2.5 rounded-xl bg-[#1f2946] hover:bg-[#151c31] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#f59e0b]" />
              <span>Apply Leave</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('claims')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#f7f6f2] text-[#1f2946] text-xs font-bold border border-[#d1cbbf] transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-[#2563eb]" />
              <span>Submit Claim</span>
            </button>
          </div>
        </div>

        {/* Platform Metrics Strip */}
        <div className="mt-6 pt-6 border-t border-[#e3ded5] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-[11px] text-[#5a6376] font-bold uppercase tracking-wider">
              Total Workforce
            </p>
            <p className="text-2xl font-black text-[#1f2946] mt-0.5">48</p>
          </div>
          <div>
            <p className="text-[11px] text-[#5a6376] font-bold uppercase tracking-wider">
              Attendance Rate
            </p>
            <p className="text-2xl font-black text-[#047857] mt-0.5">93.8%</p>
          </div>
          <div>
            <p className="text-[11px] text-[#5a6376] font-bold uppercase tracking-wider">
              Pending Leaves
            </p>
            <p className="text-2xl font-black text-[#f59e0b] mt-0.5">
              {pendingLeaves.length}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-[#5a6376] font-bold uppercase tracking-wider">
              Payroll Cycle
            </p>
            <p className="text-2xl font-black text-[#1f2946] mt-0.5">Oct 2026</p>
          </div>
        </div>
      </section>

      {/* 4 Actionable KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#e3ded5] shadow-xs hover:border-[#cbd5e1] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a6376]">
              Active Workforce
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1f2946] mt-2">48</div>
          <div className="text-[11px] text-[#047857] font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>100% verified identities</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#e3ded5] shadow-xs hover:border-[#cbd5e1] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a6376]">
              Present Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#ecfdf5] text-[#047857] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1f2946] mt-2">45</div>
          <div className="text-[11px] text-[#5a6376] mt-1">
            <span>Daily office &amp; remote punches</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#e3ded5] shadow-xs hover:border-[#cbd5e1] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a6376]">
              On Leave Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#fffbeb] text-[#b45309] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1f2946] mt-2">3</div>
          <div className="text-[11px] text-[#5a6376] mt-1">
            <span>Approved medical &amp; privilege leaves</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#e3ded5] shadow-xs hover:border-[#cbd5e1] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a6376]">
              Action Required
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#fff1f2] text-[#c62d37] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#c62d37] mt-2">
            {pendingLeaves.length + 1}
          </div>
          <div className="text-[11px] text-[#c62d37] font-semibold mt-1">
            <span>Pending leaves &amp; claims approvals</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Web Time Clock & Self Service Leave Balances */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-time Web Time Clock Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#e3ded5] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#f0ece3] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#c62d37]" />
                <h2 className="text-sm font-bold text-[#1f2946]">Web Biometric Time Clock</h2>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#f1efe9] text-[#1f2946] border border-[#d1cbbf]">
                IST (UTC+5:30)
              </span>
            </div>

            <div className="text-center py-2">
              <div className="text-3xl sm:text-4xl font-mono font-black text-[#1f2946] tracking-tight">
                {currentTime || '10:00:00 AM'}
              </div>
              <div className="text-xs text-[#5a6376] mt-1">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#f7f6f2] border border-[#e3ded5] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5a6376]">Today&apos;s Clock In:</span>
                <strong className="text-[#1f2946] font-mono font-bold">
                  {attendance?.clockInTime || 'Not Clocked In'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a6376]">Shift Type:</span>
                <span className="text-[#1f2946] font-semibold">General (09:00 - 18:00)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a6376]">Terminal Location:</span>
                <span className="text-[#1f2946] font-semibold">Hyderabad HQ Main Gate</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleClock}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 ${
                isClockedIn
                  ? 'bg-[#c62d37] hover:bg-[#a8242d] text-white'
                  : 'bg-[#047857] hover:bg-[#065f46] text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{isClockedIn ? 'Clock Out for the Day' : 'Clock In Now'}</span>
            </button>
          </div>

          {/* Self-Service Leave Balances Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#e3ded5] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0ece3] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2563eb]" />
                <h2 className="text-sm font-bold text-[#1f2946]">Your Leave Entitlements</h2>
              </div>
              <span className="text-[10px] font-bold text-[#5a6376] uppercase">FY 2026-27</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {leaveBalances.map((b) => (
                <div
                  key={b.code}
                  className="p-3.5 rounded-xl border border-[#e3ded5] bg-[#f7f6f2] space-y-1 hover:border-[#cbd5e1] transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-[#5a6376]">
                    <span className="font-semibold truncate">{b.name}</span>
                  </div>
                  <div className="text-2xl font-black text-[#1f2946]">{b.remainingDays}</div>
                  <div className="text-[10px] text-[#5a6376]">
                    {b.takenDays} used of {b.entitledDays} days
                  </div>
                  <div className="w-full bg-[#e3ded5] h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-[#1f2946] h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((b.takenDays / (b.entitledDays || 1)) * 100),
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Approvals, Holidays, Announcements */}
        <div className="lg:col-span-7 space-y-6">
          {/* Pending Approval Requests Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#e3ded5] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0ece3] pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#c62d37]" />
                <h2 className="text-sm font-bold text-[#1f2946]">
                  Pending Leave Approval Requests ({pendingLeaves.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('leave')}
                className="text-xs text-[#c62d37] font-bold hover:underline cursor-pointer"
              >
                View All &rarr;
              </button>
            </div>

            {pendingLeaves.length === 0 ? (
              <div className="p-8 text-center bg-[#f7f6f2] rounded-xl border border-dashed border-[#d1cbbf] text-xs text-[#5a6376]">
                <CheckCircle2 className="w-6 h-6 text-[#047857] mx-auto mb-1.5" />
                No pending leave approval requests at this time. All caught up!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLeaves.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-[#e3ded5] bg-[#f7f6f2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#cbd5e1] transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1f2946]">
                          {app.employeeName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#d1cbbf] text-[#5a6376]">
                          {app.employeeCode}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
                          {app.leaveType}
                        </span>
                      </div>
                      <p className="text-xs text-[#5a6376] mt-1">
                        <strong>
                          {app.startDate} to {app.endDate}
                        </strong>{' '}
                        ({app.totalDays} {app.totalDays === 1 ? 'day' : 'days'})
                      </p>
                      <p className="text-xs text-[#5a6376] italic mt-0.5">&ldquo;{app.reason}&rdquo;</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onReviewLeave(app.id, 'APPROVED')}
                        className="px-3 py-1.5 rounded-lg bg-[#047857] hover:bg-[#065f46] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onReviewLeave(app.id, 'REJECTED')}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Public Holidays & Announcements Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Public Holidays */}
            <div className="bg-white rounded-2xl p-6 border border-[#e3ded5] shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-[#f0ece3] pb-3">
                <Calendar className="w-4 h-4 text-[#c62d37]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1f2946]">
                  Upcoming Holidays 2026-27
                </h3>
              </div>
              <div className="space-y-2.5">
                {holidays.slice(0, 4).map((h) => (
                  <div
                    key={h.name}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#f7f6f2] border border-[#e3ded5] text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#1f2946]">{h.name}</div>
                      <div className="text-[10px] text-[#5a6376]">{h.dayOfWeek}</div>
                    </div>
                    <span className="font-mono text-xs font-semibold text-[#1f2946] px-2 py-1 rounded bg-white border border-[#d1cbbf]">
                      {h.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-2xl p-6 border border-[#e3ded5] shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-[#f0ece3] pb-3">
                <Megaphone className="w-4 h-4 text-[#2563eb]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1f2946]">
                  Company Bulletins
                </h3>
              </div>
              <div className="space-y-2.5">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl bg-[#f7f6f2] border border-[#e3ded5] space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#c62d37] uppercase">{a.category}</span>
                      <span className="text-[#5a6376]">{a.publishedAt}</span>
                    </div>
                    <div className="text-xs font-bold text-[#1f2946]">{a.title}</div>
                    <p className="text-[11px] text-[#5a6376] leading-relaxed line-clamp-2">
                      {a.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
