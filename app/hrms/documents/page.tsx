'use client';

import React, { useState } from 'react';

interface DocItem {
  id: string;
  title: string;
  category: 'POLICY' | 'TAX' | 'LEGAL' | 'ONBOARDING';
  uploadedAt: string;
  size: string;
  url: string;
}

const mockCompanyDocs: DocItem[] = [
  { id: '1', title: 'TechM4India Code of Conduct & Ethics 2026', category: 'POLICY', uploadedAt: '2026-01-10', size: '2.4 MB', url: '#' },
  { id: '2', title: 'Employee Handbook & Leave Guidelines', category: 'POLICY', uploadedAt: '2026-01-15', size: '1.8 MB', url: '#' },
  { id: '3', title: 'Form 12BB — Investment Declaration Template (FY 2026-27)', category: 'TAX', uploadedAt: '2026-04-01', size: '420 KB', url: '#' },
  { id: '4', title: 'Group Health Insurance Policy Coverage Schedule', category: 'POLICY', uploadedAt: '2026-02-01', size: '3.1 MB', url: '#' },
  { id: '5', title: 'Information Security & Data Protection Standard', category: 'LEGAL', uploadedAt: '2026-01-20', size: '1.1 MB', url: '#' },
];

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'credentials'>('company');

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--tm-navy)', margin: '0 0 6px 0' }}>
            Corporate Documents & Credentials
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Central repository for company policies, Form 12BB tax declarations, credential tracking, and HR alerts.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('company')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'company' ? '2px solid var(--tm-navy)' : '2px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'company' ? 600 : 500,
            color: activeTab === 'company' ? 'var(--tm-navy)' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Company Policies & Forms
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'credentials' ? '2px solid var(--tm-navy)' : '2px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'credentials' ? 600 : 500,
            color: activeTab === 'credentials' ? 'var(--tm-navy)' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Credential & License Expiry Tracker
        </button>
      </div>

      {activeTab === 'company' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--tm-navy)' }}>
              Official TechM4India Documentation
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Document Title</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Date Published</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>File Size</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockCompanyDocs.map((doc) => (
                <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--tm-navy)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="material-symbols-outlined" style={{ color: '#dc2626', fontSize: '20px' }}>picture_as_pdf</span>
                      {doc.title}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontSize: '11px', fontWeight: 600 }}>
                      {doc.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>
                    {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{doc.size}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => alert(`Downloading ${doc.title}...`)}
                      style={{ padding: '6px 12px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'var(--tm-navy)' }}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'credentials' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--tm-navy)', margin: '0 0 16px 0' }}>
            Credential Expiry & Compliance Alerts
          </h3>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px 0' }}>
            Hr.my-aligned tracking for passports, visas, AWS certifications, and statutory driving licenses.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>PASSPORT VALIDITY</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--tm-navy)', marginTop: '4px' }}>Expires: 14 Aug 2031</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Status: Compliant (Active)</div>
            </div>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>AWS CERTIFIED ARCHITECT</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--tm-navy)', marginTop: '4px' }}>Expires: 20 Nov 2027</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Status: Verified by HR</div>
            </div>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>MEDICAL HEALTH CHECKUP</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--tm-navy)', marginTop: '4px' }}>Due: 30 Dec 2026</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Status: Annual reminder scheduled</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
