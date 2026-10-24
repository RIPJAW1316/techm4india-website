'use client';

import React, { useEffect, useState } from 'react';
import {
  hrmsClient,
  type AttendanceRecord,
  type AttendanceRegularization,
  type Employee,
} from '@/lib/hrms-client';

export default function AttendancePage() {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [regularizations, setRegularizations] = useState<AttendanceRegularization[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timesheet' | 'regularization' | 'summary'>('timesheet');

  // Clock state
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [clockActionLoading, setClockActionLoading] = useState(false);

  // Regularization modal state
  const [showRegModal, setShowRegModal] = useState(false);
  const [regDate, setRegDate] = useState(new Date().toISOString().split('T')[0]);
  const [regClockIn, setRegClockIn] = useState('09:00');
  const [regClockOut, setRegClockOut] = useState('18:00');
  const [regReason, setRegReason] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [emp, attRes, regRes] = await Promise.all([
        hrmsClient.getMyProfile().catch(() => null),
        hrmsClient.getAttendanceRecords(),
        hrmsClient.getRegularizations().catch(() => ({ data: [] })),
      ]);
      setProfile(emp);
      const attData = attRes.data || [];
      setRecords(attData);
      setRegularizations(regRes.data || []);

      const todayStr = new Date().toISOString().split('T')[0];
      const today = attData.find((r) => r.workDate.startsWith(todayStr));
      setTodayRecord(today || null);
    } catch (err: any) {
      console.error('Failed to load attendance records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClockIn = async () => {
    setClockActionLoading(true);
    try {
      await hrmsClient.clockIn({ workMode: 'OFFICE' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to clock in');
    } finally {
      setClockActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockActionLoading(true);
    try {
      await hrmsClient.clockOut();
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to clock out');
    } finally {
      setClockActionLoading(false);
    }
  };

  const handleRegularizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess('');
    setSubmitError('');

    try {
      const inDate = new Date(`${regDate}T${regClockIn}:00Z`).toISOString();
      const outDate = new Date(`${regDate}T${regClockOut}:00Z`).toISOString();

      await hrmsClient.requestRegularization({
        workDate: regDate,
        requestedClockIn: inDate,
        requestedClockOut: outDate,
        reason: regReason,
      });

      setSubmitSuccess('Regularization request submitted to supervisor for review.');
      setRegReason('');
      setShowRegModal(false);
      await loadData();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit regularization request');
    }
  };

  // Metrics
  const totalDays = records.length;
  const presentDays = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
  const lateDays = records.filter((r) => r.isLate).length;
  const totalHours = records.reduce((acc, r) => acc + (r.effectiveHours || 0), 0);
  const avgHours = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : '0';

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Page Title & Top Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--tm-navy)', margin: '0 0 6px 0' }}>
            Time & Attendance Hub
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Biometric-synced web punch clock, daily working hours, timesheet logs, and regularization workflows.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowRegModal(true)}
            style={{
              padding: '10px 18px',
              backgroundColor: '#fff',
              color: 'var(--tm-navy)',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>history_toggle_off</span>
            Apply Regularization
          </button>
        </div>
      </div>

      {submitSuccess && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
          ✓ {submitSuccess}
        </div>
      )}

      {/* Live Punch Clock Widget & Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '20px', marginBottom: '28px' }}>
        {/* Quick Web Clock Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Web Punch Clock (Hr.my Clock-in)
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '12px',
                backgroundColor: todayRecord?.clockIn && !todayRecord?.clockOut ? '#dbeafe' : '#f1f5f9',
                color: todayRecord?.clockIn && !todayRecord?.clockOut ? '#1d4ed8' : '#64748b',
              }}
            >
              {todayRecord?.clockIn && !todayRecord?.clockOut ? 'Clocked In' : 'Not Working'}
            </span>
          </div>

          <div style={{ margin: '12px 0' }}>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Today: {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</div>
            <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>IN TIME</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--tm-navy)' }}>
                  {todayRecord?.clockIn ? new Date(todayRecord.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </div>
              </div>
              <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '24px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>OUT TIME</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--tm-navy)' }}>
                  {todayRecord?.clockOut ? new Date(todayRecord.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </div>
              </div>
              <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '24px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>TOTAL HRS</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#16a34a' }}>
                  {todayRecord?.effectiveHours ? `${todayRecord.effectiveHours.toFixed(1)} hrs` : '0.0 hrs'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={handleClockIn}
              disabled={clockActionLoading || !!todayRecord?.clockIn}
              style={{
                flex: 1,
                padding: '10px 14px',
                backgroundColor: todayRecord?.clockIn ? '#f1f5f9' : '#16a34a',
                color: todayRecord?.clockIn ? '#94a3b8' : '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: todayRecord?.clockIn ? 'not-allowed' : 'pointer',
              }}
            >
              Clock In
            </button>
            <button
              onClick={handleClockOut}
              disabled={clockActionLoading || !todayRecord?.clockIn || !!todayRecord?.clockOut}
              style={{
                flex: 1,
                padding: '10px 14px',
                backgroundColor: !todayRecord?.clockIn || todayRecord?.clockOut ? '#f1f5f9' : 'var(--tm-red)',
                color: !todayRecord?.clockIn || todayRecord?.clockOut ? '#94a3b8' : '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: !todayRecord?.clockIn || todayRecord?.clockOut ? 'not-allowed' : 'pointer',
              }}
            >
              Clock Out
            </button>
          </div>
        </div>

        {/* 4 Attendance KPI Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Recorded Days</div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--tm-navy)', marginTop: '8px' }}>{totalDays}</div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>Active logging period</div>
          </div>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Present Days</div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#16a34a', marginTop: '8px' }}>{presentDays}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>On-time & verified</div>
          </div>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Late Marks</div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#f59e0b', marginTop: '8px' }}>{lateDays}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>After 09:30 AM IST</div>
          </div>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Avg Work Hours</div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--tm-navy)', marginTop: '8px' }}>{avgHours}h</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Standard 8.0h shift</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('timesheet')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'timesheet' ? '2px solid var(--tm-navy)' : '2px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'timesheet' ? 600 : 500,
            color: activeTab === 'timesheet' ? 'var(--tm-navy)' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Daily Timesheet Records
        </button>
        <button
          onClick={() => setActiveTab('regularization')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'regularization' ? '2px solid var(--tm-navy)' : '2px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'regularization' ? 600 : 500,
            color: activeTab === 'regularization' ? 'var(--tm-navy)' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Regularization Requests ({regularizations.length})
        </button>
      </div>

      {/* Table Section */}
      {activeTab === 'timesheet' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--tm-navy)' }}>
              Biometric & Web Attendance History
            </span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Showing {records.length} records
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Work Date</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Employee</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Clock In</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Clock Out</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Total Hours</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Mode</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                    No attendance records logged for this period. Use the Web Punch Clock above.
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const dateStr = new Date(r.workDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const inStr = r.clockIn ? new Date(r.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
                  const outStr = r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';

                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--tm-navy)' }}>{dateStr}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 500 }}>{r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : (profile ? `${profile.firstName} ${profile.lastName}` : 'Self')}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{r.employee?.employeeCode || profile?.employeeCode}</div>
                      </td>
                      <td style={{ padding: '14px 20px', color: r.isLate ? '#f59e0b' : '#334155' }}>
                        {inStr} {r.isLate && <span style={{ fontSize: '10px', backgroundColor: '#fef3c7', color: '#b45309', padding: '1px 5px', borderRadius: '4px', marginLeft: '4px' }}>LATE</span>}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#334155' }}>{outStr}</td>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--tm-navy)' }}>
                        {r.effectiveHours ? `${r.effectiveHours.toFixed(1)} hrs` : '--'}
                        {r.overtimeHours && r.overtimeHours > 0 ? (
                          <span style={{ fontSize: '11px', color: '#16a34a', marginLeft: '4px' }}>(+{r.overtimeHours.toFixed(1)} OT)</span>
                        ) : null}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontSize: '11px', color: '#475569' }}>
                          {r.workMode}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor:
                              r.status === 'PRESENT'
                                ? '#dcfce7'
                                : r.status === 'LATE'
                                ? '#fef3c7'
                                : r.status === 'HALF_DAY'
                                ? '#f3e8ff'
                                : '#fee2e2',
                            color:
                              r.status === 'PRESENT'
                                ? '#166534'
                                : r.status === 'LATE'
                                ? '#92400e'
                                : r.status === 'HALF_DAY'
                                ? '#7e22ce'
                                : '#991b1b',
                          }}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Regularization Tab */}
      {activeTab === 'regularization' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--tm-navy)' }}>
              Missed Punch & Correction Requests
            </span>
            <button
              onClick={() => setShowRegModal(true)}
              style={{
                padding: '6px 14px',
                backgroundColor: 'var(--tm-navy)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + New Correction
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Employee</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Requested In / Out</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Reason</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Reviewed By</th>
              </tr>
            </thead>
            <tbody>
              {regularizations.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                    No regularization requests filed.
                  </td>
                </tr>
              ) : (
                regularizations.map((reg) => (
                  <tr key={reg.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--tm-navy)' }}>
                      {new Date(reg.workDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {reg.employee ? `${reg.employee.firstName} ${reg.employee.lastName}` : 'Self'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {new Date(reg.requestedClockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(reg.requestedClockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#475569' }}>{reg.reason}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor:
                            reg.status === 'APPROVED' ? '#dcfce7' : reg.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                          color:
                            reg.status === 'APPROVED' ? '#166534' : reg.status === 'REJECTED' ? '#991b1b' : '#92400e',
                        }}
                      >
                        {reg.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '12px' }}>
                      {reg.reviewedAt ? new Date(reg.reviewedAt).toLocaleDateString('en-IN') : 'Pending Supervisor'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Regularization Modal */}
      {showRegModal && (
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
              width: '480px',
              maxWidth: '90vw',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--tm-navy)', margin: 0 }}>
                Attendance Regularization
              </h2>
              <button
                onClick={() => setShowRegModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleRegularizationSubmit} style={{ padding: '24px' }}>
              {submitError && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                  {submitError}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  DATE OF INCIDENT / MISSED PUNCH
                </label>
                <input
                  type="date"
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    CORRECT IN TIME
                  </label>
                  <input
                    type="time"
                    value={regClockIn}
                    onChange={(e) => setRegClockIn(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    CORRECT OUT TIME
                  </label>
                  <input
                    type="time"
                    value={regClockOut}
                    onChange={(e) => setRegClockOut(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  REASON FOR REGULARIZATION
                </label>
                <textarea
                  rows={3}
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  placeholder="e.g. Biometric scanner offline, on-site client meeting at Cyber Towers..."
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  style={{ padding: '10px 16px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 18px', backgroundColor: 'var(--tm-navy)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
