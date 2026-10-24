'use client';

import React, { useEffect, useState } from 'react';
import {
  hrmsClient,
  type LeaveType,
  type LeaveBalance,
  type LeaveApplication,
  type Employee,
} from '@/lib/hrms-client';

export default function LeavePage() {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my_leaves' | 'balances' | 'holidays'>('my_leaves');

  // Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [reason, setReason] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [emp, typesRes, balRes, appRes] = await Promise.all([
        hrmsClient.getMyProfile().catch(() => null),
        hrmsClient.getLeaveTypes().catch(() => ({ data: [] })),
        hrmsClient.getLeaveBalances().catch(() => ({ data: [] })),
        hrmsClient.getLeaveApplications().catch(() => ({ data: [] })),
      ]);

      setProfile(emp);
      const types = typesRes.data || [];
      setLeaveTypes(types);
      if (types.length > 0 && !selectedTypeId) {
        setSelectedTypeId(types[0].id);
      }
      setBalances(balRes.data || []);
      setApplications(appRes.data || []);
    } catch (err: any) {
      console.error('Failed to load leave records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    setFormSubmitting(true);

    try {
      await hrmsClient.applyLeave({
        leaveTypeId: selectedTypeId,
        startDate,
        endDate: isHalfDay ? startDate : endDate,
        isHalfDay,
        reason,
      });

      setSubmitSuccess('Leave request submitted successfully for approval.');
      setReason('');
      setIsHalfDay(false);
      setShowApplyModal(false);
      await loadData();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit leave request');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleReview = async (applicationId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) return;
    try {
      await hrmsClient.reviewLeaveApplication(applicationId, {
        status,
        reviewRemarks: `Reviewed via HRMS Portal on ${new Date().toLocaleDateString('en-IN')}`,
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--tm-navy)', margin: '0 0 6px 0' }}>
            e-Leave Management & Balances
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Hr.my-compatible annual leave tracking, casual leave, sick days, multi-level approvals, and holiday calendar.
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          style={{
            padding: '10px 18px',
            backgroundColor: 'var(--tm-navy)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>event_available</span>
          Apply For Leave
        </button>
      </div>

      {submitSuccess && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
          ✓ {submitSuccess}
        </div>
      )}

      {/* Leave Entitlement & Balance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {balances.length > 0 ? (
          balances.map((b) => (
            <div
              key={b.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {b.leaveType.name} ({b.leaveType.code})
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--tm-navy)', marginTop: '8px' }}>
                {b.remainingDays}{' '}
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}>/ {b.allocatedDays} days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '12px', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                <span>Used: {b.usedDays}d</span>
                <span>Pending: {b.pendingDays}d</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: 'span 4', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
            Leave balances initialized for calendar year 2026. Standard allocation applied per company policy.
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('my_leaves')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'my_leaves' ? '2px solid var(--tm-navy)' : '2px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'my_leaves' ? 600 : 500,
            color: activeTab === 'my_leaves' ? 'var(--tm-navy)' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Leave Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('balances')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'balances' ? '2px solid var(--tm-navy)' : '2px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'balances' ? 600 : 500,
            color: activeTab === 'balances' ? 'var(--tm-navy)' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Leave Policy & Categories
        </button>
      </div>

      {/* Main Table: Leave Applications */}
      {activeTab === 'my_leaves' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--tm-navy)' }}>
              e-Leave Applications History & Approvals
            </span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Showing {applications.length} applications
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Employee</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Leave Type</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Duration</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Days</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Reason</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                    No leave requests found. Click "Apply For Leave" to file your first application.
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const sDate = new Date(app.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                  const eDate = new Date(app.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                  return (
                    <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--tm-navy)' }}>
                          {app.employee ? `${app.employee.firstName} ${app.employee.lastName}` : (profile ? `${profile.firstName} ${profile.lastName}` : 'Self')}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {app.employee?.employeeCode || profile?.employeeCode}
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontWeight: 500 }}>
                          {app.leaveType.name}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#334155' }}>
                        {sDate} {app.startDate !== app.endDate ? `to ${eDate}` : ''}
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--tm-navy)' }}>
                        {app.totalDays} {app.totalDays === 1 ? 'day' : 'days'}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#475569', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {app.reason}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor:
                              app.status === 'APPROVED'
                                ? '#dcfce7'
                                : app.status === 'REJECTED'
                                ? '#fee2e2'
                                : '#fef3c7',
                            color:
                              app.status === 'APPROVED'
                                ? '#166534'
                                : app.status === 'REJECTED'
                                ? '#991b1b'
                                : '#92400e',
                          }}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        {app.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleReview(app.id, 'APPROVED')}
                              style={{ padding: '4px 8px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview(app.id, 'REJECTED')}
                              style={{ padding: '4px 8px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Policy & Categories */}
      {activeTab === 'balances' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--tm-navy)', margin: '0 0 16px 0' }}>
            Configured Leave Policies (TechM4India Enterprise Rules)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {leaveTypes.map((t) => (
              <div key={t.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, color: 'var(--tm-navy)' }}>{t.name}</div>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#f1f5f9' }}>{t.code}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', margin: '8px 0' }}>
                  {t.description || 'Statutory employee leave allowance under TechM4India rules.'}
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#475569' }}>
                  <span>Default: <strong>{t.defaultDays} days/yr</strong></span>
                  <span>Paid: <strong>{t.isPaid ? 'Yes' : 'No'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              width: '500px',
              maxWidth: '90vw',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--tm-navy)', margin: 0 }}>
                Apply For e-Leave
              </h2>
              <button
                onClick={() => setShowApplyModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleApplyLeave} style={{ padding: '24px' }}>
              {submitError && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                  {submitError}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  LEAVE TYPE *
                </label>
                <select
                  value={selectedTypeId}
                  onChange={(e) => setSelectedTypeId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  {leaveTypes.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name} ({lt.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    START DATE *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    END DATE *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    disabled={isHalfDay}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', backgroundColor: isHalfDay ? '#f8fafc' : '#fff' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="halfDay"
                  checked={isHalfDay}
                  onChange={(e) => setIsHalfDay(e.target.checked)}
                />
                <label htmlFor="halfDay" style={{ fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                  Half-day leave (0.5 day deduction)
                </label>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  REASON / REMARKS *
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide reason for planned absence or medical appointment..."
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  style={{ padding: '10px 16px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  style={{ padding: '10px 18px', backgroundColor: 'var(--tm-navy)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                >
                  {formSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
