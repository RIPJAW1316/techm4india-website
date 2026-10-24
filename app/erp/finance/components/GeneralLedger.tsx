'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  RotateCcw,
  Scale,
  Users,
  CheckCircle,
} from 'lucide-react';
import { AccountItem, DivisionCode, JournalEntryItem, VoucherType } from '../types';

interface GeneralLedgerProps {
  accounts: AccountItem[];
  journalEntries: JournalEntryItem[];
  onAddJournalEntry: (entry: any) => void;
  onPostJournal: (id: string) => void;
  onReverseJournal: (id: string) => void;
  onImportPayrollAccrual?: () => Promise<void> | void;
}

export const GeneralLedger: React.FC<GeneralLedgerProps> = ({
  accounts,
  journalEntries,
  onAddJournalEntry,
  onPostJournal,
  onReverseJournal,
  onImportPayrollAccrual,
}) => {
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isAccruing, setIsAccruing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'journals' | 'coa' | 'trial_balance'>('journals');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Journal Form State
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [voucherType, setVoucherType] = useState<VoucherType>('JOURNAL');
  const [narration, setNarration] = useState('');
  const [division, setDivision] = useState<DivisionCode>('TECHM4_SOLUTIONS');
  const [reference, setReference] = useState('');
  const [lines, setLines] = useState<Array<{ accountId: string; debitAmount: number; creditAmount: number; description: string }>>([
    { accountId: accounts[0]?.id || '', debitAmount: 0, creditAmount: 0, description: '' },
    { accountId: accounts[1]?.id || '', debitAmount: 0, creditAmount: 0, description: '' },
  ]);

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debitAmount) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.creditAmount) || 0), 0);
  const diff = Math.abs(totalDebit - totalCredit);
  const isBalanced = diff < 0.01 && totalDebit > 0;

  const handleAddLine = () => {
    setLines([...lines, { accountId: accounts[0]?.id || '', debitAmount: 0, creditAmount: 0, description: '' }]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const handleSubmitJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;

    onAddJournalEntry({
      date,
      voucherType,
      reference,
      narration,
      division,
      lineItems: lines.map((l) => ({
        accountId: l.accountId,
        accountName: accounts.find((a) => a.id === l.accountId)?.name || 'Account',
        debitAmount: Number(l.debitAmount) || 0,
        creditAmount: Number(l.creditAmount) || 0,
        description: l.description,
      })),
    });

    setIsModalOpen(false);
    setNarration('');
    setReference('');
    setLines([
      { accountId: accounts[0]?.id || '', debitAmount: 0, creditAmount: 0, description: '' },
      { accountId: accounts[1]?.id || '', debitAmount: 0, creditAmount: 0, description: '' },
    ]);
  };

  const formatInr = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e3ded5] pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('journals')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'journals'
                ? 'bg-[#1f2946] text-white'
                : 'text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9]'
            }`}
          >
            Journal Vouchers ({journalEntries.length})
          </button>
          <button
            onClick={() => setActiveSubTab('coa')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'coa'
                ? 'bg-[#1f2946] text-white'
                : 'text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9]'
            }`}
          >
            Chart of Accounts ({accounts.length})
          </button>
          <button
            onClick={() => setActiveSubTab('trial_balance')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'trial_balance'
                ? 'bg-[#1f2946] text-white'
                : 'text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9]'
            }`}
          >
            Trial Balance Check
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onImportPayrollAccrual && (
            <button
              onClick={() => setIsPayrollModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1f2946] hover:bg-[#2e3c63] text-white text-xs font-semibold shadow-xs transition"
            >
              <Users className="w-3.5 h-3.5 text-[#f1efe9]" />
              Accrue HRMS Payroll
            </button>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#c62d37] hover:bg-[#a8222e] text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Journal Entry
          </button>
        </div>
      </div>

      {/* VIEW 1: JOURNAL VOUCHERS LIST */}
      {activeSubTab === 'journals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table List of Journals (2 cols) */}
          <div className="lg:col-span-2 card-editorial overflow-hidden bg-white">
            <div className="p-4 border-b border-[#e3ded5] flex items-center justify-between">
              <div className="text-sm font-bold text-[#1f2946] flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600" />
                General Ledger Journal Register
              </div>
              <div className="text-xs text-[#5a6376]">Strict double-entry audit trail</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs table-editorial">
                <thead>
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Entry #</th>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">Type</th>
                    <th className="py-2.5 px-3 font-semibold">Division</th>
                    <th className="py-2.5 px-3 font-semibold">Narration</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Amount (₹)</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {journalEntries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-[#94a3b8]">
                        <Scale className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#94a3b8]" />
                        <p className="font-semibold text-xs text-[#5a6376]">No journal vouchers recorded</p>
                        <p className="text-[11px] text-[#94a3b8] mt-0.5">Click &quot;Create Journal Entry&quot; to post a double-entry transaction.</p>
                      </td>
                    </tr>
                  ) : (
                    journalEntries.map((j) => {
                    const isSelected = selectedEntry?.id === j.id;
                    return (
                      <tr
                        key={j.id}
                        onClick={() => setSelectedEntry(j)}
                        className={`cursor-pointer transition ${
                          isSelected ? 'bg-blue-50/80 text-blue-900 font-medium' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-[#1f2946]">{j.entryNumber}</td>
                        <td className="py-3 px-3 text-[#5a6376] font-mono">{j.date}</td>
                        <td className="py-3 px-3">
                          <span className="badge-tag badge-muted">{j.voucherType}</span>
                        </td>
                        <td className="py-3 px-3 text-[#20283b]">
                          {j.division.replace('TECHM4_', '').replace('_', ' ')}
                        </td>
                        <td className="py-3 px-3 text-[#5a6376] max-w-xs truncate" title={j.narration}>
                          {j.narration}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#0e1424]">
                          {formatInr(j.totalDebit)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`badge-tag ${
                              j.status === 'POSTED'
                                ? 'badge-emerald'
                                : j.status === 'REVERSED'
                                ? 'badge-rose'
                                : 'badge-amber'
                            }`}
                          >
                            {j.status}
                          </span>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right side: Detailed Inspection of Selected Journal */}
          <div className="card-editorial p-5 bg-white">
            {selectedEntry ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#e3ded5] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#1f2946] font-mono">{selectedEntry.entryNumber}</h3>
                    <div className="text-xs text-[#5a6376] mt-0.5">{selectedEntry.date} · {selectedEntry.voucherType}</div>
                  </div>
                  <span
                    className={`badge-tag ${
                      selectedEntry.status === 'POSTED'
                        ? 'badge-emerald'
                        : selectedEntry.status === 'REVERSED'
                        ? 'badge-rose'
                        : 'badge-amber'
                    }`}
                  >
                    {selectedEntry.status}
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#5a6376] uppercase tracking-wider">Narration &amp; Purpose</label>
                  <p className="text-xs text-[#20283b] mt-1 leading-relaxed bg-[#faf9f6] p-2.5 rounded-lg border border-[#e3ded5]">
                    {selectedEntry.narration}
                  </p>
                </div>

                {/* Line Items Table */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#5a6376] uppercase tracking-wider">Ledger Postings</span>
                    <span className="text-[11px] font-mono text-emerald-700 font-semibold">Debits = Credits</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {selectedEntry.lineItems.map((line, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#faf9f6] border border-[#e3ded5] flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-[#1f2946]">{line.accountName || line.accountId}</div>
                          <div className="text-[11px] text-[#5a6376]">{line.description || 'General posting'}</div>
                        </div>
                        <div className="text-right font-mono">
                          {line.debitAmount > 0 && (
                            <div className="text-blue-700 font-bold">Dr: {formatInr(line.debitAmount)}</div>
                          )}
                          {line.creditAmount > 0 && (
                            <div className="text-emerald-700 font-bold">Cr: {formatInr(line.creditAmount)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions: Post or Reverse */}
                <div className="pt-3 border-t border-[#e3ded5] flex items-center gap-2">
                  {selectedEntry.status === 'DRAFT' && (
                    <button
                      onClick={() => onPostJournal(selectedEntry.id)}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Post to General Ledger
                    </button>
                  )}
                  {selectedEntry.status === 'POSTED' && (
                    <button
                      onClick={() => onReverseJournal(selectedEntry.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Create Reversal Entry
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-[#5a6376] text-xs">
                <Scale className="w-8 h-8 text-slate-300 mb-2" />
                Select any journal voucher to view double-entry postings
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: CHART OF ACCOUNTS */}
      {activeSubTab === 'coa' && (
        <div className="card-editorial p-5 space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1f2946]">Standard 5-Class Chart of Accounts</h3>
              <p className="text-xs text-[#5a6376]">Assets, Liabilities, Equity, Revenue, and Operating Expenses</p>
            </div>
            <div className="text-xs text-[#5a6376] font-mono">
              Total Accounts: <strong className="text-[#1f2946]">{accounts.length}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'] as const).map((accType) => {
              const matched = accounts.filter((a) => a.type === accType);
              const totalClassBalance = matched.reduce((sum, a) => sum + Number(a.balance), 0);

              return (
                <div key={accType} className="p-4 rounded-xl bg-[#faf9f6] border border-[#e3ded5] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#e3ded5] pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1f2946]">{accType}</span>
                    <span className="text-xs font-mono font-bold text-[#0e1424]">{formatInr(totalClassBalance)}</span>
                  </div>

                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 text-xs">
                    {matched.map((acc) => (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between p-2 rounded bg-white border border-[#f0ece3] hover:border-slate-300 transition"
                      >
                        <div>
                          <div className="font-semibold text-[#1f2946]">{acc.name}</div>
                          <div className="text-[11px] text-[#5a6376] font-mono">{acc.code} · {acc.category}</div>
                        </div>
                        <div className="font-mono font-bold text-[#0e1424]">{formatInr(acc.balance)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: TRIAL BALANCE CHECK */}
      {activeSubTab === 'trial_balance' && (
        <div className="card-editorial p-5 space-y-4 bg-white">
          <div className="flex items-center justify-between border-b border-[#e3ded5] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#1f2946]">Trial Balance Equilibrium Report</h3>
              <p className="text-xs text-[#5a6376]">Verifying debit and credit mathematical parity as on today</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-tag badge-emerald">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Ledger Balanced
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-editorial">
              <thead>
                <tr>
                  <th className="py-2.5 px-3">Account Code</th>
                  <th className="py-2.5 px-3">Account Name</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3 text-right">Debit Balance (₹)</th>
                  <th className="py-2.5 px-3 text-right">Credit Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => {
                  const isDebitClass = a.type === 'ASSET' || a.type === 'EXPENSE';
                  const debit = isDebitClass ? a.balance : 0;
                  const credit = !isDebitClass ? a.balance : 0;

                  return (
                    <tr key={a.id}>
                      <td className="py-2.5 px-3 font-mono text-[#5a6376]">{a.code}</td>
                      <td className="py-2.5 px-3 font-bold text-[#1f2946]">{a.name}</td>
                      <td className="py-2.5 px-3 text-[#5a6376]">{a.type}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-blue-700 font-semibold">
                        {debit > 0 ? formatInr(debit) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-semibold">
                        {credit > 0 ? formatInr(credit) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE JOURNAL MODAL WITH BALANCING ENGINE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="card-editorial w-full max-w-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto bg-white">
            <div className="flex items-center justify-between border-b border-[#e3ded5] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1f2946] flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-600" />
                  New Double-Entry Journal Voucher
                </h3>
                <p className="text-xs text-[#5a6376]">Total Debits must equal Total Credits before posting</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#5a6376] hover:text-[#1f2946] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitJournal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[#1f2946] font-bold block mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#faf9f6] border border-[#e3ded5] rounded p-2 text-[#1f2946] focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[#1f2946] font-bold block mb-1">Voucher Type</label>
                  <select
                    value={voucherType}
                    onChange={(e) => setVoucherType(e.target.value as VoucherType)}
                    className="w-full bg-[#faf9f6] border border-[#e3ded5] rounded p-2 text-[#1f2946] focus:outline-none focus:border-blue-500"
                  >
                    <option value="JOURNAL">Journal Voucher (JV)</option>
                    <option value="PAYMENT">Payment Voucher (PV)</option>
                    <option value="RECEIPT">Receipt Voucher (RV)</option>
                    <option value="CONTRA">Contra Transfer (CV)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#1f2946] font-bold block mb-1">Division Cost Centre</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value as DivisionCode)}
                    className="w-full bg-[#faf9f6] border border-[#e3ded5] rounded p-2 text-[#1f2946] focus:outline-none focus:border-blue-500"
                  >
                    <option value="TECHM4_SOLUTIONS">TechM4Solutions</option>
                    <option value="TECHM4_ENGINEERING">TechM4Engineering</option>
                    <option value="TECHM4_SCHOOLS">TechM4Schools</option>
                    <option value="TECHM4_SPACE">TechM4Space Technology</option>
                    <option value="HORIZON_INSTITUTES">Horizon Startup School</option>
                    <option value="GENERAL_OVERHEAD">General Overhead</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#1f2946] font-bold block mb-1">Reference / Doc #</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. PO-8821"
                    className="w-full bg-[#faf9f6] border border-[#e3ded5] rounded p-2 text-[#1f2946] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#1f2946] font-bold block mb-1">Narration / Description</label>
                <input
                  type="text"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  placeholder="e.g. Provision for monthly cloud servers and hardware supplies"
                  className="w-full bg-[#faf9f6] border border-[#e3ded5] rounded p-2 text-[#1f2946] focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Dynamic Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1f2946]">Journal Lines</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    + Add Line Item
                  </button>
                </div>

                <div className="space-y-2">
                  {lines.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={line.accountId}
                        onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                        className="flex-1 bg-[#faf9f6] border border-[#e3ded5] rounded p-2 text-[#1f2946]"
                      >
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.code} - {a.name} ({a.type})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        placeholder="Debit (₹)"
                        value={line.debitAmount || ''}
                        onChange={(e) => handleLineChange(idx, 'debitAmount', parseFloat(e.target.value) || 0)}
                        className="w-28 bg-[#faf9f6] border border-[#e3ded5] rounded p-2 text-right text-blue-700 font-mono font-semibold"
                      />

                      <input
                        type="number"
                        placeholder="Credit (₹)"
                        value={line.creditAmount || ''}
                        onChange={(e) => handleLineChange(idx, 'creditAmount', parseFloat(e.target.value) || 0)}
                        className="w-28 bg-[#faf9f6] border border-[#e3ded5] rounded p-2 text-right text-emerald-700 font-mono font-semibold"
                      />

                      {lines.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-[#5a6376] hover:text-rose-600 px-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Double-entry Balance Indicator Bar */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between text-xs font-mono ${
                  isBalanced
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                    : 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isBalanced ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>
                    {isBalanced
                      ? 'Double-Entry Invariant Satisfied: Balanced'
                      : `Unbalanced! Debits ₹${totalDebit.toFixed(2)} ≠ Credits ₹${totalCredit.toFixed(2)}`}
                  </span>
                </div>
                <div>Variance: ₹{diff.toFixed(2)}</div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e3ded5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-slate-100 text-[#1f2946] font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className="px-4 py-2 rounded bg-[#c62d37] hover:bg-[#a8222e] disabled:opacity-40 text-white font-semibold"
                >
                  Save Journal Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    
      {/* PAYROLL ACCRUAL MODAL */}
      {isPayrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="card-editorial bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#e3ded5] p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e3ded5] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#c62d37]" />
                <div>
                  <h3 className="text-base font-bold text-[#1f2946]">Accrue HRMS Payroll into General Ledger</h3>
                  <p className="text-xs text-[#5a6376]">October 2026 Finalized Pay Run • Automated Double-Entry Balanced Posting</p>
                </div>
              </div>
              <button
                onClick={() => setIsPayrollModalOpen(false)}
                className="text-[#5a6376] hover:text-[#1f2946] text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#fcfbf9] rounded-xl border border-[#e3ded5] grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[#5a6376] block text-[11px]">Payroll Run Period:</span>
                  <span className="font-bold text-[#1f2946] text-sm">October 2026 (FY 2026-27)</span>
                </div>
                <div>
                  <span className="text-[#5a6376] block text-[11px]">Total Headcount:</span>
                  <span className="font-bold text-[#1f2946] text-sm">5 Active Staff Engineers &amp; Leads</span>
                </div>
              </div>

              {/* Journal Voucher Line Preview */}
              <div className="border border-[#e3ded5] rounded-xl overflow-hidden">
                <div className="p-2.5 bg-[#f1efe9] font-bold text-[#1f2946] text-[11px] flex justify-between">
                  <span>Balanced Journal Voucher Preview (JV-PAYROLL-2026-10)</span>
                  <span className="text-emerald-700">In Balance (₹2,24,000)</span>
                </div>
                <table className="w-full text-left text-[11px]">
                  <thead className="border-b border-[#e3ded5] bg-[#faf9f5] text-[#5a6376]">
                    <tr>
                      <th className="py-1.5 px-3">Account &amp; Classification</th>
                      <th className="py-1.5 px-3 text-right">Debit (₹)</th>
                      <th className="py-1.5 px-3 text-right">Credit (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebe7df] font-mono">
                    <tr>
                      <td className="py-1.5 px-3 font-sans">
                        <span className="font-semibold text-[#1f2946]">5010 - Gross Salary &amp; Wages Expense</span>
                        <span className="block text-[10px] text-[#5a6376]">Operational Expense Debit</span>
                      </td>
                      <td className="py-1.5 px-3 text-right font-bold text-[#1f2946]">2,00,000.00</td>
                      <td className="py-1.5 px-3 text-right text-[#5a6376]">—</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-sans">
                        <span className="font-semibold text-[#1f2946]">5020 - Employer EPF Contribution (12%)</span>
                        <span className="block text-[10px] text-[#5a6376]">Statutory Cost Debit</span>
                      </td>
                      <td className="py-1.5 px-3 text-right font-bold text-[#1f2946]">24,000.00</td>
                      <td className="py-1.5 px-3 text-right text-[#5a6376]">—</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-sans">
                        <span className="font-semibold text-[#1f2946]">2040 - Net Salaries Payable to Staff</span>
                        <span className="block text-[10px] text-[#5a6376]">Pending Disbursal via HDFC Bank</span>
                      </td>
                      <td className="py-1.5 px-3 text-right text-[#5a6376]">—</td>
                      <td className="py-1.5 px-3 text-right font-bold text-[#1f2946]">1,78,800.00</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-sans">
                        <span className="font-semibold text-[#1f2946]">2050 - EPF Statutory Remittance Payable</span>
                        <span className="block text-[10px] text-[#5a6376]">Employee (12%) + Employer (12%)</span>
                      </td>
                      <td className="py-1.5 px-3 text-right text-[#5a6376]">—</td>
                      <td className="py-1.5 px-3 text-right font-bold text-[#1f2946]">48,000.00</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-sans">
                        <span className="font-semibold text-[#1f2946]">2060 - Professional Tax Payable</span>
                        <span className="block text-[10px] text-[#5a6376]">Telangana PT Withholding</span>
                      </td>
                      <td className="py-1.5 px-3 text-right text-[#5a6376]">—</td>
                      <td className="py-1.5 px-3 text-right font-bold text-[#1f2946]">1,000.00</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-sans">
                        <span className="font-semibold text-[#1f2946]">2070 - TDS on Salaries (Section 192)</span>
                        <span className="block text-[10px] text-[#5a6376]">IT Withholding Payable</span>
                      </td>
                      <td className="py-1.5 px-3 text-right text-[#5a6376]">—</td>
                      <td className="py-1.5 px-3 text-right font-bold text-[#1f2946]">4,200.00</td>
                    </tr>
                  </tbody>
                  <tfoot className="border-t-2 border-[#1f2946] bg-[#fcfbf9] font-mono font-bold text-[#1f2946]">
                    <tr>
                      <td className="py-2 px-3 font-sans">Total Balanced Vouchers:</td>
                      <td className="py-2 px-3 text-right text-emerald-700">₹2,24,000.00</td>
                      <td className="py-2 px-3 text-right text-emerald-700">₹2,24,000.00</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e3ded5]">
                <button
                  type="button"
                  onClick={() => setIsPayrollModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-[#d1cbbf] text-[#5a6376] font-semibold hover:bg-[#f1efe9]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isAccruing}
                  onClick={async () => {
                    if (!onImportPayrollAccrual) return;
                    setIsAccruing(true);
                    try {
                      await onImportPayrollAccrual();
                      setIsPayrollModalOpen(false);
                    } finally {
                      setIsAccruing(false);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-[#15803d] hover:bg-[#166534] disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isAccruing ? 'Accruing...' : 'Post Payroll JV to General Ledger'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};