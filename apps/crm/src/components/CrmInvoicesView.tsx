'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  IndianRupee,
  Layers,
  Printer,
  QrCode,
  Receipt,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { DivisionCode, InvoiceItem } from '../types';

interface CrmInvoicesViewProps {
  invoices: InvoiceItem[];
  onRecordPayment: (invoiceId: string, amount: number) => void;
  onRefresh?: () => void;
}

export const CrmInvoicesView: React.FC<CrmInvoicesViewProps> = ({
  invoices,
  onRecordPayment,
  onRefresh,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'SENT' | 'PARTIALLY_PAID' | 'OVERDUE' | 'DRAFT'>('ALL');
  const [selectedDivision, setSelectedDivision] = useState<DivisionCode>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<InvoiceItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentUtr, setPaymentUtr] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    const matchesDivision = selectedDivision === 'ALL' || inv.division === selectedDivision;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q) ||
      (inv.dealTitle && inv.dealTitle.toLowerCase().includes(q)) ||
      (inv.customerGstin && inv.customerGstin.toLowerCase().includes(q));
    return matchesStatus && matchesDivision && matchesSearch;
  });

  // Financial aggregates
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const totalReceivable = invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
  const overdueCount = invoices.filter((inv) => inv.status === 'OVERDUE').length;

  const handleCopyLink = (url?: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenPaymentModal = (inv: InvoiceItem) => {
    setPaymentModalInvoice(inv);
    setPaymentAmount(inv.balanceDue || inv.totalAmount);
    setPaymentUtr(`UTR-SBIN-${Date.now().toString().slice(-6)}`);
  };

  const handleConfirmPayment = () => {
    if (paymentModalInvoice && paymentAmount > 0) {
      onRecordPayment(paymentModalInvoice.id, paymentAmount);
      setPaymentModalInvoice(null);
    }
  };

  const getStatusBadge = (status: InvoiceItem['status']) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            PAID
          </span>
        );
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Send className="w-3 h-3 text-blue-600" />
            SENT
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            PARTIALLY PAID
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            OVERDUE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-50 text-gray-700 border border-gray-200">
            DRAFT
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#fbfaf8] overflow-y-auto">
      {/* Top Banner & Header */}
      <div className="bg-white border-b border-[#e3ded5] px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h1 className="text-xl font-bold text-[#1f2946] tracking-tight">
                Finance ERP Invoices &amp; Receivables
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Integrated Window
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-[#5a6376] mt-1">
              Synchronized view with Finance ERP (Port :3001) &amp; automated quote-to-tax-invoice billing lifecycle.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e3ded5] text-[#1f2946] text-xs font-semibold rounded-lg hover:bg-[#f7f6f2] transition cursor-pointer"
                title="Refresh latest invoices from Finance ERP"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#5a6376]" />
                <span>Sync with Finance</span>
              </button>
            )}
            <div className="px-3 py-1.5 bg-[#f1f5f9] border border-[#cbd5e1] rounded-lg text-xs font-mono font-medium text-[#334155]">
              GSTIN: 36AAACT0000A1Z5
            </div>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3 bg-[#f7f6f2] border border-[#e3ded5] rounded-xl">
            <span className="text-[10px] font-bold text-[#5a6376] uppercase tracking-wider">
              Total Invoiced
            </span>
            <div className="text-lg font-black text-[#1f2946] mt-0.5">
              ₹{(totalInvoiced / 100000).toFixed(2)} L
            </div>
            <span className="text-[10px] text-[#5a6376]">{invoices.length} total tax invoices</span>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              Realized Collections
            </span>
            <div className="text-lg font-black text-emerald-800 mt-0.5">
              ₹{(totalCollected / 100000).toFixed(2)} L
            </div>
            <span className="text-[10px] text-emerald-600">Settled via Bank / Razorpay</span>
          </div>

          <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              Outstanding Balance
            </span>
            <div className="text-lg font-black text-blue-800 mt-0.5">
              ₹{(totalReceivable / 100000).toFixed(2)} L
            </div>
            <span className="text-[10px] text-blue-600">Active accounts receivable</span>
          </div>

          <div className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
              Overdue Collections
            </span>
            <div className="text-lg font-black text-rose-800 mt-0.5">
              {overdueCount} Invoices
            </div>
            <span className="text-[10px] text-rose-600">Requires follow-up</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="px-6 py-3 bg-white border-b border-[#e3ded5] flex flex-wrap items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'PAID', 'SENT', 'PARTIALLY_PAID', 'OVERDUE'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#1f2946] text-white shadow-xs'
                  : 'text-[#5a6376] hover:bg-[#f7f6f2] hover:text-[#1f2946]'
              }`}
            >
              {st === 'ALL' ? 'All Invoices' : st.replace('_', ' ')}
              <span
                className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === st ? 'bg-white/20 text-white' : 'bg-[#e3ded5] text-[#5a6376]'
                }`}
              >
                {st === 'ALL' ? invoices.length : invoices.filter((i) => i.status === st).length}
              </span>
            </button>
          ))}
        </div>

        {/* Division & Search */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value as DivisionCode)}
            className="px-2.5 py-1.5 text-xs bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-[#1f2946] font-semibold focus:outline-none focus:border-[#1f2946]"
          >
            <option value="ALL">All Business Divisions</option>
            <option value="TECHM4_ENGINEERING">TechM4 Engineering</option>
            <option value="TECHM4_SCHOOLS">TechM4 Schools</option>
            <option value="TECHM4_SOLUTIONS">TechM4 Solutions</option>
            <option value="TECHM4_SPACE">TechM4 Space</option>
            <option value="HORIZON_INSTITUTES">Horizon Institutes</option>
          </select>

          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#5a6376] absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Invoice # or Client..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-[#1f2946] placeholder-[#5a6376] focus:outline-none focus:bg-white focus:border-[#1f2946]"
            />
          </div>
        </div>
      </div>

      {/* Main Invoices Table */}
      <div className="px-6 py-5">
        <div className="bg-white border border-[#e3ded5] rounded-xl shadow-xs overflow-hidden">
          {filteredInvoices.length === 0 ? (
            <div className="py-12 text-center">
              <Receipt className="w-10 h-10 text-[#5a6376] mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-[#1f2946]">No invoices match your filter</p>
              <p className="text-xs text-[#5a6376] mt-1">
                Try switching the division or status filter, or push an accepted Quote from the Quotes tab.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f7f6f2] text-[#5a6376] font-bold uppercase tracking-wider text-[10px] border-b border-[#e3ded5]">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Institution / Customer</th>
                    <th className="py-3 px-4">Division</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4 text-right">Taxable Subtotal</th>
                    <th className="py-3 px-4 text-right">GST (18%)</th>
                    <th className="py-3 px-4 text-right">Total Payable</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1efe9]">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#fbfaf8] transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1f2946]">
                        <div className="flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-blue-600" />
                          <span>{inv.invoiceNumber}</span>
                        </div>
                        {inv.quoteNumber && (
                          <div className="text-[10px] text-[#5a6376] font-normal mt-0.5">
                            Ref: {inv.quoteNumber}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#1f2946] flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{inv.customerName}</span>
                        </div>
                        {inv.dealTitle && (
                          <div className="text-[10px] text-[#5a6376] truncate max-w-xs mt-0.5">
                            {inv.dealTitle}
                          </div>
                        )}
                        {inv.customerGstin && (
                          <div className="text-[10px] font-mono text-[#5a6376] mt-0.5">
                            GSTIN: {inv.customerGstin}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#f1f5f9] text-[#334155] border border-[#cbd5e1]">
                          {inv.division.replace('TECHM4_', '').replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#5a6376] text-[11px]">
                        <div>Issued: {inv.issueDate}</div>
                        <div className={`mt-0.5 ${inv.status === 'OVERDUE' ? 'text-rose-600 font-bold' : ''}`}>
                          Due: {inv.dueDate}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-medium text-[#1f2946]">
                        ₹{inv.subtotal.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-[#5a6376]">
                        ₹{(inv.cgst + inv.sgst + inv.igst).toLocaleString('en-IN')}
                        <div className="text-[9px] text-[#5a6376]">
                          {inv.igst > 0 ? 'IGST 18%' : 'CGST 9% + SGST 9%'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-black text-[#1f2946]">
                        ₹{inv.totalAmount.toLocaleString('en-IN')}
                        {inv.balanceDue > 0 && inv.status !== 'PAID' && (
                          <div className="text-[10px] font-normal text-rose-600">
                            Due: ₹{inv.balanceDue.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(inv.status)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(inv)}
                            className="p-1 text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9] rounded transition cursor-pointer"
                            title="Inspect Tax Invoice breakdown"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {inv.status !== 'PAID' && (
                            <button
                              type="button"
                              onClick={() => handleOpenPaymentModal(inv)}
                              className="px-2 py-1 bg-emerald-600 text-white rounded font-semibold text-[10px] hover:bg-emerald-700 transition cursor-pointer shadow-2xs"
                              title="Record payment against invoice"
                            >
                              Record Payment
                            </button>
                          )}

                          {inv.razorpayPaymentLink && (
                            <button
                              type="button"
                              onClick={() => handleCopyLink(inv.razorpayPaymentLink)}
                              className="p-1 text-[#5a6376] hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                              title="Copy Razorpay Payment Link"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 1. Tax Invoice Modal (Zoho / GST Invoice Format) */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#e3ded5]">
            <div className="p-6 border-b border-[#e3ded5] flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1f2946] text-white flex items-center justify-center font-bold text-xs">
                  TM4
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1f2946] font-mono">
                    {selectedInvoice.invoiceNumber}
                  </h3>
                  <p className="text-[11px] text-[#5a6376]">
                    Tax Invoice issued under GST Section 31 (Rule 46)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="p-1 text-[#5a6376] hover:text-[#1f2946] rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-[#1f2946]">
              {/* Header Details */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#f1efe9]">
                <div>
                  <span className="text-[10px] font-bold text-[#5a6376] uppercase">Supplier Details</span>
                  <p className="font-bold text-sm text-[#1f2946] mt-0.5">TECHM4INDIA PRIVATE LIMITED</p>
                  <p className="text-[#5a6376] text-[11px]">HITEC City, Hyderabad, Telangana - 500081</p>
                  <p className="font-mono text-[11px] mt-1">GSTIN: <strong>36AAACT0000A1Z5</strong></p>
                  <p className="text-[11px] text-[#5a6376]">State: Telangana (Code: 36)</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#5a6376] uppercase">Billed To (Customer)</span>
                  <p className="font-bold text-sm text-[#1f2946] mt-0.5">{selectedInvoice.customerName}</p>
                  <p className="font-mono text-[11px] mt-1">
                    GSTIN: <strong>{selectedInvoice.customerGstin || '36AAACA1234F1Z8'}</strong>
                  </p>
                  <p className="text-[11px] text-[#5a6376]">State: Telangana (Code: 36) | Place of Supply: 36-Telangana</p>
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-[#f7f6f2] rounded-xl border border-[#e3ded5] text-[11px]">
                <div>
                  <span className="text-[#5a6376]">Issue Date:</span>
                  <div className="font-semibold text-[#1f2946]">{selectedInvoice.issueDate}</div>
                </div>
                <div>
                  <span className="text-[#5a6376]">Payment Due:</span>
                  <div className="font-semibold text-[#1f2946]">{selectedInvoice.dueDate}</div>
                </div>
                <div>
                  <span className="text-[#5a6376]">Status:</span>
                  <div className="mt-0.5">{getStatusBadge(selectedInvoice.status)}</div>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <span className="text-[10px] font-bold text-[#5a6376] uppercase tracking-wider">
                  Goods / Services Supplied
                </span>
                <table className="w-full text-left mt-2 border border-[#e3ded5] rounded-lg overflow-hidden">
                  <thead className="bg-[#f7f6f2] text-[10px] uppercase font-bold text-[#5a6376] border-b border-[#e3ded5]">
                    <tr>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-2 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Rate</th>
                      <th className="py-2 px-3 text-right">Taxable</th>
                      <th className="py-2 px-3 text-right">GST</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1efe9]">
                    {(selectedInvoice.items && selectedInvoice.items.length > 0
                      ? selectedInvoice.items
                      : [
                          {
                            description: selectedInvoice.dealTitle || 'Educational Lab Equipment & Engineering Solutions',
                            quantity: 1,
                            unitPrice: selectedInvoice.subtotal,
                            taxableAmount: selectedInvoice.subtotal,
                            gstRate: 18,
                            cgstAmount: selectedInvoice.cgst,
                            sgstAmount: selectedInvoice.sgst,
                            igstAmount: selectedInvoice.igst,
                            totalAmount: selectedInvoice.totalAmount,
                          },
                        ]
                    ).map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-semibold text-[#1f2946]">{item.description}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-right font-mono">₹{item.taxableAmount.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#5a6376]">
                          ₹{(item.cgstAmount + item.sgstAmount + item.igstAmount).toLocaleString('en-IN')} (18%)
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#1f2946]">
                          ₹{item.totalAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tax Calculations */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#5a6376]">
                    <span>Taxable Value:</span>
                    <span className="font-mono text-[#1f2946]">₹{selectedInvoice.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedInvoice.cgst > 0 && (
                    <div className="flex justify-between text-[#5a6376]">
                      <span>CGST (9.00%):</span>
                      <span className="font-mono text-[#1f2946]">₹{selectedInvoice.cgst.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {selectedInvoice.sgst > 0 && (
                    <div className="flex justify-between text-[#5a6376]">
                      <span>SGST (9.00%):</span>
                      <span className="font-mono text-[#1f2946]">₹{selectedInvoice.sgst.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {selectedInvoice.igst > 0 && (
                    <div className="flex justify-between text-[#5a6376]">
                      <span>IGST (18.00%):</span>
                      <span className="font-mono text-[#1f2946]">₹{selectedInvoice.igst.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm pt-2 border-t border-[#e3ded5] text-[#1f2946]">
                    <span>Total Invoice Value:</span>
                    <span className="font-mono text-emerald-800">
                      ₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {selectedInvoice.balanceDue > 0 && (
                    <div className="flex justify-between font-bold text-xs pt-1 text-rose-600">
                      <span>Balance Outstanding:</span>
                      <span className="font-mono">₹{selectedInvoice.balanceDue.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Digital Signature & IRN QR */}
              {selectedInvoice.irn && (
                <div className="p-3 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl flex items-center justify-between text-[10px]">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#334155]">Government E-Invoice Verified (GSTN Portal)</span>
                    <div className="font-mono text-[#64748b] truncate max-w-sm">
                      IRN: {selectedInvoice.irn}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    e-Way Bill Eligible
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[#f1efe9]">
                <div className="flex items-center gap-2">
                  {selectedInvoice.razorpayPaymentLink && (
                    <button
                      type="button"
                      onClick={() => handleCopyLink(selectedInvoice.razorpayPaymentLink)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedLink ? 'Copied Link!' : 'Copy Payment Link'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Printing Invoice ${selectedInvoice.invoiceNumber}...`);
                    }}
                    className="px-3 py-1.5 bg-[#f7f6f2] hover:bg-[#e3ded5] text-[#1f2946] border border-[#e3ded5] rounded-lg font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#5a6376]" />
                    <span>Print Invoice</span>
                  </button>

                  {selectedInvoice.status !== 'PAID' && (
                    <button
                      type="button"
                      onClick={() => {
                        const inv = selectedInvoice;
                        setSelectedInvoice(null);
                        handleOpenPaymentModal(inv);
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Record Payment</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Record Payment Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#e3ded5] p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1efe9]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-[#1f2946]">Record Collection Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
                className="text-[#5a6376] hover:text-[#1f2946] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-[#5a6376] font-semibold mb-1">Invoice</label>
                <div className="p-2.5 bg-[#f7f6f2] rounded-lg border border-[#e3ded5] font-mono font-bold text-[#1f2946]">
                  {paymentModalInvoice.invoiceNumber} — {paymentModalInvoice.customerName}
                </div>
              </div>

              <div>
                <label className="block text-[#5a6376] font-semibold mb-1">Payment Amount (INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-[#5a6376]">₹</span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    max={paymentModalInvoice.totalAmount}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-[#e3ded5] focus:border-emerald-600 rounded-lg text-sm font-mono font-bold text-[#1f2946] focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-[#5a6376] mt-1">
                  Total invoice value: ₹{paymentModalInvoice.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <label className="block text-[#5a6376] font-semibold mb-1">Bank UTR / Transaction Reference</label>
                <input
                  type="text"
                  value={paymentUtr}
                  onChange={(e) => setPaymentUtr(e.target.value)}
                  placeholder="e.g. UTR-HDFC-991208"
                  className="w-full px-3 py-2 bg-white border border-[#e3ded5] focus:border-[#1f2946] rounded-lg font-mono text-xs text-[#1f2946] focus:outline-none"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Direct Double-Entry Settlement
                </div>
                <p>
                  Recording this receipt automatically settles customer balance in Finance ERP and updates Accounts Receivable.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-3 py-1.5 bg-[#f7f6f2] text-[#5a6376] rounded-lg font-semibold hover:bg-[#e3ded5] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition cursor-pointer shadow-xs"
                >
                  Confirm &amp; Post Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
