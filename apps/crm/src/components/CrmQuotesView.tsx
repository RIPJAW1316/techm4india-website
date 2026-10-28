'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  ExternalLink,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Layers,
  Plus,
  Receipt,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { AccountItem, DealItem, QuoteItem } from '../types';

interface CrmQuotesViewProps {
  quotes: QuoteItem[];
  accounts: AccountItem[];
  deals: DealItem[];
  onCreateQuote: (quote: Partial<QuoteItem>) => void;
  onPushToFinance: (quoteId: string) => Promise<void>;
}

export const CrmQuotesView: React.FC<CrmQuotesViewProps> = ({
  quotes,
  accounts,
  deals,
  onCreateQuote,
  onPushToFinance,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedQuote, setSelectedQuote] = useState<QuoteItem | null>(null);
  const [isNewQuoteModalOpen, setIsNewQuoteModalOpen] = useState(false);
  const [pushingQuoteId, setPushingQuoteId] = useState<string | null>(null);
  const [financePushSuccess, setFinancePushSuccess] = useState<string | null>(null);

  // New quote form state
  const [quoteData, setQuoteData] = useState({
    accountName: accounts[0]?.name || 'Anurag University',
    dealId: deals[0]?.id || '',
    dealTitle: deals[0]?.title || '',
    validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    lineItems: [
      {
        description: 'TechM4 Engineering R&D Center Lab Kit (Hardware + Firmware)',
        quantity: 1,
        unitPrice: 1500000,
        amount: 1500000,
      },
      {
        description: 'Faculty Development Program & Curriculum Integration (5 Days)',
        quantity: 1,
        unitPrice: 300000,
        amount: 300000,
      },
    ],
  });

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.dealTitle && q.dealTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatInr = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  const getStatusBadge = (status: QuoteItem['status']) => {
    switch (status) {
      case 'ACCEPTED':
        return <span className="badge-tag badge-emerald">Accepted</span>;
      case 'SENT':
        return <span className="badge-tag badge-blue">Sent to Client</span>;
      case 'CONVERTED_TO_INVOICE':
        return (
          <span className="badge-tag badge-purple flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Invoiced in Finance ERP
          </span>
        );
      case 'REJECTED':
        return <span className="badge-tag badge-gray">Rejected</span>;
      default:
        return <span className="badge-tag badge-amber">Draft</span>;
    }
  };

  const handlePushQuote = async (quoteId: string) => {
    setPushingQuoteId(quoteId);
    try {
      await onPushToFinance(quoteId);
      setFinancePushSuccess(quoteId);
      setTimeout(() => setFinancePushSuccess(null), 8000);
    } finally {
      setPushingQuoteId(null);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = quoteData.lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxGst = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + taxGst;

    onCreateQuote({
      ...quoteData,
      subtotal,
      taxGst,
      totalAmount,
      status: 'SENT',
    });

    setIsNewQuoteModalOpen(false);
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-[#1f2946] flex items-center gap-2">
            <span>Quotations &amp; Institutional Proposals</span>
            <span className="badge-tag badge-blue text-[10px]">{filteredQuotes.length} Quotes</span>
          </h1>
          <p className="text-xs text-[#5a6376] mt-0.5">
            Prepare GST-compliant academic quotations with 1-click bridge to TechM4 Finance ERP (Port :3001).
          </p>
        </div>

        <button
          onClick={() => setIsNewQuoteModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#c62d37] hover:bg-[#a8222b] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {financePushSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Success!</strong> Quote {financePushSuccess} converted into an official Accounts Receivable Invoice in TechM4 Finance ERP.
            </span>
          </div>
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-bold text-emerald-700 hover:underline shrink-0"
          >
            <span>Open Finance ERP (:3001)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#e3ded5] shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#88909f]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search quote number, institution, deal..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs font-medium text-[#1f2946] cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="SENT">Sent</option>
          <option value="DRAFT">Draft</option>
          <option value="CONVERTED_TO_INVOICE">Invoiced in Finance</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-xl border border-[#e3ded5] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f7f6f2] border-b border-[#e3ded5] text-[#5a6376] font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Quote Number</th>
                <th className="py-3 px-4">Institution Client</th>
                <th className="py-3 px-4">Deal / Project</th>
                <th className="py-3 px-4">Subtotal (Net)</th>
                <th className="py-3 px-4">GST (18%)</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Finance ERP Bridge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3ded5]">
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-[#fcfbf9] transition-colors">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedQuote(quote)}
                      className="font-mono font-bold text-[#1f2946] hover:text-[#c62d37] hover:underline cursor-pointer"
                    >
                      {quote.quoteNumber}
                    </button>
                    <div className="text-[10px] text-[#88909f] mt-0.5">
                      Valid till: {quote.validUntil}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#1f2946]">
                    {quote.accountName}
                  </td>
                  <td className="py-3 px-4 text-[#5a6376] max-w-[200px] truncate">
                    {quote.dealTitle || 'Direct Proposal'}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#5a6376]">
                    {formatInr(quote.subtotal)}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#88909f]">
                    {formatInr(quote.taxGst)}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#1f2946]">
                    {formatInr(quote.totalAmount)}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(quote.status)}</td>
                  <td className="py-3 px-4 text-right">
                    {quote.status === 'CONVERTED_TO_INVOICE' ? (
                      <a
                        href="http://localhost:3001"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"
                      >
                        <span>View Invoice</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <button
                        onClick={() => handlePushQuote(quote.id)}
                        disabled={pushingQuoteId === quote.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f7f6f2] hover:bg-[#1f2946] text-[#1f2946] hover:text-white rounded-md border border-[#e3ded5] hover:border-[#1f2946] font-semibold text-[11px] transition cursor-pointer shadow-2xs"
                        title="Directly create Accounts Receivable Invoice in TechM4 Finance ERP"
                      >
                        <Receipt className="w-3.5 h-3.5 text-[#c62d37]" />
                        <span>
                          {pushingQuoteId === quote.id ? 'Pushing...' : 'Push to Finance'}
                        </span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#88909f]">
                    No quotations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Preview Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#e3ded5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-[#e3ded5] bg-[#f7f6f2]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#c62d37]" />
                <div>
                  <h3 className="font-bold text-sm text-[#1f2946]">
                    Quotation: {selectedQuote.quoteNumber}
                  </h3>
                  <p className="text-[11px] text-[#5a6376]">
                    Issued for {selectedQuote.accountName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="p-1 text-[#88909f] hover:text-[#1f2946] rounded-md transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex justify-between items-start text-xs border-b border-[#e3ded5] pb-4">
                <div>
                  <div className="font-bold text-sm text-[#1f2946]">TECHM4INDIA INNOVATIONS PRIVATE LIMITED</div>
                  <div className="text-[#5a6376]">BOM &amp; Curriculum Solutions Division</div>
                  <div className="text-[#5a6376]">GSTIN: 36AABCT1234F1Z9</div>
                </div>
                <div className="text-right text-[#5a6376]">
                  <div>Date: {selectedQuote.date}</div>
                  <div>Valid Until: {selectedQuote.validUntil}</div>
                  <div className="mt-1">{getStatusBadge(selectedQuote.status)}</div>
                </div>
              </div>

              {/* Line items table */}
              <div className="border border-[#e3ded5] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f7f6f2] border-b border-[#e3ded5] text-[#5a6376] font-semibold">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e3ded5]">
                    {selectedQuote.lineItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-medium text-[#1f2946]">{item.description}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right font-mono">{formatInr(item.unitPrice)}</td>
                        <td className="p-3 text-right font-mono font-bold text-[#1f2946]">
                          {formatInr(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#5a6376]">
                    <span>Subtotal (Net):</span>
                    <span className="font-mono">{formatInr(selectedQuote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#5a6376]">
                    <span>CGST + SGST (18%):</span>
                    <span className="font-mono">{formatInr(selectedQuote.taxGst)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#1f2946] pt-1.5 border-t border-[#e3ded5]">
                    <span>Total Amount (INR):</span>
                    <span className="text-[#c62d37]">{formatInr(selectedQuote.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border-t border-[#e3ded5] bg-[#f7f6f2]">
              <button
                onClick={() => handlePushQuote(selectedQuote.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f2946] hover:bg-[#c62d37] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Receipt className="w-4 h-4" />
                <span>Push as Invoice to Finance ERP</span>
              </button>

              <button
                onClick={() => setSelectedQuote(null)}
                className="px-4 py-1.5 text-xs font-semibold text-[#1f2946] hover:bg-[#e3ded5] rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Quote Modal */}
      {isNewQuoteModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#e3ded5] shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3ded5]">
              <h3 className="font-bold text-sm text-[#1f2946]">Generate Institutional Quotation</h3>
              <button onClick={() => setIsNewQuoteModalOpen(false)}>
                <X className="w-4 h-4 text-[#88909f]" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                  Target Institution Client *
                </label>
                <select
                  required
                  value={quoteData.accountName}
                  onChange={(e) => setQuoteData({ ...quoteData, accountName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                  Associated Deal Title
                </label>
                <input
                  type="text"
                  value={quoteData.dealTitle}
                  onChange={(e) => setQuoteData({ ...quoteData, dealTitle: e.target.value })}
                  placeholder="e.g. Advanced AI/ML Center of Excellence"
                  className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                  Validity Expiry
                </label>
                <input
                  type="date"
                  required
                  value={quoteData.validUntil}
                  onChange={(e) => setQuoteData({ ...quoteData, validUntil: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 border-t border-[#e3ded5]">
                <h4 className="text-xs font-bold text-[#1f2946] mb-2">Itemized Equipment &amp; Training</h4>
                {quoteData.lineItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-center">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const copy = [...quoteData.lineItems];
                        copy[idx].description = e.target.value;
                        setQuoteData({ ...quoteData, lineItems: copy });
                      }}
                      className="col-span-8 px-2 py-1 bg-[#f7f6f2] border border-[#e3ded5] rounded text-xs"
                    />
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => {
                        const copy = [...quoteData.lineItems];
                        copy[idx].amount = Number(e.target.value);
                        copy[idx].unitPrice = Number(e.target.value);
                        setQuoteData({ ...quoteData, lineItems: copy });
                      }}
                      className="col-span-4 px-2 py-1 bg-[#f7f6f2] border border-[#e3ded5] rounded text-xs font-mono"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e3ded5]">
                <button
                  type="button"
                  onClick={() => setIsNewQuoteModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-[#5a6376] border border-[#e3ded5] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#c62d37] hover:bg-[#a8222b] text-white rounded-lg text-xs font-semibold"
                >
                  Save &amp; Generate Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
