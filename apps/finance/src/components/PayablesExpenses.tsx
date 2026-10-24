'use client';

import React, { useState } from 'react';
import {
  Building,
  CheckCircle,
  Clock,
  CreditCard,
  FileCheck,
  Filter,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  UserCheck,
  Landmark,
  ArrowRight,
  SendHorizontal,
  ExternalLink,
} from 'lucide-react';
import { DivisionCode, ExpenseItem, TdsSection, VendorItem, HrmsClaimItem } from '../types';

interface PayablesExpensesProps {
  expenses: ExpenseItem[];
  vendors: VendorItem[];
  hrmsClaims?: HrmsClaimItem[];
  onCreateExpense: (exp: any) => void;
  onApproveExpense: (id: string) => void;
  onPayExpense: (id: string) => void;
  onCreateVendor?: (vendor: any) => void;
  onSettleHrmsClaim?: (claimId: string, notes?: string) => Promise<void> | void;
}

export const PayablesExpenses: React.FC<PayablesExpensesProps> = ({
  expenses,
  vendors,
  hrmsClaims = [],
  onCreateExpense,
  onApproveExpense,
  onPayExpense,
  onCreateVendor,
  onSettleHrmsClaim,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bills' | 'vendors' | 'hrms_claims'>('bills');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterDivision, setFilterDivision] = useState<string>('ALL');
  const [settlingClaimId, setSettlingClaimId] = useState<string | null>(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [customVendorName, setCustomVendorName] = useState('');

  // Vendor Master Form State
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorContact, setNewVendorContact] = useState('');
  const [newVendorGstin, setNewVendorGstin] = useState('');
  const [newVendorPan, setNewVendorPan] = useState('');
  const [newVendorMsme, setNewVendorMsme] = useState<'MICRO' | 'SMALL' | 'MEDIUM' | 'NONE'>('MICRO');
  const [newVendorBankName, setNewVendorBankName] = useState('');
  const [newVendorAccount, setNewVendorAccount] = useState('');
  const [newVendorIfsc, setNewVendorIfsc] = useState('');
  const [newVendorTds, setNewVendorTds] = useState<TdsSection>('SEC_194C');
  const [newVendorTerms, setNewVendorTerms] = useState(30);

  // Form State
  const [vendorId, setVendorId] = useState(vendors[0]?.id || '');
  const [category, setCategory] = useState('INFRASTRUCTURE');
  const [division, setDivision] = useState<DivisionCode>('TECHM4_SOLUTIONS');
  const [description, setDescription] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [grossAmount, setGrossAmount] = useState<number>(0);
  const [tdsSection, setTdsSection] = useState<TdsSection>('SEC_194C');
  const [tdsRate, setTdsRate] = useState<number>(2.0);
  const [poNumber, setPoNumber] = useState('');

  // Real-time TDS calculation
  const tdsAmount = Number(((grossAmount * tdsRate) / 100).toFixed(2));
  const netPayable = Number((grossAmount - tdsAmount).toFixed(2));

  // Threshold approval tier preview
  const approvalTier =
    grossAmount > 100000
      ? 'Level 3 (CFO / Founder)'
      : grossAmount >= 25000
      ? 'Level 2 (Dept Head)'
      : 'Level 1 (Team Lead)';

  const handleTdsSectionChange = (sec: TdsSection) => {
    setTdsSection(sec);
    if (sec === 'SEC_194C') setTdsRate(2.0);
    else if (sec === 'SEC_194J_TECH') setTdsRate(2.0);
    else if (sec === 'SEC_194J_PROF') setTdsRate(10.0);
    else if (sec === 'SEC_194H') setTdsRate(5.0);
    else setTdsRate(0);
  };

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName) return;

    const vendorCode = `VND-${String(vendors.length + 1).padStart(3, '0')}`;
    const newVendor: VendorItem = {
      id: `v-${Date.now()}`,
      code: vendorCode,
      name: newVendorName,
      contactPerson: newVendorContact || undefined,
      gstin: newVendorGstin || undefined,
      pan: newVendorPan || 'PAN_NOT_PROVIDED',
      msmeType: newVendorMsme,
      bankAccount: newVendorAccount || '',
      ifsc: newVendorIfsc || '',
      bankName: newVendorBankName || '',
      tdsSection: newVendorTds,
      paymentTermsDays: Number(newVendorTerms) || 30,
    };

    if (onCreateVendor) {
      onCreateVendor(newVendor);
    }
    setVendorId(newVendor.id);
    setIsVendorModalOpen(false);
    setNewVendorName('');
    setNewVendorContact('');
    setNewVendorGstin('');
    setNewVendorPan('');
    setNewVendorBankName('');
    setNewVendorAccount('');
    setNewVendorIfsc('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || grossAmount <= 0) return;

    const vendor = vendors.find((v) => v.id === vendorId);
    const resolvedVendorName = vendor
      ? vendor.name
      : (customVendorName.trim() || 'Direct Expense Supplier');

    onCreateExpense({
      vendorId: vendor?.id || `v-manual-${Date.now()}`,
      vendorName: resolvedVendorName,
      category,
      division,
      description,
      invoiceNumber,
      dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      grossAmount,
      tdsSection,
      tdsRate,
      tdsAmount,
      netPayable,
      approvalLevel: grossAmount > 100000 ? 3 : grossAmount >= 25000 ? 2 : 1,
      poNumber: poNumber || undefined,
    });

    setIsModalOpen(false);
    setDescription('');
    setInvoiceNumber('');
    setGrossAmount(0);
    setCustomVendorName('');
  };

  const handleSettleClaim = async (claimId: string) => {
    if (!onSettleHrmsClaim) return;
    setSettlingClaimId(claimId);
    try {
      await onSettleHrmsClaim(claimId, 'Disbursed via Corporate HDFC NEFT/RTGS Batch');
    } finally {
      setSettlingClaimId(null);
    }
  };

  const formatInr = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);

  const approvedClaimsCount = hrmsClaims.filter((c) => c.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e3ded5] pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSubTab('bills')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'bills'
                ? 'bg-[#1f2946] text-white'
                : 'text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9]'
            }`}
          >
            Vendor Bills &amp; Payables ({expenses.length})
          </button>
          <button
            onClick={() => setActiveSubTab('hrms_claims')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === 'hrms_claims'
                ? 'bg-[#1f2946] text-white'
                : 'text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9]'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            HRMS Employee Claims
            {approvedClaimsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#c62d37] text-white text-[10px] rounded-full font-bold">
                {approvedClaimsCount} pending
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('vendors')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'vendors'
                ? 'bg-[#1f2946] text-white'
                : 'text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9]'
            }`}
          >
            Vendor Master Directory ({vendors.length})
          </button>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#c62d37] hover:bg-[#a8222e] text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Record Vendor Bill
        </button>
      </div>

      {/* BILLS TAB */}
      {activeSubTab === 'bills' && (
        <div className="card-editorial bg-white overflow-hidden shadow-xs border border-[#e3ded5] rounded-xl">
          <div className="p-4 border-b border-[#e3ded5] flex items-center justify-between bg-[#fcfbf9]">
            <div className="text-sm font-bold text-[#1f2946] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#c62d37]" />
              Accounts Payable Register &amp; Statutory TDS Deductions
            </div>
            <span className="text-xs text-[#5a6376]">Section 194C / 194J with 3-Way Audit Verification</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-editorial">
              <thead>
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Bill #</th>
                  <th className="py-2.5 px-3 font-semibold">Vendor / Beneficiary</th>
                  <th className="py-2.5 px-3 font-semibold">Division</th>
                  <th className="py-2.5 px-3 font-semibold">3-Way Match</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Gross (₹)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">TDS (₹)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Net Payable</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Approval Tier</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebe7df]">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-[#5a6376]">
                      No vendor purchase bills recorded. Click &quot;Record Vendor Bill&quot; to book an invoice.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#faf9f5] transition">
                    <td className="py-3 px-3 font-mono font-bold text-[#1f2946]">{exp.expenseNumber}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#1f2946]">{exp.vendorName}</div>
                      <div className="text-[11px] text-[#5a6376] max-w-xs truncate">{exp.description}</div>
                    </td>
                    <td className="py-3 px-3 text-[#5a6376]">
                      {exp.division.replace('TECHM4_', '').replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3">
                      {exp.poNumber ? (
                        <span className="badge-tag badge-emerald text-[10px]">PO: {exp.poNumber}</span>
                      ) : (
                        <span className="badge-tag badge-muted text-[10px]">Direct Claim</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-[#1f2946]">
                      {formatInr(exp.grossAmount)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#be123c]">
                      {exp.tdsAmount > 0 ? `-${formatInr(exp.tdsAmount)}` : '—'}
                      {exp.tdsSection !== 'NONE' && (
                        <span className="text-[10px] block text-[#5a6376] font-sans">
                          {exp.tdsSection.replace('SEC_', '')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#1f2946]">
                      {formatInr(exp.netPayable)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="badge-tag badge-blue text-[10px]">Level {exp.approvalLevel}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`badge-tag ${
                          exp.status === 'PAID'
                            ? 'badge-emerald'
                            : exp.status === 'APPROVED'
                            ? 'badge-cyan'
                            : 'badge-amber'
                        }`}
                      >
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {exp.status === 'DRAFT' || exp.status === 'SUBMITTED' ? (
                        <button
                          onClick={() => onApproveExpense(exp.id)}
                          className="px-2.5 py-1 rounded bg-[#1f2946] hover:bg-[#2e3c63] text-white font-semibold text-[11px] shadow-xs transition"
                        >
                          Approve
                        </button>
                      ) : exp.status === 'APPROVED' ? (
                        <button
                          onClick={() => onPayExpense(exp.id)}
                          className="px-2.5 py-1 rounded bg-[#15803d] hover:bg-[#166534] text-white font-semibold text-[11px] shadow-xs transition"
                        >
                          Disburse
                        </button>
                      ) : (
                        <span className="text-[#15803d] font-semibold text-[11px]">Paid</span>
                      )}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HRMS EMPLOYEE CLAIMS TAB */}
      {activeSubTab === 'hrms_claims' && (
        <div className="card-editorial bg-white overflow-hidden shadow-xs border border-[#e3ded5] rounded-xl">
          <div className="p-4 border-b border-[#e3ded5] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#fcfbf9]">
            <div>
              <div className="text-sm font-bold text-[#1f2946] flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#c62d37]" />
                HRMS Approved Employee Expense Claims (Cross-Domain Settlement)
              </div>
              <p className="text-xs text-[#5a6376] mt-0.5">
                Claims approved in HRMS ready for financial disbursement • 1-click NEFT batching and General Ledger posting
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-tag badge-emerald text-[11px]">
                {hrmsClaims.filter((c) => c.status === 'SETTLED' || c.status === 'PAID').length} Settled
              </span>
              <span className="badge-tag badge-cyan text-[11px]">
                {approvedClaimsCount} Awaiting Payout
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-editorial">
              <thead>
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Claim #</th>
                  <th className="py-2.5 px-3 font-semibold">Employee &amp; Bank Details</th>
                  <th className="py-2.5 px-3 font-semibold">Expense Category &amp; Item</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Amount (₹)</th>
                  <th className="py-2.5 px-3 font-semibold text-center">HR Approval</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Settlement Status</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Finance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebe7df]">
                {hrmsClaims.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#5a6376]">
                      No approved employee claims found. Claims submitted in HRMS will appear here once approved by managers.
                    </td>
                  </tr>
                ) : (
                  hrmsClaims.map((claim) => {
                    const isSettled = claim.status === 'SETTLED' || claim.status === 'PAID';
                    const isApproved = claim.status === 'APPROVED';

                    return (
                      <tr key={claim.id} className="hover:bg-[#faf9f5] transition">
                        <td className="py-3 px-3 font-mono font-bold text-[#1f2946]">
                          {claim.claimNumber}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#1f2946]">
                            {claim.employee?.firstName} {claim.employee?.lastName} ({claim.employee?.employeeNumber})
                          </div>
                          <div className="text-[11px] text-[#5a6376] flex items-center gap-2 mt-0.5">
                            <span>A/C: {claim.employee?.bankAccountNumber || 'Not recorded'}</span>
                            <span>•</span>
                            <span>IFSC: {claim.employee?.bankIfsc || 'N/A'}</span>
                            {claim.employee?.panNumber && (
                              <>
                                <span>•</span>
                                <span className="font-mono">PAN: {claim.employee.panNumber}</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#1f2946]">
                            {claim.items?.[0]?.category?.name || 'Travel & Conveyance'}
                          </div>
                          <div className="text-[11px] text-[#5a6376] max-w-xs truncate">
                            {claim.items?.[0]?.description || claim.notes || 'Employee Reimbursement Claim'}
                          </div>
                          {claim.items?.[0]?.merchantName && (
                            <span className="text-[10px] text-[#5a6376] italic">
                              Merchant: {claim.items[0].merchantName}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#1f2946] text-sm">
                          {formatInr(claim.totalAmount)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="badge-tag badge-emerald text-[10px] inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-[#15803d]" />
                            Verified
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`badge-tag ${
                              isSettled ? 'badge-emerald' : isApproved ? 'badge-cyan' : 'badge-amber'
                            }`}
                          >
                            {isSettled ? 'SETTLED' : claim.status}
                          </span>
                          {claim.settlementBatchRef && (
                            <span className="block text-[10px] font-mono text-[#5a6376] mt-0.5">
                              {claim.settlementBatchRef}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isApproved ? (
                            <button
                              onClick={() => handleSettleClaim(claim.id)}
                              disabled={settlingClaimId === claim.id}
                              className="px-3 py-1 rounded-lg bg-[#15803d] hover:bg-[#166534] text-white font-semibold text-[11px] shadow-xs transition flex items-center gap-1 mx-auto disabled:opacity-50"
                            >
                              <SendHorizontal className="w-3 h-3" />
                              {settlingClaimId === claim.id ? 'Disbursing...' : 'Disburse (NEFT)'}
                            </button>
                          ) : isSettled ? (
                            <span className="text-[#15803d] font-semibold text-[11px] flex items-center justify-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Paid &amp; Posted
                            </span>
                          ) : (
                            <span className="text-[#5a6376] text-[11px]">Pending HR</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VENDORS DIRECTORY */}
      {activeSubTab === 'vendors' && (
        <div className="card-editorial bg-white p-5 space-y-4 border border-[#e3ded5] rounded-xl shadow-xs">
          <div className="flex items-center justify-between border-b border-[#e3ded5] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#1f2946]">Approved Vendor Master Directory</h3>
              <p className="text-xs text-[#5a6376]">GSTIN, PAN, Bank Details &amp; MSME classification records</p>
            </div>
            <button
              onClick={() => setIsVendorModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#1f2946] hover:bg-[#2e3c63] text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              + Add Vendor Master
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.length === 0 ? (
              <div className="col-span-3 text-center py-10 text-[#5a6376] bg-[#fcfbf9] rounded-xl border border-dashed border-[#e3ded5]">
                <Building className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#5a6376]" />
                <p className="font-semibold text-xs">No registered vendor masters</p>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">Vendors added during bill booking will be indexed here.</p>
              </div>
            ) : (
              vendors.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-xl border border-[#e3ded5] bg-[#fcfbf9] space-y-2 hover:border-[#1f2946] transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#c62d37]">{v.code}</span>
                    <span className="badge-tag badge-emerald text-[10px]">{v.msmeType}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#1f2946]">{v.name}</h4>
                  <div className="text-xs text-[#5a6376] space-y-0.5">
                    <div>GSTIN: <span className="font-mono font-medium text-[#1f2946]">{v.gstin || 'Unregistered'}</span></div>
                    <div>PAN: <span className="font-mono font-medium text-[#1f2946]">{v.pan}</span></div>
                    <div>Default TDS: <span className="font-semibold text-[#1f2946]">{v.tdsSection.replace('SEC_', '')}</span></div>
                    <div>Bank: <span className="text-[#1f2946]">{v.bankName} ({v.bankAccount})</span></div>
                    <div>Payment Terms: <span className="font-semibold text-[#1f2946]">{v.paymentTermsDays} Days</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* RECORD VENDOR BILL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="card-editorial bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e3ded5] p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e3ded5] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1f2946]">Record Vendor Purchase Bill</h3>
                <p className="text-xs text-[#5a6376]">Accounts Payable with Automated Statutory TDS Deduction</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#5a6376] hover:text-[#1f2946] text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#1f2946] font-semibold mb-1">Vendor / Beneficiary</label>
                  {vendors.length > 0 ? (
                    <div className="space-y-1.5">
                      <select
                        value={vendorId}
                        onChange={(e) => setVendorId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946]"
                      >
                        {vendors.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} ({v.code})
                          </option>
                        ))}
                        <option value="CUSTOM">+ Enter Custom Beneficiary Name</option>
                      </select>
                      {vendorId === 'CUSTOM' && (
                        <input
                          type="text"
                          required
                          value={customVendorName}
                          onChange={(e) => setCustomVendorName(e.target.value)}
                          placeholder="Enter Beneficiary / Supplier Name"
                          className="w-full px-3 py-2 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946]"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="text"
                        required
                        value={customVendorName}
                        onChange={(e) => setCustomVendorName(e.target.value)}
                        placeholder="Enter Vendor / Supplier Name"
                        className="w-full px-3 py-2 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          setIsVendorModalOpen(true);
                        }}
                        className="text-[11px] text-[#c62d37] hover:underline font-semibold cursor-pointer"
                      >
                        + Or register as a permanent Vendor Master
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[#1f2946] font-semibold mb-1">Division Cost-Centre</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value as DivisionCode)}
                    className="w-full px-3 py-2 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946]"
                  >
                    <option value="TECHM4_SOLUTIONS">TechM4 Solutions (AI / Software)</option>
                    <option value="TECHM4_ENGINEERING">TechM4 Engineering (COE Labs)</option>
                    <option value="TECHM4_SCHOOLS">TechM4 Schools (STEM Programs)</option>
                    <option value="TECHM4_SPACE">TechM4 Space (Aerospace / CanSat)</option>
                    <option value="HORIZON_INSTITUTES">Horizon Startup School</option>
                    <option value="GENERAL_OVERHEAD">General Corporate Overhead</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1f2946] font-semibold mb-1">Vendor Invoice #</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="e.g. AWS-2026-9912"
                    className="w-full px-3 py-2 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946]"
                  />
                </div>

                <div>
                  <label className="block text-[#1f2946] font-semibold mb-1">Linked Purchase Order (3-Way Match)</label>
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="e.g. PO-2026-088 (optional)"
                    className="w-full px-3 py-2 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#1f2946] font-semibold mb-1">Bill Description &amp; Particulars</label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Monthly cloud hosting and dedicated GPU cluster instance"
                    className="w-full px-3 py-2 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946]"
                  />
                </div>

                <div>
                  <label className="block text-[#1f2946] font-semibold mb-1">Gross Bill Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={grossAmount || ''}
                    onChange={(e) => setGrossAmount(Number(e.target.value))}
                    placeholder="₹ 0.00"
                    className="w-full px-3 py-2 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#1f2946] font-semibold mb-1">Statutory TDS Section</label>
                  <select
                    value={tdsSection}
                    onChange={(e) => handleTdsSectionChange(e.target.value as TdsSection)}
                    className="w-full px-3 py-2 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946]"
                  >
                    <option value="SEC_194C">Sec 194C: Contractors / Advertising (2%)</option>
                    <option value="SEC_194J_TECH">Sec 194J(a): Technical Services (2%)</option>
                    <option value="SEC_194J_PROF">Sec 194J(b): Professional / Legal (10%)</option>
                    <option value="SEC_194H">Sec 194H: Commission / Brokerage (5%)</option>
                    <option value="NONE">No TDS Withholding (0%)</option>
                  </select>
                </div>
              </div>

              {/* Real-time Calculation Summary */}
              <div className="p-3.5 rounded-lg bg-[#fcfbf9] border border-[#e3ded5] space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-[#5a6376]">
                  <span>Gross Vendor Amount:</span>
                  <span className="font-bold text-[#1f2946]">{formatInr(grossAmount)}</span>
                </div>
                <div className="flex justify-between text-[#be123c]">
                  <span>TDS Withheld ({tdsRate}% under {tdsSection.replace('SEC_', '')}):</span>
                  <span>-{formatInr(tdsAmount)}</span>
                </div>
                <div className="border-t border-[#e3ded5] pt-1.5 flex justify-between font-bold text-[#15803d] text-sm">
                  <span>Net Vendor Payable:</span>
                  <span>{formatInr(netPayable)}</span>
                </div>
                <div className="pt-1 flex items-center justify-between text-[#1f2946] font-sans text-[11px]">
                  <span>Approval Routing:</span>
                  <span className="font-bold text-[#c62d37]">{approvalTier}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e3ded5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-[#d1cbbf] text-[#5a6376] font-semibold hover:bg-[#f1efe9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#c62d37] hover:bg-[#a8222e] text-white font-semibold shadow-xs"
                >
                  Book Bill in Payables
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* REGISTER NEW VENDOR MODAL */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="card-editorial bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#e3ded5] p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e3ded5] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1f2946]">Register Approved Vendor Master</h3>
                <p className="text-xs text-[#5a6376]">GSTIN, PAN, Bank NEFT Credentials &amp; MSME Classification</p>
              </div>
              <button
                onClick={() => setIsVendorModalOpen(false)}
                className="text-[#5a6376] hover:text-[#1f2946] text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleVendorSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[#1f2946] font-semibold mb-1">Company / Entity Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    placeholder="e.g. AWS Cloud India Pvt. Ltd. or Robu Technologies"
                    className="w-full px-3 py-2 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946]"
                  />
                </div>

                <div>
                  <label className="block text-[#1f2946] font-semibold mb-1">GSTIN (Optional / 15 chars)</label>
                  <input
                    type="text"
                    value={newVendorGstin}
                    onChange={(e) => setNewVendorGstin(e.target.value.toUpperCase())}
                    placeholder="36AAACS1234F1Z8"
                    className="w-full px-3 py-2 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#1f2946] font-semibold mb-1">PAN Number *</label>
                  <input
                    type="text"
                    required
                    value={newVendorPan}
                    onChange={(e) => setNewVendorPan(e.target.value.toUpperCase())}
                    placeholder="AAACS1234F"
                    className="w-full px-3 py-2 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#1f2946] font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newVendorContact}
                    onChange={(e) => setNewVendorContact(e.target.value)}
                    placeholder="e.g. Accounts Manager"
                    className="w-full px-3 py-2 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946]"
                  />
                </div>

                <div>
                  <label className="block text-[#1f2946] font-semibold mb-1">MSME Classification</label>
                  <select
                    value={newVendorMsme}
                    onChange={(e) => setNewVendorMsme(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946]"
                  >
                    <option value="MICRO">Micro Enterprise (45-day MSME law)</option>
                    <option value="SMALL">Small Enterprise</option>
                    <option value="MEDIUM">Medium Enterprise</option>
                    <option value="NONE">Not Applicable / Large Corp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1f2946] font-semibold mb-1">Default Statutory TDS Section</label>
                  <select
                    value={newVendorTds}
                    onChange={(e) => setNewVendorTds(e.target.value as TdsSection)}
                    className="w-full px-3 py-2 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946]"
                  >
                    <option value="SEC_194C">Sec 194C - Contractor (2%)</option>
                    <option value="SEC_194J_TECH">Sec 194J - Tech Services (2%)</option>
                    <option value="SEC_194J_PROF">Sec 194J - Professional (10%)</option>
                    <option value="SEC_194H">Sec 194H - Brokerage (5%)</option>
                    <option value="NONE">None / Zero Deduction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1f2946] font-semibold mb-1">Credit Payment Terms (Days)</label>
                  <input
                    type="number"
                    min={0}
                    value={newVendorTerms}
                    onChange={(e) => setNewVendorTerms(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946]"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-[#e3ded5]">
                  <h4 className="font-bold text-[#1f2946] mb-2">NEFT / RTGS Banking Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newVendorBankName}
                      onChange={(e) => setNewVendorBankName(e.target.value)}
                      placeholder="Bank Name (e.g. HDFC)"
                      className="px-3 py-1.5 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946]"
                    />
                    <input
                      type="text"
                      value={newVendorAccount}
                      onChange={(e) => setNewVendorAccount(e.target.value)}
                      placeholder="Bank Account #"
                      className="px-3 py-1.5 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946] font-mono"
                    />
                    <input
                      type="text"
                      value={newVendorIfsc}
                      onChange={(e) => setNewVendorIfsc(e.target.value.toUpperCase())}
                      placeholder="IFSC Code"
                      className="px-3 py-1.5 rounded-lg border border-[#d1cbbf] bg-white text-[#1f2946] font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e3ded5]">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-[#d1cbbf] text-[#5a6376] font-semibold hover:bg-[#f1efe9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#1f2946] hover:bg-[#2e3c63] text-white font-semibold shadow-xs cursor-pointer"
                >
                  Save Vendor Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};