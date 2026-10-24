'use client';

import React, { useEffect, useState } from 'react';
import {
  hrmsClient,
  type ClaimCategory,
  type ExpenseClaim,
  type Employee,
} from '@/lib/hrms-client';

export default function ClaimsPage() {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [categories, setCategories] = useState<ClaimCategory[]>([]);
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my_claims' | 'categories'>('my_claims');

  // Submit Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [merchant, setMerchant] = useState('');
  const [itemRemarks, setItemRemarks] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [emp, catRes, claimRes] = await Promise.all([
        hrmsClient.getMyProfile().catch(() => null),
        hrmsClient.getClaimCategories().catch(() => ({ data: [] })),
        hrmsClient.getClaims().catch(() => ({ data: [] })),
      ]);

      setProfile(emp);
      const cats = catRes.data || [];
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
      setClaims(claimRes.data || []);
    } catch (err: any) {
      console.error('Failed to load expense claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    setSubmitting(true);

    try {
      await hrmsClient.createClaim({
        title,
        description,
        items: [
          {
            categoryId,
            amount: Number(amount),
            expenseDate: new Date(expenseDate).toISOString(),
            merchant,
            remarks: itemRemarks,
            receiptUrl: receiptUrl || undefined,
          },
        ],
      });

      setSubmitSuccess('Expense claim submitted successfully for manager approval and Finance ERP handoff.');
      setTitle('');
      setDescription('');
      setAmount(0);
      setMerchant('');
      setItemRemarks('');
      setReceiptUrl('');
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit expense claim');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewClaim = async (claimId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`Are you sure you want to mark this claim as ${status}?`)) return;
    try {
      await hrmsClient.reviewClaim(claimId, {
        status,
        remarks: `Processed via HRMS Claim Engine on ${new Date().toLocaleDateString('en-IN')}`,
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const totalClaimAmount = claims.reduce((acc, c) => acc + c.totalAmount, 0);
  const pendingAmount = claims.filter((c) => c.status === 'SUBMITTED').reduce((acc, c) => acc + c.totalAmount, 0);
  const approvedAmount = claims.filter((c) => c.status === 'APPROVED' || c.status === 'SETTLED').reduce((acc, c) => acc + c.totalAmount, 0);

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Title & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--tm-navy)', margin: '0 0 6px 0' }}>
            e-Claim Reimbursements & Finance Handoff
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Hr.my-style expense claim filing, itemized receipts, multi-tier approvals, and Finance ERP integration boundary.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
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
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>receipt_long</span>
          New Expense Claim
        </button>
      </div>

      {submitSuccess && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
          ✓ {submitSuccess}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Claims Filed</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--tm-navy)', marginTop: '8px' }}>{claims.length}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Lifetime reimbursement records</div>
        </div>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Amount</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--tm-navy)', marginTop: '8px' }}>₹{totalClaimAmount.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Gross claimed expenses</div>
        </div>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Pending Approvals</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#f59e0b', marginTop: '8px' }}>₹{pendingAmount.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Awaiting supervisor sign-off</div>
        </div>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Approved for Finance</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#16a34a', marginTop: '8px' }}>₹{approvedAmount.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>Finance ERP disburse ready</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('my_claims')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'my_claims' ? '2px solid var(--tm-navy)' : '2px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'my_claims' ? 600 : 500,
            color: activeTab === 'my_claims' ? 'var(--tm-navy)' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Claim Records ({claims.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'categories' ? '2px solid var(--tm-navy)' : '2px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'categories' ? 600 : 500,
            color: activeTab === 'categories' ? 'var(--tm-navy)' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Expense Categories & Policy
        </button>
      </div>

      {/* Claims Table */}
      {activeTab === 'my_claims' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--tm-navy)' }}>
              Expense Claims Log
            </span>
            <span style={{ fontSize: '12px', color: '#1d4ed8', backgroundColor: '#dbeafe', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
              Finance ERP Handoff Ready
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Claim Ref & Title</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Employee</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Submitted Date</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Items / Merchant</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                    No expense claims recorded. Click "New Expense Claim" to submit.
                  </td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--tm-navy)' }}>{claim.claimNumber}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{claim.title}</div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 500 }}>{claim.employee ? `${claim.employee.firstName} ${claim.employee.lastName}` : (profile ? `${profile.firstName} ${profile.lastName}` : 'Self')}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{claim.employee?.employeeCode || profile?.employeeCode}</div>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748b' }}>
                      {new Date(claim.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {claim.items && claim.items.length > 0 ? (
                        <div>
                          <span style={{ fontWeight: 500 }}>{claim.items[0].merchant || claim.items[0].category?.name}</span>
                          {claim.items[0].receiptUrl && (
                            <a
                              href={claim.items[0].receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ marginLeft: '6px', fontSize: '11px', color: '#2563eb', textDecoration: 'underline' }}
                            >
                              [Receipt]
                            </a>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>1 Item</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--tm-navy)' }}>
                      ₹{claim.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor:
                            claim.status === 'APPROVED' || claim.status === 'SETTLED'
                              ? '#dcfce7'
                              : claim.status === 'REJECTED'
                              ? '#fee2e2'
                              : '#fef3c7',
                          color:
                            claim.status === 'APPROVED' || claim.status === 'SETTLED'
                              ? '#166534'
                              : claim.status === 'REJECTED'
                              ? '#991b1b'
                              : '#92400e',
                        }}
                      >
                        {claim.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {claim.status === 'SUBMITTED' && (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleReviewClaim(claim.id, 'APPROVED')}
                            style={{ padding: '4px 8px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewClaim(claim.id, 'REJECTED')}
                            style={{ padding: '4px 8px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--tm-navy)', margin: '0 0 16px 0' }}>
            Authorized Expense Categories (Finance Integration Spec)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {categories.map((c) => (
              <div key={c.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, color: 'var(--tm-navy)' }}>{c.name}</div>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#f1f5f9' }}>{c.code}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', margin: '8px 0' }}>
                  {c.description || 'Standard business expense eligible for reimbursement.'}
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  Max Limit: <strong>{c.maxLimit ? `₹${c.maxLimit.toLocaleString('en-IN')}` : 'No Capping'}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Claim Modal */}
      {showModal && (
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
              width: '540px',
              maxWidth: '90vw',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--tm-navy)', margin: 0 }}>
                File Expense Claim
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleClaimSubmit} style={{ padding: '24px' }}>
              {submitError && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                  {submitError}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  CLAIM TITLE / BUSINESS PURPOSE *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Client visit travel expenses, Hyderabad to Bengaluru"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    CATEGORY *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    CLAIM AMOUNT (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="e.g. 3500"
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    EXPENSE DATE *
                  </label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    VENDOR / MERCHANT
                  </label>
                  <input
                    type="text"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="e.g. IndiGo Airlines, Uber, Taj Hotel"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  RECEIPT DOCUMENT URL (PDF / JPG / PNG)
                </label>
                <input
                  type="url"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or internal doc link"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  DESCRIPTION & BUSINESS JUSTIFICATION
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional remarks for supervisor and finance audit..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 16px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '10px 18px', backgroundColor: 'var(--tm-navy)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                >
                  {submitting ? 'Submitting...' : 'Submit For Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
