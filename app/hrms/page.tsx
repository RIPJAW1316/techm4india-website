"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Megaphone,
  PlusCircle,
  Receipt,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import {
  clockIn,
  clockOut,
  getHrmsSummary,
  getLeaveApplications,
  getTodayAttendance,
  reviewLeave,
} from "@/lib/hrms-client";

export default function HrmsDashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClocking, setIsClocking] = useState(false);
  const [clockActionMsg, setClockActionMsg] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Update live clock
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const [sum, att, leaves] = await Promise.all([
          getHrmsSummary().catch(() => null),
          getTodayAttendance().catch(() => null),
          getLeaveApplications({ status: "PENDING" }).catch(() => []),
        ]);
        if (!ignore) {
          setSummary(sum);
          setAttendance(att);
          setPendingLeaves(leaves || []);
          setIsLoading(false);
        }
      } catch {
        if (!ignore) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleClockAction(type: "in" | "out") {
    setIsClocking(true);
    setClockActionMsg(null);
    try {
      let record;
      if (type === "in") {
        record = await clockIn("Web portal check-in");
        setClockActionMsg("Successfully clocked in for today!");
      } else {
        record = await clockOut("Web portal check-out");
        setClockActionMsg("Successfully clocked out for today!");
      }
      setAttendance(record);
    } catch (err: any) {
      setClockActionMsg(err.message || "Failed to record clock event.");
    } finally {
      setIsClocking(false);
    }
  }

  async function handleReviewLeave(appId: string, status: "APPROVED" | "REJECTED") {
    try {
      await reviewLeave(appId, { status });
      setPendingLeaves((prev) => prev.filter((p) => p.id !== appId));
    } catch (err: any) {
      alert(err.message || "Failed to update leave application.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-3 border-slate-300 border-t-[#d73531] rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading HRMS Workspace...</p>
      </div>
    );
  }

  const overview = summary?.overview || {
    totalEmployees: 48,
    onLeaveToday: 3,
    presentToday: 42,
    pendingApprovals: { leaves: 2, claims: 1 },
  };

  const holidays = summary?.holidays?.length
    ? summary.holidays
    : [
        { name: "Republic Day", date: "2026-01-26" },
        { name: "Ugadi / Telugu New Year", date: "2026-03-20" },
        { name: "May Day", date: "2026-05-01" },
        { name: "Independence Day", date: "2026-08-15" },
        { name: "Mahatma Gandhi Jayanti", date: "2026-10-02" },
      ];

  const announcements = summary?.announcements?.length
    ? summary.announcements
    : [
        {
          id: "1",
          title: "TechM4India Annual Engineering & Innovation Summit 2026",
          content: "Showcase of school lab payloads and next-gen enterprise software solutions.",
          category: "SUMMIT",
          publishedAt: new Date().toISOString(),
          isPinned: true,
        },
        {
          id: "2",
          title: "Q1 Payroll & Tax Declaration Submission Deadline",
          content: "Please ensure all rent receipts and 80C investment proofs are uploaded.",
          category: "PAYROLL",
          publishedAt: new Date().toISOString(),
          isPinned: false,
        },
      ];

  const selfServiceBalances = summary?.selfService?.leaveBalances?.length
    ? summary.selfService.leaveBalances
    : [
        { leaveType: { name: "Annual Leave", code: "ANNUAL" }, entitledDays: 15, takenDays: 3 },
        { leaveType: { name: "Sick Leave", code: "SICK" }, entitledDays: 10, takenDays: 1 },
        { leaveType: { name: "Casual Leave", code: "CASUAL" }, entitledDays: 7, takenDays: 2 },
      ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Intro */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#d73531]">
            TechM4India Innovations Pvt. Ltd.
          </span>
          <h1 className="text-2xl font-black text-[#252e4a] tracking-tight mt-0.5">
            HRMS Master Workspace & Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete employee lifecycle, automated attendance, e-leave approvals, and Indian statutory payroll.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/hrms/leave"
            className="px-3.5 py-2 rounded-lg bg-[#252e4a] hover:bg-[#1a2135] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Apply Leave</span>
          </Link>
          <Link
            href="/hrms/claims"
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-300 transition-colors inline-flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <span>Submit Claim</span>
          </Link>
        </div>
      </div>

      {/* Actionable KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Workforce
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">{overview.totalEmployees}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>100% verified identities</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Present Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">{overview.presentToday}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>Daily office & field check-ins</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              On Leave Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">{overview.onLeaveToday}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>Approved leave applications</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Pending Approvals
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">
            {(overview.pendingApprovals?.leaves || 0) + (overview.pendingApprovals?.claims || 0)}
          </div>
          <div className="text-[11px] text-red-600 font-semibold mt-1">
            <span>Requires manager/HR action</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Self Service Clock + Leave Balances + Approval Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Web Time Clock & Self Service (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Time Clock Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d73531]" />
                <h2 className="text-sm font-bold text-slate-800">Web Time Clock</h2>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                IST (UTC+5:30)
              </span>
            </div>

            <div className="text-center py-2">
              <div className="text-3xl sm:text-4xl font-mono font-black text-[#252e4a] tracking-tight">
                {currentTime || "10:00:00 AM"}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            {/* Status notification */}
            {clockActionMsg && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{clockActionMsg}</span>
              </div>
            )}

            {/* Clock Status Indicators */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                  Clock In
                </span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {attendance?.clockInTime
                    ? new Date(attendance.clockInTime).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--:--"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                  Clock Out
                </span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {attendance?.clockOutTime
                    ? new Date(attendance.clockOutTime).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--:--"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!attendance?.clockInTime ? (
                <button
                  type="button"
                  disabled={isClocking}
                  onClick={() => handleClockAction("in")}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-900/20 disabled:opacity-50 cursor-pointer"
                >
                  {isClocking ? "Processing..." : "Clock In Now"}
                </button>
              ) : !attendance?.clockOutTime ? (
                <button
                  type="button"
                  disabled={isClocking}
                  onClick={() => handleClockAction("out")}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#d73531] hover:bg-[#b82a27] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-red-900/20 disabled:opacity-50 cursor-pointer"
                >
                  {isClocking ? "Processing..." : "Clock Out"}
                </button>
              ) : (
                <div className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs text-center font-bold">
                  Day Completed & Recorded
                </div>
              )}
            </div>

            <div className="text-center">
              <Link
                href="/hrms/attendance"
                className="text-[11px] text-[#d73531] hover:underline font-semibold"
              >
                View Complete Monthly Timesheet & Regularizations &rarr;
              </Link>
            </div>
          </div>

          {/* Quick Leave Balances */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#d73531]" />
                <h2 className="text-sm font-bold text-slate-800">My Leave Balances (2026)</h2>
              </div>
              <Link
                href="/hrms/leave"
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
              >
                Apply &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {selfServiceBalances.map((lb: any) => {
                const rem = lb.entitledDays - lb.takenDays;
                return (
                  <div
                    key={lb.leaveType?.code || lb.leaveType?.name}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="text-[10px] font-bold text-slate-500 uppercase truncate">
                      {lb.leaveType?.name || "Leave"}
                    </div>
                    <div className="text-xl font-black text-slate-800 mt-1">{rem}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      of {lb.entitledDays} days
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Pending Approvals & Announcements (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Pending Approval Queue */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#d73531]" />
                <h2 className="text-sm font-bold text-slate-800">Manager & HR Approval Queue</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                {pendingLeaves.length} Pending
              </span>
            </div>

            {pendingLeaves.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {pendingLeaves.map((app) => (
                  <div key={app.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">
                          {app.employee?.firstName} {app.employee?.lastName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({app.employee?.employeeNumber})
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {app.leaveType?.name || "Leave"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Date(app.startDate).toLocaleDateString()} to{" "}
                        {new Date(app.endDate).toLocaleDateString()} ({app.totalDays} day
                        {app.totalDays === 1 ? "" : "s"}) • Reason: {app.reason}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleReviewLeave(app.id, "APPROVED")}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReviewLeave(app.id, "REJECTED")}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-semibold text-slate-700">Approval queue is clear</p>
                <p>No pending leave applications awaiting review.</p>
              </div>
            )}
          </div>

          {/* Upcoming Holidays & Notice Board Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Upcoming Holidays */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#d73531]" />
                  Upcoming Holidays
                </span>
                <span className="text-[10px] text-slate-400">2026 Calendar</span>
              </div>
              <div className="space-y-2.5">
                {holidays.map((h: any) => (
                  <div key={h.name + h.date} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate">{h.name}</span>
                    <span className="text-[11px] font-mono text-slate-500 shrink-0">
                      {new Date(h.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Announcements */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-[#d73531]" />
                  Notice Board
                </span>
                <Link href="/hrms/announcements" className="text-[10px] text-red-500 font-bold">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {announcements.map((a: any) => (
                  <div key={a.id} className="text-xs space-y-1">
                    <div className="flex items-center gap-1.5">
                      {a.isPinned && (
                        <span className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-red-100 text-red-800">
                          PINNED
                        </span>
                      )}
                      <p className="font-bold text-slate-800 truncate">{a.title}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
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
}
