'use client';

import React, { useEffect, useState } from 'react';
import { hrmsClient, type HeadcountReport } from '@/lib/hrms-client';

export default function ReportsPage() {
  const [report, setReport] = useState<HeadcountReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hrmsClient
      .getHeadcountReport()
      .then((res) => setReport(res.data))
      .catch((err) => console.error('Failed to load headcount report:', err))
      .finally(() => setLoading(false));
  }, []);

  const downloadHeadcountCsv = () => {
    if (!report) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Category,Name,Active Headcount\n';

    report.byDepartment.forEach((d) => {
      csvContent += `Department,"${d.name}",${d.count}\n`;
    });
    report.byBranch.forEach((b) => {
      csvContent += `Branch,"${b.name}",${b.count}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TechM4India_Headcount_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--tm-navy)', margin: '0 0 6px 0' }}>
            HR Analytics & Compliance Reports
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Hr.my-compatible headcount breakdown, department census, branch distribution, and one-click CSV export.
          </p>
        </div>

        <button
          onClick={downloadHeadcountCsv}
          style={{
            padding: '10px 18px',
            backgroundColor: '#16a34a',
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
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
          Export Headcount (CSV)
        </button>
      </div>

      {/* Top Level Metric */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Total Active Headcount
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--tm-navy)', marginTop: '8px' }}>
            {report?.totalEmployees || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '6px' }}>Across all operating units</div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Operating Departments
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--tm-navy)', marginTop: '8px' }}>
            {report?.byDepartment.length || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Engineering, Product, Operations & more</div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Office Branches
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--tm-navy)', marginTop: '8px' }}>
            {report?.byBranch.length || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Hyderabad HQ, Bengaluru R&D, Mumbai</div>
        </div>
      </div>

      {/* Distribution Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Department Breakdown */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, fontSize: '14px', color: 'var(--tm-navy)' }}>
            Headcount by Department
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Department</th>
                <th style={{ padding: '10px 16px', fontWeight: 600, textAlign: 'right' }}>Active Headcount</th>
              </tr>
            </thead>
            <tbody>
              {report?.byDepartment.map((d) => (
                <tr key={d.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{d.name}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--tm-navy)' }}>
                    {d.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Branch Breakdown */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, fontSize: '14px', color: 'var(--tm-navy)' }}>
            Headcount by Branch / Location
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Branch Location</th>
                <th style={{ padding: '10px 16px', fontWeight: 600, textAlign: 'right' }}>Active Headcount</th>
              </tr>
            </thead>
            <tbody>
              {report?.byBranch.map((b) => (
                <tr key={b.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{b.name}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--tm-navy)' }}>
                    {b.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
