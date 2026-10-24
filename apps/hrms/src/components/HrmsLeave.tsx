import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import { LeaveApplicationItem, LeaveBalanceItem } from '../types';

interface HrmsLeaveProps {
  balances: LeaveBalanceItem[];
  applications: LeaveApplicationItem[];
  onApplyLeave: (data: any) => void;
  onReviewLeave: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  isApplyModalOpen?: boolean;
  setIsApplyModalOpen?: (open: boolean) => void;
}

export const HrmsLeave: React.FC<HrmsLeaveProps> = ({
  balances,
  applications,
  onApplyLeave,
  onReviewLeave,
  isApplyModalOpen: externalModalOpen,
  setIsApplyModalOpen: setExternalModalOpen,
}) => {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const isModalOpen =
    externalModalOpen !== undefined ? externalModalOpen : internalModalOpen;
  const setModalOpen = setExternalModalOpen || setInternalModalOpen;

  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalDays, setTotalDays] = useState(1);
  const [reason, setReason] = useState('');

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    onApplyLeave({
      leaveType,
      startDate,
      endDate,
      totalDays: Number(totalDays) || 1,
      reason,
    });

    setModalOpen(false);
    setReason('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Apply Trigger */}
      <div className="bg-white rounded-2xl p-6 border border-[#e3ded5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1f2946] tracking-tight">
            e-Leave Tracking &amp; Entitlements Portal
          </h2>
          <p className="text-xs text-[#5a6376] mt-1">
            Automated leave accruals, carry-forward tracking, and multi-tier manager approval workflows.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#1f2946] hover:bg-[#151c31] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#f59e0b]" />
          <span>Apply For Leave</span>
        </button>
      </div>

      {/* Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.map((b) => (
          <div
            key={b.code}
            className="bg-white rounded-2xl p-5 border border-[#e3ded5] shadow-xs space-y-2 hover:border-[#cbd5e1] transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a6376] truncate">
                {b.name}
              </span>
              <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
                Paid
              </span>
            </div>
            <div className="text-3xl font-black text-[#1f2946]">{b.remainingDays}</div>
            <p className="text-[11px] text-[#5a6376]">
              {b.takenDays} consumed of {b.entitledDays} total days
            </p>
            <div className="w-full bg-[#f1efe9] h-2 rounded-full overflow-hidden">
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

      {/* Leave Applications History */}
      <div className="bg-white rounded-2xl border border-[#e3ded5] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#e3ded5] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1f2946]">Leave Applications Roster</h3>
          <span className="text-xs text-[#5a6376]">Showing latest applications across all departments</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f7f6f2] border-b border-[#e3ded5] text-[#5a6376] font-bold uppercase text-[11px]">
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Total Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece3]">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-[#fbfbf9]">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#1f2946]">{app.employeeName}</div>
                    <div className="font-mono text-[10px] text-[#5a6376]">{app.employeeCode}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#1f2946]">{app.leaveType}</span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {app.startDate} to {app.endDate}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#1f2946]">
                    {app.totalDays} {app.totalDays === 1 ? 'day' : 'days'}
                  </td>
                  <td className="py-3 px-4 text-[#5a6376] max-w-[200px] truncate" title={app.reason}>
                    {app.reason}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        app.status === 'APPROVED'
                          ? 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]'
                          : app.status === 'REJECTED'
                          ? 'bg-[#fef2f2] text-[#be123c] border border-[#fecdd3]'
                          : 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a]'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {app.status === 'PENDING' ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onReviewLeave(app.id, 'APPROVED')}
                          className="px-2.5 py-1 rounded-lg bg-[#047857] text-white font-bold hover:bg-[#065f46] text-[11px] shadow-xs cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onReviewLeave(app.id, 'REJECTED')}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#fecdd3] text-[#be123c] hover:bg-[#fff1f2] font-bold text-[11px] shadow-xs cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[#5a6376] text-[11px]">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#e3ded5] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1f2946]">Apply for Leave</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-[#5a6376] hover:bg-[#f7f6f2] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#5a6376] font-bold mb-1">Leave Category *</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] text-[#1f2946] font-semibold"
                >
                  <option value="Annual Leave">Annual Paid Privilege Leave</option>
                  <option value="Sick Leave">Sick &amp; Medical Contingency Leave</option>
                  <option value="Casual Leave">Casual Personal Leave</option>
                  <option value="Festival Leave">Optional Festival Floating Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5a6376] font-bold mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] font-mono text-[#1f2946]"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6376] font-bold mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] font-mono text-[#1f2946]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#5a6376] font-bold mb-1">Total Days *</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  required
                  value={totalDays}
                  onChange={(e) => setTotalDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] font-mono text-[#1f2946]"
                />
              </div>

              <div>
                <label className="block text-[#5a6376] font-bold mb-1">Reason for Leave *</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide brief context for leave review..."
                  className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] text-[#1f2946]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#d1cbbf] text-[#5a6376] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1f2946] text-white font-bold"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
