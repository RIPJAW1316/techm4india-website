'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  FileText,
  Plus,
  Receipt,
} from 'lucide-react';
import { DivisionCode, InvoiceItem, InvoiceType } from '../types';

interface InvoicingPipelineProps {
  invoices: InvoiceItem[];
  onCreateInvoice: (inv: any) => void;
  onRecordPayment: (invoiceId: string, amount: number) => void;
}

export const InvoicingPipeline: React.FC<InvoicingPipelineProps> = ({
  invoices,
  onCreateInvoice,
  onRecordPayment,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // New Invoice Form State
  const [customerName, setCustomerName] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [stateCode, setStateCode] = useState('36'); // Telangana default
  const [division, setDivision] = useState<DivisionCode>('TECHM4_SOLUTIONS');
  const [type, setType] = useState<InvoiceType>('B2B');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10));

  const [items, setItems] = useState<
    Array<{
      description: string;
      hsnSacCode: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      gstRate: number;
    }>
  >([
    {
      description: '',
      hsnSacCode: '998313',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      gstRate: 18,
    },
  ]);

  const isIntraState = stateCode === '36';
  let calcSubtotal = 0;
  let calcTaxable = 0;
  let calcCgst = 0;
  let calcSgst = 0;
  let calcIgst = 0;

  items.forEach((item) => {
    const gross = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    const disc = Number(item.discount) || 0;
    const taxable = Math.max(0, gross - disc);
    const rate = Number(item.gstRate) || 18;

    calcSubtotal += gross;
    calcTaxable += taxable;

    if (isIntraState) {
      calcCgst += (taxable * (rate / 2)) / 100;
      calcSgst += (taxable * (rate / 2)) / 100;
    } else {
      calcIgst += (taxable * rate) / 100;
    }
  });

  const calcTotalAmount = calcTaxable + calcCgst + calcSgst + calcIgst;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: '',
        hsnSacCode: '999293',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        gstRate: 18,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) return;

    onCreateInvoice({
      customerName,
      customerGstin,
      stateCode,
      placeOfSupply: isIntraState ? 'Telangana (36)' : 'Inter-State',
      division,
      type,
      dueDate,
      subtotal: calcSubtotal,
      discount: calcSubtotal - calcTaxable,
      taxableAmount: calcTaxable,
      cgst: calcCgst,
      sgst: calcSgst,
      igst: calcIgst,
      totalAmount: calcTotalAmount,
      items: items.map((it) => {
        const taxable = it.quantity * it.unitPrice - it.discount;
        return {
          ...it,
          taxableAmount: taxable,
          cgstAmount: isIntraState ? (taxable * (it.gstRate / 2)) / 100 : 0,
          sgstAmount: isIntraState ? (taxable * (it.gstRate / 2)) / 100 : 0,
          igstAmount: !isIntraState ? (taxable * it.gstRate) / 100 : 0,
          totalAmount:
            taxable +
            (isIntraState
              ? (taxable * it.gstRate) / 100
              : (taxable * it.gstRate) / 100),
        };
      }),
    });

    setIsCreateModalOpen(false);
  };

  const filteredInvoices =
    filterStatus === 'ALL'
      ? invoices
      : invoices.filter((i) => i.status === filterStatus);

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const aging = invoices.reduce(
    (acc, inv) => {
      const balance = Number(inv.balanceDue) || 0;
      if (balance <= 0 || inv.status === 'PAID' || inv.status === 'CANCELLED') return acc;

      const dueTime = new Date(inv.dueDate).getTime();
      const overdueDays = Math.floor((now - dueTime) / dayMs);

      if (overdueDays <= 30) {
        acc.current += balance;
      } else if (overdueDays <= 60) {
        acc.thirtyToSixty += balance;
      } else if (overdueDays <= 90) {
        acc.sixtyToNinety += balance;
      } else {
        acc.overNinety += balance;
      }
      acc.total += balance;
      return acc;
    },
    { current: 0, thirtyToSixty: 0, sixtyToNinety: 0, overNinety: 0, total: 0 }
  );

  const formatInr = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);

  return (
    <div className="space-y-6">
      {/* AR Aging Radar Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="card-editorial p-3.5 bg-white">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5a6376]">Current (0-30 Days)</div>
          <div className="text-lg font-bold text-[#1f2946] mt-1 finance-num">{formatInr(aging.current)}</div>
          <span className="badge-tag badge-emerald mt-1 text-[10px]">Healthy</span>
        </div>

        <div className="card-editorial p-3.5 bg-white">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5a6376]">31-60 Days</div>
          <div className="text-lg font-bold text-[#1f2946] mt-1 finance-num">{formatInr(aging.thirtyToSixty)}</div>
          <span className="badge-tag badge-blue mt-1 text-[10px]">Normal Followup</span>
        </div>

        <div className="card-editorial p-3.5 bg-white">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5a6376]">61-90 Days</div>
          <div className="text-lg font-bold text-amber-700 mt-1 finance-num">{formatInr(aging.sixtyToNinety)}</div>
          <span className="badge-tag badge-amber mt-1 text-[10px]">Overdue Alert</span>
        </div>

        <div className="card-editorial p-3.5 bg-white">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5a6376]">90+ Days (Critical)</div>
          <div className="text-lg font-bold text-rose-700 mt-1 finance-num">{formatInr(aging.overNinety)}</div>
          <span className="badge-tag badge-rose mt-1 text-[10px]">Escalated to Director</span>
        </div>

        <div className="card-editorial p-3.5 bg-[#f7f6f2] border-blue-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-900">Total Receivables</div>
          <div className="text-lg font-bold text-[#0e1424] mt-1 finance-num">{formatInr(aging.total)}</div>
          <span className="badge-tag badge-muted mt-1 text-[10px]">5 Active Clients</span>
        </div>
      </div>

      {/* Action Bar & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e3ded5] pb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterStatus === st
                  ? 'bg-[#1f2946] text-white font-bold'
                  : 'text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#c62d37] hover:bg-[#a8222e] text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Create GST Invoice
        </button>
      </div>

      {/* Invoices List & Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices Table (2 cols) */}
        <div className="lg:col-span-2 card-editorial overflow-hidden bg-white">
          <div className="p-4 border-b border-[#e3ded5] flex items-center justify-between">
            <div className="text-sm font-bold text-[#1f2946] flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Institutional &amp; Client Invoices
            </div>
            <span className="text-xs text-[#5a6376]">{filteredInvoices.length} invoices found</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-editorial">
              <thead>
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Client Name</th>
                  <th className="py-2.5 px-3">Division</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                  <th className="py-2.5 px-3 text-right">Balance Due</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#94a3b8]">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#94a3b8]" />
                      <p className="font-semibold text-xs text-[#5a6376]">No tax invoices found</p>
                      <p className="text-[11px] text-[#94a3b8] mt-0.5">Click &quot;New Tax Invoice&quot; to issue your first invoice.</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                  const isSelected = selectedInvoice?.id === inv.id;
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-blue-50/80 text-blue-900 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-[#1f2946]">{inv.invoiceNumber}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#1f2946]">{inv.customerName}</div>
                        <div className="text-[11px] text-[#5a6376] font-mono">{inv.customerGstin || 'Unregistered B2C'}</div>
                      </td>
                      <td className="py-3 px-3 text-[#20283b]">
                        {inv.division.replace('TECHM4_', '').replace('_', ' ')}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#5a6376]">{inv.dueDate}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#0e1424]">
                        {formatInr(inv.totalAmount)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                        {formatInr(inv.balanceDue)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`badge-tag ${
                            inv.status === 'PAID'
                              ? 'badge-emerald'
                              : inv.status === 'OVERDUE'
                              ? 'badge-rose'
                              : inv.status === 'PARTIALLY_PAID'
                              ? 'badge-amber'
                              : 'badge-blue'
                          }`}
                        >
                          {inv.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Invoice Drill-down View */}
        <div className="card-editorial p-5 bg-white">
          {selectedInvoice ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#e3ded5] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#1f2946] font-mono">{selectedInvoice.invoiceNumber}</h3>
                  <div className="text-[#5a6376] text-[11px] mt-0.5">{selectedInvoice.issueDate} · Due {selectedInvoice.dueDate}</div>
                </div>
                <span
                  className={`badge-tag ${
                    selectedInvoice.status === 'PAID'
                      ? 'badge-emerald'
                      : selectedInvoice.status === 'OVERDUE'
                      ? 'badge-rose'
                      : 'badge-blue'
                  }`}
                >
                  {selectedInvoice.status}
                </span>
              </div>

              {/* Client Details */}
              <div className="p-3 rounded-lg bg-[#faf9f6] border border-[#e3ded5] space-y-1">
                <div className="font-bold text-[#1f2946] text-sm">{selectedInvoice.customerName}</div>
                <div className="text-[#5a6376] font-mono text-[11px]">GSTIN: {selectedInvoice.customerGstin || 'N/A'}</div>
                <div className="text-[#5a6376] text-[11px]">Place of Supply: {selectedInvoice.placeOfSupply}</div>
              </div>

              {/* Tax Breakup */}
              <div className="space-y-2 p-3 rounded-lg bg-[#faf9f6] border border-[#e3ded5]">
                <div className="flex justify-between text-[#20283b]">
                  <span>Taxable Value:</span>
                  <span className="font-mono font-semibold">{formatInr(selectedInvoice.taxableAmount)}</span>
                </div>
                {selectedInvoice.cgst > 0 && (
                  <div className="flex justify-between text-[#5a6376]">
                    <span>CGST (Intra-State 9%):</span>
                    <span className="font-mono">{formatInr(selectedInvoice.cgst)}</span>
                  </div>
                )}
                {selectedInvoice.sgst > 0 && (
                  <div className="flex justify-between text-[#5a6376]">
                    <span>SGST (Intra-State 9%):</span>
                    <span className="font-mono">{formatInr(selectedInvoice.sgst)}</span>
                  </div>
                )}
                {selectedInvoice.igst > 0 && (
                  <div className="flex justify-between text-[#5a6376]">
                    <span>IGST (Inter-State 18%):</span>
                    <span className="font-mono">{formatInr(selectedInvoice.igst)}</span>
                  </div>
                )}
                <div className="border-t border-[#e3ded5] pt-2 flex justify-between font-bold text-[#1f2946] text-sm">
                  <span>Total Invoice Value:</span>
                  <span className="font-mono text-emerald-700">{formatInr(selectedInvoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-amber-700 pt-1">
                  <span>Balance Due:</span>
                  <span className="font-mono">{formatInr(selectedInvoice.balanceDue)}</span>
                </div>
              </div>

              {/* Payment Link & IRN */}
              {selectedInvoice.razorpayPaymentLink && (
                <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200 space-y-1">
                  <div className="font-bold text-blue-900 flex items-center justify-between text-[11px]">
                    <span>Razorpay Payment Gateway Link:</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                  <div className="font-mono text-[11px] text-blue-700 truncate">
                    {selectedInvoice.razorpayPaymentLink}
                  </div>
                </div>
              )}

              {/* Action: Record Payment */}
              {selectedInvoice.balanceDue > 0 && (
                <button
                  onClick={() => {
                    setPaymentAmount(selectedInvoice.balanceDue);
                    setIsPaymentModalOpen(true);
                  }}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg text-xs transition"
                >
                  Record Customer Collection (Payment)
                </button>
              )}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-[#5a6376] text-xs">
              <FileText className="w-8 h-8 text-slate-300 mb-2" />
              Select an invoice to inspect tax breakdown, Razorpay link, and receipts
            </div>
          )}
        </div>
      </div>

      {/* CREATE INVOICE MODAL WITH INDIAN GST ENGINE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="card-editorial w-full max-w-4xl p-6 space-y-4 max-h-[90vh] overflow-y-auto bg-white">
            <div className="flex items-center justify-between border-b border-[#e3ded5] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1f2946] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Create GST-Compliant Tax Invoice
                </h3>
                <p className="text-xs text-[#5a6376]">
                  Auto-computes CGST + SGST (Telangana 36) or IGST (Other States)
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#5a6376] hover:text-[#1f2946] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[#1f2946] font-bold block mb-1">Customer / Institution Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Hyderabad Institute of Technology"
                    className="w-full bg-[#faf9f6] border border-[#e3ded5] rounded p-2 text-[#1f2946]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[#1f2946] font-bold block mb-1">Customer GSTIN (15 Digits)</label>
                  <input
                    type="text"
                    value={customerGstin}
                    onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                    placeholder="36AAACH1234F1Z5"
                    className="w-full bg-[#faf9f6] border border-[#e3ded5] rounded p-2 text-[#1f2946] font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#1f2946] font-bold block mb-1">Place of Supply (State Code)</label>
                  <select
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className="w-full bg-[#faf9f6] border border-[#e3ded5] rounded p-2 text-[#1f2946]"
                  >
                    <option value="36">36 - Telangana (Intra-State: CGST + SGST)</option>
                    <option value="29">29 - Karnataka (Inter-State: IGST)</option>
                    <option value="27">27 - Maharashtra (Inter-State: IGST)</option>
                    <option value="33">33 - Tamil Nadu (Inter-State: IGST)</option>
                    <option value="07">07 - Delhi (Inter-State: IGST)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[#1f2946] font-bold block mb-1">Division</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value as DivisionCode)}
                    className="w-full bg-[#faf9f6] border border-[#e3ded5] rounded p-2 text-[#1f2946]"
                  >
                    <option value="TECHM4_SOLUTIONS">TechM4Solutions</option>
                    <option value="TECHM4_ENGINEERING">TechM4Engineering</option>
                    <option value="TECHM4_SCHOOLS">TechM4Schools</option>
                    <option value="TECHM4_SPACE">TechM4Space Technology</option>
                    <option value="HORIZON_INSTITUTES">Horizon Startup School</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#1f2946] font-bold block mb-1">Invoice Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as InvoiceType)}
                    className="w-full bg-[#faf9f6] border border-[#e3ded5] rounded p-2 text-[#1f2946]"
                  >
                    <option value="B2B">B2B (Regular with GSTIN)</option>
                    <option value="B2C">B2C (Consumer Retail)</option>
                    <option value="B2G">B2G (Government / Tender)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#1f2946] font-bold block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#faf9f6] border border-[#e3ded5] rounded p-2 text-[#1f2946]"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1f2946]">Line Items &amp; Services</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    + Add Item
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 bg-[#faf9f6] p-2.5 rounded-lg border border-[#e3ded5]">
                    <div className="col-span-5">
                      <label className="text-[10px] text-[#5a6376] block">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="w-full bg-transparent border-b border-[#e3ded5] py-1 text-[#1f2946]"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-[#5a6376] block">HSN/SAC</label>
                      <input
                        type="text"
                        value={item.hsnSacCode}
                        onChange={(e) => handleItemChange(idx, 'hsnSacCode', e.target.value)}
                        className="w-full bg-transparent border-b border-[#e3ded5] py-1 text-[#1f2946] font-mono"
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] text-[#5a6376] block">Qty</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent border-b border-[#e3ded5] py-1 text-[#1f2946] text-right"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-[#5a6376] block">Price (₹)</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent border-b border-[#e3ded5] py-1 text-[#1f2946] text-right font-mono"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] text-[#5a6376] block">GST %</label>
                      <select
                        value={item.gstRate}
                        onChange={(e) => handleItemChange(idx, 'gstRate', parseFloat(e.target.value) || 18)}
                        className="w-full bg-transparent border-b border-[#e3ded5] py-1 text-[#1f2946]"
                      >
                        <option value="18">18%</option>
                        <option value="12">12%</option>
                        <option value="5">5%</option>
                        <option value="0">0%</option>
                      </select>
                    </div>
                    <div className="col-span-1 flex items-center justify-center pt-3">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-[#5a6376] hover:text-rose-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Tax Summary Card */}
              <div className="p-3.5 rounded-lg bg-[#faf9f6] border border-[#e3ded5] space-y-1.5 font-mono">
                <div className="flex justify-between text-[#20283b]">
                  <span>Gross Taxable Value:</span>
                  <span>{formatInr(calcTaxable)}</span>
                </div>
                {isIntraState ? (
                  <>
                    <div className="flex justify-between text-blue-700 font-semibold">
                      <span>CGST (Intra-State 9%):</span>
                      <span>+{formatInr(calcCgst)}</span>
                    </div>
                    <div className="flex justify-between text-blue-700 font-semibold">
                      <span>SGST (Intra-State 9%):</span>
                      <span>+{formatInr(calcSgst)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-blue-700 font-semibold">
                    <span>IGST (Inter-State 18%):</span>
                    <span>+{formatInr(calcIgst)}</span>
                  </div>
                )}
                <div className="border-t border-[#e3ded5] pt-1.5 flex justify-between font-bold text-emerald-800 text-sm">
                  <span>Total Payable:</span>
                  <span>{formatInr(calcTotalAmount)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e3ded5]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded bg-slate-100 text-[#1f2946] font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#c62d37] hover:bg-[#a8222e] text-white font-semibold"
                >
                  Generate Invoice &amp; Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="card-editorial w-full max-w-md p-5 space-y-4 bg-white">
            <h3 className="text-base font-bold text-[#1f2946] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              Record Inward Payment
            </h3>
            <p className="text-xs text-[#5a6376]">
              Applying collection against invoice <strong className="text-[#1f2946]">{selectedInvoice.invoiceNumber}</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#1f2946] font-bold block mb-1">Collection Amount (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  max={selectedInvoice.balanceDue}
                  className="w-full bg-[#faf9f6] border border-[#e3ded5] rounded p-2 text-[#1f2946] font-mono text-base font-bold"
                />
                <span className="text-[11px] text-[#5a6376] mt-0.5 block">
                  Remaining balance due: {formatInr(selectedInvoice.balanceDue)}
                </span>
              </div>

              <div>
                <label className="text-[#1f2946] font-bold block mb-1">Payment Method</label>
                <select className="w-full bg-[#faf9f6] border border-[#e3ded5] rounded p-2 text-[#1f2946]">
                  <option>NEFT / RTGS Corporate Transfer</option>
                  <option>Razorpay Gateway Webhook</option>
                  <option>UPI Corporate Handle</option>
                  <option>Cheque / DD</option>
                </select>
              </div>

              <div>
                <label className="text-[#1f2946] font-bold block mb-1">Bank UTR / Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC882194821"
                  className="w-full bg-[#faf9f6] border border-[#e3ded5] rounded p-2 text-[#1f2946] font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e3ded5]">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 text-[#1f2946] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onRecordPayment(selectedInvoice.id, paymentAmount);
                    setIsPaymentModalOpen(false);
                  }}
                  className="px-3.5 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-semibold"
                >
                  Confirm Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
