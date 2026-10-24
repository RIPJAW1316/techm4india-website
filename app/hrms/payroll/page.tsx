'use client';

import React, { useEffect, useState } from 'react';
import {
  hrmsClient,
  type SalaryStructure,
  type Payslip,
  type Employee,
} from '@/lib/hrms-client';

export default function PayrollPage() {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [structure, setStructure] = useState<SalaryStructure | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'payslips' | 'structure' | 'calculator'>('payslips');

  // Selected Payslip for View / Print Modal
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  // Pay Run State
  const [payRunMonth, setPayRunMonth] = useState('2026-10');
  const [payRunLoading, setPayRunLoading] = useState(false);
  const [payRunMessage, setPayRunMessage] = useState('');

  // Interactive Indian CTC Calculator
  const [calcCtc, setCalcCtc] = useState<number>(1200000);

  const loadData = async () => {
    try {
      setLoading(true);
      const [emp, payslipRes] = await Promise.all([
        hrmsClient.getMyProfile().catch(() => null),
        hrmsClient.getPayslips().catch(() => ({ data: [] })),
      ]);

      setProfile(emp);
      const slips = payslipRes.data || [];
      setPayslips(slips);

      if (emp?.id) {
        const struct = await hrmsClient.getSalaryStructure(emp.id).catch(() => null);
        setStructure(struct);
      }
    } catch (err: any) {
      console.error('Failed to load payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGeneratePayRun = async () => {
    if (!confirm(`Generate Indian Statutory Pay Run for ${payRunMonth}?`)) return;
    setPayRunLoading(true);
    setPayRunMessage('');

    try {
      const [year, month] = payRunMonth.split('-').map(Number);
      const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString();
      const lastDay = new Date(Date.UTC(year, month, 0)).getDate();
      const endDate = new Date(Date.UTC(year, month - 1, lastDay)).toISOString();
      const payDate = new Date(Date.UTC(year, month - 1, 28)).toISOString();

      const res = await hrmsClient.generatePayRun({
        month,
        year,
        startDate,
        endDate,
        payDate,
      });

      setPayRunMessage(`✓ Pay run completed! Generated ${res.data.payslipsCount} payslips for period ${res.data.periodName}.`);
      await loadData();
    } catch (err: any) {
      setPayRunMessage(`Error: ${err.message || 'Failed to process pay run'}`);
    } finally {
      setPayRunLoading(false);
    }
  };

  // Indian statutory calculator helper
  const annualCtc = calcCtc || 0;
  const monthlyGross = Math.round(annualCtc / 12);
  const calcBasic = Math.round(monthlyGross * 0.50);
  const calcHra = Math.round(monthlyGross * 0.25);
  const calcSpecial = Math.round(monthlyGross * 0.25);
  // PF: 12% of basic or ₹1,800 ceiling
  const calcPf = Math.min(Math.round(calcBasic * 0.12), 1800);
  // PT: ₹200 (standard Indian professional tax slab)
  const calcPt = 200;
  // ESI: 0.75% of gross if monthly gross <= 21000
  const calcEsi = monthlyGross <= 21000 ? Math.round(monthlyGross * 0.0075) : 0;
  // Estimated TDS (simplified standard deduction slab)
  const taxableAnnual = Math.max(0, annualCtc - 75000);
  const calcTdsMonthly = annualCtc > 700000 ? Math.round((taxableAnnual * 0.10) / 12) : 0;
  const calcTotalDeductions = calcPf + calcPt + calcEsi + calcTdsMonthly;
  const calcNetPay = monthlyGross - calcTotalDeductions;

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Title & Pay Run Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--tm-navy)', margin: '0 0 6px 0' }}>
            Payroll & Indian Statutory Compliance
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            PF (12% capped at ₹1,800), Professional Tax (₹200), ESI (0.75%), TDS withholding, and itemized payslips.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="month"
            value={payRunMonth}
            onChange={(e) => setPayRunMonth(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
          <button
            onClick={handleGeneratePayRun}
            disabled={payRunLoading}
            style={{
              padding: '9px 16px',
              backgroundColor: 'var(--tm-navy)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: payRunLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payments</span>
            {payRunLoading ? 'Processing...' : 'Run Monthly Payroll'}
          </button>
        </div>
      </div>

      {payRunMessage && (
        <div
          style={{
            backgroundColor: payRunMessage.startsWith('✓') ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${payRunMessage.startsWith('✓') ? '#a7f3d0' : '#fecaca'}`,
            color: payRunMessage.startsWith('✓') ? '#065f46' : '#991b1b',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px',
          }}
        >
          {payRunMessage}
        </div>
      )}

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>PF Statutory Cap</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--tm-navy)', marginTop: '8px' }}>₹1,800 / mo</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>12% of basic (₹15,000 ceiling)</div>
        </div>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Professional Tax</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--tm-navy)', marginTop: '8px' }}>₹200 / mo</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Standard State PT Slab</div>
        </div>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>ESI Threshold</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--tm-navy)', marginTop: '8px' }}>₹21,000 / mo</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>0.75% employee contribution</div>
        </div>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Generated Payslips</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', marginTop: '8px' }}>{payslips.length}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Ready for download/audit</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('payslips')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'payslips' ? '2px solid var(--tm-navy)' : '2px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'payslips' ? 600 : 500,
            color: activeTab === 'payslips' ? 'var(--tm-navy)' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Payslips & History ({payslips.length})
        </button>
        <button
          onClick={() => setActiveTab('structure')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'structure' ? '2px solid var(--tm-navy)' : '2px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'structure' ? 600 : 500,
            color: activeTab === 'structure' ? 'var(--tm-navy)' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          My Salary Structure
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'calculator' ? '2px solid var(--tm-navy)' : '2px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'calculator' ? 600 : 500,
            color: activeTab === 'calculator' ? 'var(--tm-navy)' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Indian Statutory CTC Simulator
        </button>
      </div>

      {/* Tab: Payslips List */}
      {activeTab === 'payslips' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--tm-navy)' }}>
              Monthly Payslip Statements
            </span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Compliant with Section 10 & EPFO norms
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Period</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Employee</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Gross Pay</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>PF Deduction</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Prof. Tax</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Total Deductions</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Net Take-Home</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payslips.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                    No payslips found. Run a monthly payroll above to generate official slips.
                  </td>
                </tr>
              ) : (
                payslips.map((ps) => (
                  <tr key={ps.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--tm-navy)' }}>
                      {ps.period?.name || 'Monthly Pay'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 600 }}>{ps.employee ? `${ps.employee.firstName} ${ps.employee.lastName}` : (profile ? `${profile.firstName} ${profile.lastName}` : 'Employee')}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{ps.employee?.employeeCode || profile?.employeeCode}</div>
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 600 }}>
                      ₹{ps.grossEarnings.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#e11d48' }}>
                      ₹{ps.pfEmployee.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#e11d48' }}>
                      ₹{ps.professionalTax.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#e11d48', fontWeight: 600 }}>
                      ₹{ps.totalDeductions.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#16a34a' }}>
                      ₹{ps.netSalary.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedPayslip(ps)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f1f5f9',
                          color: 'var(--tm-navy)',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        View Payslip
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: My Salary Structure */}
      {activeTab === 'structure' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--tm-navy)', margin: '0 0 16px 0' }}>
            Current CTC Compensation Breakdown
          </h3>
          {structure ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr', gap: '32px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  Earnings (Monthly)
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ color: '#64748b' }}>Basic Salary (50%)</span>
                  <span style={{ fontWeight: 600 }}>₹{structure.basicMonthly.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ color: '#64748b' }}>House Rent Allowance (HRA 25%)</span>
                  <span style={{ fontWeight: 600 }}>₹{structure.hraMonthly.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ color: '#64748b' }}>Special / Flexibility Allowance</span>
                  <span style={{ fontWeight: 600 }}>₹{structure.specialAllowanceMonthly.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #e2e8f0', fontWeight: 700, color: 'var(--tm-navy)' }}>
                  <span>Gross Monthly Salary</span>
                  <span>₹{structure.grossMonthly.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  Statutory Deductions (Monthly)
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ color: '#64748b' }}>Provident Fund (PF 12% max ₹1,800)</span>
                  <span style={{ fontWeight: 600, color: '#e11d48' }}>-₹{structure.pfEmployeeMonthly.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ color: '#64748b' }}>Professional Tax (PT)</span>
                  <span style={{ fontWeight: 600, color: '#e11d48' }}>-₹{structure.ptMonthly.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ color: '#64748b' }}>ESI Contribution (0.75% if &le; ₹21k)</span>
                  <span style={{ fontWeight: 600, color: '#e11d48' }}>-₹{structure.esiEmployeeMonthly.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #e2e8f0', fontWeight: 700, color: '#16a34a' }}>
                  <span>Estimated Net Pay / Month</span>
                  <span>
                    ₹{(
                      structure.grossMonthly -
                      structure.pfEmployeeMonthly -
                      structure.ptMonthly -
                      structure.esiEmployeeMonthly
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
              No custom salary structure configured for current user profile. Default enterprise grading applied.
            </div>
          )}
        </div>
      )}

      {/* Tab: Indian Statutory CTC Simulator */}
      {activeTab === 'calculator' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--tm-navy)', margin: '0 0 16px 0' }}>
            TechM4India Statutory CTC Breakdown Calculator
          </h3>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px 0' }}>
            Simulate take-home salary across Indian tax brackets with mandatory EPF ceiling and state professional tax rules.
          </p>

          <div style={{ marginBottom: '24px', maxWidth: '400px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              ANNUAL COST TO COMPANY (CTC) IN ₹
            </label>
            <input
              type="number"
              step={50000}
              value={calcCtc}
              onChange={(e) => setCalcCtc(Number(e.target.value))}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 600 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>MONTHLY GROSS</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--tm-navy)', marginTop: '4px' }}>
                ₹{monthlyGross.toLocaleString('en-IN')}
              </div>
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
                <div>Basic (50%): ₹{calcBasic.toLocaleString('en-IN')}</div>
                <div>HRA (25%): ₹{calcHra.toLocaleString('en-IN')}</div>
                <div>Special (25%): ₹{calcSpecial.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>STATUTORY DEDUCTIONS</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#e11d48', marginTop: '4px' }}>
                ₹{calcTotalDeductions.toLocaleString('en-IN')}
              </div>
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
                <div>EPF: ₹{calcPf.toLocaleString('en-IN')} (capped)</div>
                <div>Prof. Tax: ₹{calcPt.toLocaleString('en-IN')}</div>
                <div>ESI: ₹{calcEsi.toLocaleString('en-IN')}</div>
                <div>TDS (Est.): ₹{calcTdsMonthly.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', backgroundColor: '#f0fdf4' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#166534' }}>MONTHLY TAKE-HOME (NET)</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', marginTop: '4px' }}>
                ₹{calcNetPay.toLocaleString('en-IN')}
              </div>
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#166534', lineHeight: 1.6 }}>
                <div>Annual Take-Home: ₹{(calcNetPay * 12).toLocaleString('en-IN')}</div>
                <div>Direct Bank Credit on 28th of every month</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Payslip Modal */}
      {selectedPayslip && (
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
              width: '640px',
              maxWidth: '92vw',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Payslip Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--tm-navy)' }}>
                  TechM4India Innovations Pvt. Ltd.
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Payslip for {selectedPayslip.period?.name || 'Current Month'}
                </div>
              </div>
              <button
                onClick={() => setSelectedPayslip(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Payslip Body */}
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              {/* Employee Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Employee Name:</span>{' '}
                  <strong>{selectedPayslip.employee ? `${selectedPayslip.employee.firstName} ${selectedPayslip.employee.lastName}` : 'Self'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Employee Code:</span>{' '}
                  <strong>{selectedPayslip.employee?.employeeCode || 'TM4I-EMP'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>PAN Number:</span>{' '}
                  <strong>{selectedPayslip.employee?.panNumber || 'ABCDE1234F'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>PF UAN:</span>{' '}
                  <strong>{selectedPayslip.employee?.pfUan || '101234567890'}</strong>
                </div>
              </div>

              {/* Table of Earnings vs Deductions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--tm-navy)', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                    EARNINGS
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                    <span>Basic Salary</span>
                    <span>₹{selectedPayslip.basicSalary.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                    <span>HRA</span>
                    <span>₹{selectedPayslip.hra.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                    <span>Special Allowance</span>
                    <span>₹{selectedPayslip.specialAllowance.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '8px' }}>
                    <span>Gross Earnings</span>
                    <span>₹{selectedPayslip.grossEarnings.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--tm-navy)', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                    DEDUCTIONS
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                    <span>PF (EPF 12%)</span>
                    <span>₹{selectedPayslip.pfEmployee.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                    <span>Professional Tax</span>
                    <span>₹{selectedPayslip.professionalTax.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                    <span>ESI Contribution</span>
                    <span>₹{selectedPayslip.esiEmployee.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                    <span>TDS Withholding</span>
                    <span>₹{selectedPayslip.tdsWithholding.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '8px', color: '#e11d48' }}>
                    <span>Total Deductions</span>
                    <span>₹{selectedPayslip.totalDeductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay Highlight */}
              <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>NET TAKE-HOME SALARY</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Disbursed via Direct Bank Transfer</div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a' }}>
                  ₹{selectedPayslip.netSalary.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => window.print()}
                style={{ padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => setSelectedPayslip(null)}
                style={{ padding: '8px 16px', backgroundColor: 'var(--tm-navy)', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
