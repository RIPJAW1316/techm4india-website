import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  MapPin,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { AttendanceRecord } from '../types';

interface HrmsAttendanceProps {
  attendance: AttendanceRecord | null;
  onToggleClock: () => void;
}

export const HrmsAttendance: React.FC<HrmsAttendanceProps> = ({
  attendance,
  onToggleClock,
}) => {
  const [isRegularizeModalOpen, setIsRegularizeModalOpen] = useState(false);
  const [regularizeReason, setRegularizeReason] = useState('');
  const [requestedTime, setRequestedTime] = useState('09:00');
  const [notification, setNotification] = useState<string | null>(null);

  const isClockedIn = Boolean(attendance?.clockInTime && !attendance?.clockOutTime);

  const pastLogs = attendance
    ? [
        {
          date: attendance.workDate,
          in: attendance.clockInTime || '—',
          out: attendance.clockOutTime || '—',
          hours: isClockedIn ? 'In Progress' : `${attendance.totalHours || 0}h`,
          status: attendance.status,
          terminal: 'Web Attendance Portal',
        },
      ]
    : [];

  const handleRegularizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification('Regularization request submitted to HR manager for review.');
    setIsRegularizeModalOpen(false);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Punch */}
      <div className="bg-white rounded-2xl p-6 border border-[#e3ded5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#1f2946] tracking-tight">
            Time &amp; Biometric Attendance Tracker
          </h2>
          <p className="text-xs text-[#5a6376] mt-1">
            Automated punch synchronization with corporate fingerprint scanner &amp; mobile geofenced check-in.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleClock}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
              isClockedIn
                ? 'bg-[#c62d37] hover:bg-[#a8242d] text-white'
                : 'bg-[#047857] hover:bg-[#065f46] text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{isClockedIn ? 'Clock Out of Duty' : 'Clock In for Duty'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRegularizeModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#f7f6f2] border border-[#d1cbbf] text-[#1f2946] text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Regularize Missed Punch
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#e3ded5] shadow-xs">
          <span className="text-[11px] font-bold text-[#5a6376] uppercase">Monthly Working Days</span>
          <div className="text-2xl font-black text-[#1f2946] mt-1">
            {attendance ? '22 Days' : '—'}
          </div>
          <span className="text-[10px] text-[#5a6376]">Active payroll cycle</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#e3ded5] shadow-xs">
          <span className="text-[11px] font-bold text-[#5a6376] uppercase">Days Present</span>
          <div className="text-2xl font-black text-[#047857] mt-1">
            {attendance?.status === 'PRESENT' ? '1 Day' : '0 Days'}
          </div>
          <span className="text-[10px] text-[#047857] font-semibold">Active Cycle Logs</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#e3ded5] shadow-xs">
          <span className="text-[11px] font-bold text-[#5a6376] uppercase">Current Status</span>
          <div className="text-2xl font-black text-[#b45309] mt-1">
            {attendance?.status || 'ABSENT'}
          </div>
          <span className="text-[10px] text-[#5a6376]">{isClockedIn ? 'Clocked In' : 'Clocked Out'}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#e3ded5] shadow-xs">
          <span className="text-[11px] font-bold text-[#5a6376] uppercase">Assigned Shift</span>
          <div className="text-lg font-black text-[#1f2946] mt-1">
            {attendance?.shiftName || 'Standard Shift'}
          </div>
          <span className="text-[10px] text-[#5a6376]">Corporate General Shift</span>
        </div>
      </div>

      {/* Daily Attendance History Card */}
      <div className="bg-white rounded-2xl border border-[#e3ded5] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#e3ded5] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1f2946]">Daily Attendance &amp; Shift Register</h3>
          <span className="text-xs text-[#5a6376] font-mono">Biometric Terminal ID: HYD-01</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f7f6f2] border-b border-[#e3ded5] text-[#5a6376] font-bold uppercase text-[11px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Clock In</th>
                <th className="py-3 px-4">Clock Out</th>
                <th className="py-3 px-4">Effective Hours</th>
                <th className="py-3 px-4">Terminal &amp; Network</th>
                <th className="py-3 px-4 text-right">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece3]">
              {pastLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#5a6376]">
                    No attendance records for today. Clock in to record your attendance.
                  </td>
                </tr>
              ) : (
                pastLogs.map((log) => (
                  <tr key={log.date} className="hover:bg-[#fbfbf9]">
                    <td className="py-3 px-4 font-mono font-bold text-[#1f2946]">{log.date}</td>
                    <td className="py-3 px-4 font-mono">{log.in}</td>
                    <td className="py-3 px-4 font-mono">{log.out}</td>
                    <td className="py-3 px-4 font-semibold text-[#1f2946]">{log.hours}</td>
                    <td className="py-3 px-4 text-[#5a6376]">{log.terminal}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          log.status === 'PRESENT'
                            ? 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]'
                            : 'bg-[#f1efe9] text-[#5a6376] border border-[#d1cbbf]'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regularize Modal */}
      {isRegularizeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#e3ded5] shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#1f2946]">Request Punch Regularization</h3>
            <p className="text-xs text-[#5a6376]">
              Submit missed clock-in or clock-out timestamps for manager review.
            </p>

            <form onSubmit={handleRegularizeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#5a6376] font-bold mb-1">Missed Date *</label>
                <input
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] font-mono text-[#1f2946]"
                />
              </div>

              <div>
                <label className="block text-[#5a6376] font-bold mb-1">Correct Clock Time *</label>
                <input
                  type="time"
                  required
                  value={requestedTime}
                  onChange={(e) => setRequestedTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] font-mono text-[#1f2946]"
                />
              </div>

              <div>
                <label className="block text-[#5a6376] font-bold mb-1">Reason for Missed Punch *</label>
                <textarea
                  required
                  rows={3}
                  value={regularizeReason}
                  onChange={(e) => setRegularizeReason(e.target.value)}
                  placeholder="e.g. Card scanner glitch at turnstile gate 1"
                  className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] text-[#1f2946]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegularizeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#d1cbbf] text-[#5a6376] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1f2946] text-white font-bold cursor-pointer"
                >
                  Submit Regularization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
