'use client';

import React, { useEffect, useState } from 'react';
import {
  hrmsClient,
  type Department,
  type Branch,
  type Designation,
  type LeaveType,
} from '@/lib/hrms-client';

export default function SettingsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'org' | 'statutory' | 'sso'>('org');

  useEffect(() => {
    Promise.all([
      hrmsClient.getDepartments().catch(() => [] as any[]),
      hrmsClient.getBranches().catch(() => [] as any[]),
      hrmsClient.getDesignations().catch(() => [] as any[]),
      hrmsClient.getLeaveTypes().catch(() => [] as any[]),
    ])
      .then(([depRes, brRes, desRes, ltRes]) => {
        setDepartments(Array.isArray(depRes) ? depRes : (depRes as any)?.data || []);
        setBranches(Array.isArray(brRes) ? brRes : (brRes as any)?.data || []);
        setDesignations(Array.isArray(desRes) ? desRes : (desRes as any)?.data || []);
        setLeaveTypes(Array.isArray(ltRes) ? ltRes : (ltRes as any)?.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--tm-navy)', margin: '0 0 6px 0' }}>
            HR Settings & System Administration
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Master organizational configuration, branches, designations, Indian statutory rules, and SSO client metadata.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('org')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'org' ? '2px solid var(--tm-navy)' : '2px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'org' ? 600 : 500,
            color: activeTab === 'org' ? 'var(--tm-navy)' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Organization Master Data
        </button>
        <button
          onClick={() => setActiveTab('statutory')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'statutory' ? '2px solid var(--tm-navy)' : '2px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'statutory' ? 600 : 500,
            color: activeTab === 'statutory' ? 'var(--tm-navy)' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Indian Statutory Parameters
        </button>
        <button
          onClick={() => setActiveTab('sso')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'sso' ? '2px solid var(--tm-navy)' : '2px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'sso' ? 600 : 500,
            color: activeTab === 'sso' ? 'var(--tm-navy)' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          SSO & OIDC PKCE Boundary
        </button>
      </div>

      {/* Tab: Organization Master Data */}
      {activeTab === 'org' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {/* Departments */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--tm-navy)', margin: '0 0 12px 0' }}>
              Departments ({departments.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {departments.map((d) => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '13px' }}>
                  <span style={{ fontWeight: 500 }}>{d.name}</span>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>{d.code}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Branches */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--tm-navy)', margin: '0 0 12px 0' }}>
              Branches & Locations ({branches.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {branches.map((b) => (
                <div key={b.id} style={{ display: 'flex', flexDirection: 'column', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '13px' }}>
                  <span style={{ fontWeight: 500 }}>{b.name}</span>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>{b.city}, {b.state}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Designations */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--tm-navy)', margin: '0 0 12px 0' }}>
              Designations ({designations.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {designations.map((des) => (
                <div key={des.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '13px' }}>
                  <span style={{ fontWeight: 500 }}>{des.title}</span>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>L{des.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Indian Statutory Parameters */}
      {activeTab === 'statutory' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--tm-navy)', margin: '0 0 16px 0' }}>
            Statutory Payroll Compliance Engine (India)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Rule / Component</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Governing Regulation</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Configured Threshold / Rate</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Enforcement Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>Employees' Provident Fund (EPF)</td>
                <td style={{ padding: '12px 16px' }}>Employees' Provident Funds Act, 1952</td>
                <td style={{ padding: '12px 16px' }}>12% of Basic, Capped at ₹1,800/mo (₹15,000 basic ceiling)</td>
                <td style={{ padding: '12px 16px', color: '#16a34a', fontWeight: 600 }}>✓ Active</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>Professional Tax (PT)</td>
                <td style={{ padding: '12px 16px' }}>State Tax on Professions, Trades & Callings</td>
                <td style={{ padding: '12px 16px' }}>₹200 / month (Standard Indian slab)</td>
                <td style={{ padding: '12px 16px', color: '#16a34a', fontWeight: 600 }}>✓ Active</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>Employee State Insurance (ESI)</td>
                <td style={{ padding: '12px 16px' }}>Employees' State Insurance Act, 1948</td>
                <td style={{ padding: '12px 16px' }}>0.75% of Gross if Monthly Gross &le; ₹21,000</td>
                <td style={{ padding: '12px 16px', color: '#16a34a', fontWeight: 600 }}>✓ Active</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>TDS Withholding</td>
                <td style={{ padding: '12px 16px' }}>Income Tax Act, 1961 Section 192</td>
                <td style={{ padding: '12px 16px' }}>Computed via standard deduction slab & declarations</td>
                <td style={{ padding: '12px 16px', color: '#16a34a', fontWeight: 600 }}>✓ Active</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: SSO Boundary */}
      {activeTab === 'sso' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--tm-navy)', margin: '0 0 16px 0' }}>
            Future Central SSO & OIDC PKCE Integration
          </h3>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px 0' }}>
            Configuration parameters for the OIDC Authorization Code Flow with PKCE (`code_challenge` / `code_verifier`).
          </p>

          <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px', fontSize: '13px', fontFamily: 'monospace', color: '#334155', lineHeight: 1.8 }}>
            <div><strong>Client ID:</strong> hrms-production-client</div>
            <div><strong>Redirect URI:</strong> https://techm4india.com/hrms/auth/callback</div>
            <div><strong>Allowed Grant Types:</strong> authorization_code, refresh_token</div>
            <div><strong>Code Challenge Method:</strong> S256</div>
            <div><strong>Required Scopes:</strong> openid profile email hrms:access</div>
            <div><strong>Token Endpoint:</strong> /api/v1/auth/token</div>
          </div>
        </div>
      )}
    </div>
  );
}
