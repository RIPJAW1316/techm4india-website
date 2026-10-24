import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Plus,
  Receipt,
  Upload,
  X,
} from 'lucide-react';
import { ExpenseClaimItem } from '../types';

interface HrmsClaimsProps {
  claims: ExpenseClaimItem[];
  onSubmitClaim: (data: any) => void;
  isSubmitModalOpen?: boolean;
  setIsSubmitModalOpen?: (open: boolean) => void;
}

export const HrmsClaims: React.FC<HrmsClaimsProps> = ({
  claims,
  onSubmitClaim,
  isSubmitModalOpen: externalModalOpen,
  setIsSubmitModalOpen: setExternalModalOpen,
}) => {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const isModalOpen =
    externalModalOpen !== undefined ? externalModalOpen : internalModalOpen;
  const setModalOpen = setExternalModalOpen || setInternalModalOpen;

  const [category, setCategory] = useState('Travel & Client Meeting');
  const [amount, setAmount] = useState(1500);
  const [merchant, setMerchant] = useState('');
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [description, setDescription] = useState('');

  const totalClaims = claims.reduce((acc, c) => acc + c.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !merchant) return;

    onSubmitClaim({
      category,
      amount: Number(amount) || 0,
      merchant,
      expenseDate,
      description,
    });

    setModalOpen(false);
    setMerchant('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Submit Trigger */}
      <div className="bg-white rounded-2xl p-6 border border-[#e3ded5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1f2946] tracking-tight">
            Workforce Expense Claims &amp; Reimbursements
          </h2>
          <p className="text-xs text-[#5a6376] mt-1">
            Submit business expenses with merchant invoices for finance reconciliation &amp; bank settlement.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#1f2946] hover:bg-[#151c31] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#2563eb]" />
          <span>+ Submit New Claim</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#e3ded5] shadow-xs">
          <span className="text-[11px] font-bold text-[#5a6376] uppercase">Total Active Claims</span>
          <div className="text-2xl font-black text-[#1f2946] mt-1">
            ₹{totalClaims.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#5a6376]">{claims.length} batch items</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#e3ded5] shadow-xs">
          <span className="text-[11px] font-bold text-[#5a6376] uppercase">Pending Finance Approval</span>
          <div className="text-2xl font-black text-[#b45309] mt-1">
            ₹{claims
              .filter((c) => c.status === 'SUBMITTED')
              .reduce((acc, c) => acc + c.amount, 0)
              .toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#b45309] font-semibold">Ready for review</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#e3ded5] shadow-xs">
          <span className="text-[11px] font-bold text-[#5a6376] uppercase">Reimbursed &amp; Settled</span>
          <div className="text-2xl font-black text-[#047857] mt-1">
            ₹{claims
              .filter((c) => c.status === 'PAID')
              .reduce((acc, c) => acc + c.amount, 0)
              .toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#047857] font-semibold">Credited to salary bank account</span>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-2xl border border-[#e3ded5] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#e3ded5] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1f2946]">Expense Reimbursements Queue</h3>
          <span className="text-xs text-[#5a6376]">All figures in INR (₹)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f7f6f2] border-b border-[#e3ded5] text-[#5a6376] font-bold uppercase text-[11px]">
                <th className="py-3 px-4">Claim ID</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Merchant &amp; Details</th>
                <th className="py-3 px-4">Expense Date</th>
                <th className="py-3 px-4 font-mono">Amount (₹)</th>
                <th className="py-3 px-4 text-right">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece3]">
              {claims.map((c) => (
                <tr key={c.id} className="hover:bg-[#fbfbf9]">
                  <td className="py-3 px-4 font-mono font-bold text-[#1f2946]">{c.claimNumber}</td>
                  <td className="py-3 px-4 font-medium text-[#1f2946]">{c.employeeName}</td>
                  <td className="py-3 px-4 text-[#5a6376] font-semibold">{c.category}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#1f2946]">{c.merchant}</div>
                    <div className="text-[11px] text-[#5a6376] truncate max-w-[220px]" title={c.description}>
                      {c.description}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#5a6376]">{c.expenseDate}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#1f2946]">
                    ₹{c.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'PAID'
                          ? 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]'
                          : c.status === 'APPROVED'
                          ? 'bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]'
                          : 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a]'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Claim Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#e3ded5] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1f2946]">Submit Expense Claim</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-[#5a6376] hover:bg-[#f7f6f2] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#5a6376] font-bold mb-1">Expense Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] text-[#1f2946] font-semibold"
                >
                  <option value="Travel & Client Meeting">Travel &amp; Client Meeting</option>
                  <option value="Hardware & Sensor Procurement">Hardware &amp; Sensor Procurement</option>
                  <option value="Books & Course Materials">Books &amp; Course Materials</option>
                  <option value="Software & Cloud Infrastructure">Software &amp; Cloud Infrastructure</option>
                  <option value="Office Supplies & Stationery">Office Supplies &amp; Stationery</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5a6376] font-bold mb-1">Amount (INR ₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] font-mono text-[#1f2946]"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6376] font-bold mb-1">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] font-mono text-[#1f2946]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#5a6376] font-bold mb-1">Merchant / Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="e.g. Robu.in / Taj Deccan / Uber"
                  className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] text-[#1f2946]"
                />
              </div>

              <div>
                <label className="block text-[#5a6376] font-bold mb-1">Business Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide context on client or project alignment..."
                  className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] text-[#1f2946]"
                />
              </div>

              <div className="p-3 rounded-xl border border-dashed border-[#d1cbbf] bg-[#f7f6f2] text-center text-[#5a6376] space-y-1">
                <Upload className="w-5 h-5 mx-auto text-[#5a6376]" />
                <span className="block text-[11px] font-semibold">Tax Invoice / Receipt Attached</span>
                <span className="block text-[10px] text-[#5a6376]">PNG, JPG, PDF up to 10MB</span>
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
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
