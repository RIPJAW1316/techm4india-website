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
} from 'lucide-react';
import { DivisionCode, ExpenseItem, TdsSection, VendorItem } from '../types';

interface PayablesExpensesProps {
  expenses: ExpenseItem[];
  vendors: VendorItem[];
  onCreateExpense: (exp: any) => void;
  onApproveExpense: (id: string) => void;
  onPayExpense: (id: string) => void;
}

export const PayablesExpenses: React.FC<PayablesExpensesProps> = ({
  expenses,
  vendors,
  onCreateExpense,
  onApproveExpense,
  onPayExpense,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bills' | 'vendors'>('bills');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterDivision, setFilterDivision] = useState<string>('ALL');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || grossAmount <= 0) return;

    const vendor = vendors.find((v) => v.id === vendorId);
    onCreateExpense({
      vendorId,
      vendorName: vendor ? vendor.name : 'Direct Expense Claim',
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
  };

  const formatInr = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e3ded5] pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('bills')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'bills'
                ? 'bg-[#1f2946] text-white'
                : 'text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9]'
            }`}
          >
            Vendor Bills &amp; Claims ({expenses.length})
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
                {expenses.map((exp) => (
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
                ))}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-xl bg-[#fcfbf9] border border-[#e3ded5] space-y-2 text-xs hover:border-[#c62d37]/40 transition shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1f2946]">{v.name}</span>
                  <span className="badge-tag badge-blue font-mono">{v.code}</span>
                </div>
                <div className="text-[#5a6376]">Contact: {v.contactPerson || 'Accounts Dept'}</div>
                <div className="font-mono text-[#1f2946]">GSTIN: {v.gstin || 'Unregistered'}</div>
                <div className="font-mono text-[#5a6376]">PAN: {v.pan || 'N/A'}</div>
                <div className="font-mono text-[#5a6376] text-[11px]">
                  Bank: {v.bankName} (IFSC: {v.ifsc})
                </div>
                <div className="pt-2 border-t border-[#e3ded5] flex items-center justify-between text-[11px]">
                  <span className="text-[#15803d] font-semibold">TDS: {v.tdsSection.replace('SEC_', '')}</span>
                  <span className="text-[#5a6376]">Terms: {v.paymentTermsDays} Days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECORD EXPENSE BILL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#e3ded5] rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e3ded5] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1f2946] flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#c62d37]" />
                  Record Vendor Purchase Bill / Expense
                </h3>
                <p className="text-xs text-[#5a6376]">
                  Enforces automated statutory TDS deduction &amp; threshold routing
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#5a6376] hover:text-[#1f2946] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#1f2946] font-semibold block mb-1">Select Vendor</label>
                  <select
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="w-full bg-[#fbfaf7] border border-[#d1cbbf] rounded-lg p-2 text-[#1f2946] focus:border-[#c62d37] focus:outline-hidden"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#1f2946] font-semibold block mb-1">Division Cost Centre</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value as DivisionCode)}
                    className="w-full bg-[#fbfaf7] border border-[#d1cbbf] rounded-lg p-2 text-[#1f2946] focus:border-[#c62d37] focus:outline-hidden"
                  >
                    <option value="TECHM4_SOLUTIONS">TechM4Solutions</option>
                    <option value="TECHM4_ENGINEERING">TechM4Engineering</option>
                    <option value="TECHM4_SCHOOLS">TechM4Schools</option>
                    <option value="TECHM4_SPACE">TechM4Space Technology</option>
                    <option value="HORIZON_INSTITUTES">Horizon Startup School</option>
                    <option value="GENERAL_OVERHEAD">General Overhead</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#1f2946] font-semibold block mb-1">Description / Bill Purpose</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. AWS Dedicated GPU Cloud Infrastructure Cluster"
                  className="w-full bg-[#fbfaf7] border border-[#d1cbbf] rounded-lg p-2 text-[#1f2946] focus:border-[#c62d37] focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[#1f2946] font-semibold block mb-1">Gross Invoice Value (₹)</label>
                  <input
                    type="number"
                    value={grossAmount || ''}
                    onChange={(e) => setGrossAmount(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 50000"
                    className="w-full bg-[#fbfaf7] border border-[#d1cbbf] rounded-lg p-2 text-[#1f2946] font-mono font-bold focus:border-[#c62d37] focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="text-[#1f2946] font-semibold block mb-1">TDS Section</label>
                  <select
                    value={tdsSection}
                    onChange={(e) => handleTdsSectionChange(e.target.value as TdsSection)}
                    className="w-full bg-[#fbfaf7] border border-[#d1cbbf] rounded-lg p-2 text-[#1f2946] focus:border-[#c62d37] focus:outline-hidden"
                  >
                    <option value="SEC_194C">194C (Contractors - 2%)</option>
                    <option value="SEC_194J_TECH">194J (Tech Services - 2%)</option>
                    <option value="SEC_194J_PROF">194J (Professional - 10%)</option>
                    <option value="NONE">None (Exempt)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#1f2946] font-semibold block mb-1">Vendor Invoice #</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="INV-9921"
                    className="w-full bg-[#fbfaf7] border border-[#d1cbbf] rounded-lg p-2 text-[#1f2946] font-mono focus:border-[#c62d37] focus:outline-hidden"
                  />
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
    </div>
  );
};
