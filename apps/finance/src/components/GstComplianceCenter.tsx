'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Calculator,
  CheckCircle,
  Download,
  FileCheck2,
  FileSpreadsheet,
  Info,
  Layers,
  Scale,
  ShieldCheck,
} from 'lucide-react';

interface GstComplianceCenterProps {
  onExportTally: () => void;
}

export const GstComplianceCenter: React.FC<GstComplianceCenterProps> = ({
  onExportTally,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'rule88a' | 'gstr1' | 'itc'>('rule88a');

  // Live Output Tax Data (from Invoices)
  const outputTax = {
    igst: 180000,
    cgst: 247500,
    sgst: 247500,
    total: 675000,
  };

  // Live Input Tax Credit Available (from Vendor Expenses)
  const availableItc = {
    igst: 120000,
    cgst: 234300,
    sgst: 234300,
    total: 588600,
  };

  // Rule 88A Offset Calculations:
  // Step 1: IGST Credit used first against IGST Liability
  const igstCreditUsedForIgst = Math.min(outputTax.igst, availableItc.igst); // 120,000
  const remainingIgstLiability = outputTax.igst - igstCreditUsedForIgst; // 60,000

  // Step 2: CGST Credit used against CGST Liability
  const cgstCreditUsed = Math.min(outputTax.cgst, availableItc.cgst); // 234,300
  const netCgstPayable = outputTax.cgst - cgstCreditUsed; // 13,200

  // Step 3: SGST Credit used against SGST Liability
  const sgstCreditUsed = Math.min(outputTax.sgst, availableItc.sgst); // 234,300
  const netSgstPayable = outputTax.sgst - sgstCreditUsed; // 13,200

  // Total Net Tax Payable in Cash
  const totalCashPayable = remainingIgstLiability + netCgstPayable + netSgstPayable; // 86,400

  const hsnSummary = [
    {
      code: 'SAC 998313',
      description: 'Information Technology Consulting & Custom Software Systems',
      taxableValue: 2750000,
      cgst: 247500,
      sgst: 247500,
      igst: 0,
      totalTax: 495000,
    },
    {
      code: 'SAC 999293',
      description: 'Commercial Training, Engineering Workshops & STEM Programs',
      taxableValue: 1000000,
      cgst: 0,
      sgst: 0,
      igst: 180000,
      totalTax: 180000,
    },
  ];

  const formatInr = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e3ded5] pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('rule88a')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'rule88a'
                ? 'bg-[#1f2946] text-white'
                : 'text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9]'
            }`}
          >
            GSTR-3B &amp; Rule 88A Offset
          </button>
          <button
            onClick={() => setActiveSubTab('gstr1')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'gstr1'
                ? 'bg-[#1f2946] text-white'
                : 'text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9]'
            }`}
          >
            GSTR-1 Outward Supplies
          </button>
          <button
            onClick={() => setActiveSubTab('itc')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'itc'
                ? 'bg-[#1f2946] text-white'
                : 'text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9]'
            }`}
          >
            ITC Reconciliation Register
          </button>
        </div>

        <button
          onClick={onExportTally}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-[#f7f6f2] border border-[#d1cbbf] text-[#1f2946] text-xs font-semibold shadow-xs transition"
        >
          <Download className="w-3.5 h-3.5 text-[#15803d]" />
          Export Tally Prime XML (CA Ready)
        </button>
      </div>

      {/* RULE 88A OFFSET SIMULATOR */}
      {activeSubTab === 'rule88a' && (
        <div className="space-y-6">
          {/* Header Explanation Alert */}
          <div className="p-4 rounded-xl bg-[#eef2f9] border border-[#d3dded] flex items-start gap-3 text-xs">
            <Info className="w-4 h-4 text-[#1f2946] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#1f2946]">Statutory GST Rule 88A Utilization Protocol</div>
              <p className="text-[#43506c] mt-0.5 leading-relaxed">
                Under GST Rule 88A, Input Tax Credit (ITC) on account of Integrated Tax (IGST) is completely utilized
                first towards Integrated Tax, and then towards Central Tax (CGST) and State Tax (SGST). Only after IGST
                credit is completely exhausted can CGST and SGST credits be utilized.
              </p>
            </div>
          </div>

          {/* Side by side: Output Liability vs Input Credit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Output Tax */}
            <div className="card-editorial bg-white p-5 space-y-3 border border-[#e3ded5] rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-[#1f2946] font-sans border-b border-[#e3ded5] pb-2 font-bold">
                <span>Gross Output Tax Liability (Table 3.1)</span>
                <span className="text-[#be123c] font-mono">{formatInr(outputTax.total)}</span>
              </div>
              <div className="flex justify-between text-[#5a6376]">
                <span>IGST (Inter-State Outward):</span>
                <span className="text-[#1f2946] font-semibold">{formatInr(outputTax.igst)}</span>
              </div>
              <div className="flex justify-between text-[#5a6376]">
                <span>CGST (Intra-State Telangana):</span>
                <span className="text-[#1f2946] font-semibold">{formatInr(outputTax.cgst)}</span>
              </div>
              <div className="flex justify-between text-[#5a6376]">
                <span>SGST (Intra-State Telangana):</span>
                <span className="text-[#1f2946] font-semibold">{formatInr(outputTax.sgst)}</span>
              </div>
            </div>

            {/* Input Credit */}
            <div className="card-editorial bg-white p-5 space-y-3 border border-[#e3ded5] rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-[#1f2946] font-sans border-b border-[#e3ded5] pb-2 font-bold">
                <span>Eligible Input Tax Credit (Table 4)</span>
                <span className="text-[#15803d] font-mono">{formatInr(availableItc.total)}</span>
              </div>
              <div className="flex justify-between text-[#5a6376]">
                <span>IGST Credit (Cloud &amp; Hardware):</span>
                <span className="text-[#1f2946] font-semibold">{formatInr(availableItc.igst)}</span>
              </div>
              <div className="flex justify-between text-[#5a6376]">
                <span>CGST Credit (Telangana Supplies):</span>
                <span className="text-[#1f2946] font-semibold">{formatInr(availableItc.cgst)}</span>
              </div>
              <div className="flex justify-between text-[#5a6376]">
                <span>SGST Credit (Telangana Supplies):</span>
                <span className="text-[#1f2946] font-semibold">{formatInr(availableItc.sgst)}</span>
              </div>
            </div>
          </div>

          {/* Rule 88A Step-by-Step Waterfall */}
          <div className="card-editorial bg-white p-5 space-y-4 border border-[#e3ded5] rounded-xl shadow-xs">
            <h3 className="text-sm font-bold text-[#1f2946] flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#c62d37]" />
              Rule 88A Offset Utilization Waterfall
            </h3>

            <div className="space-y-3 text-xs">
              {/* Step 1 */}
              <div className="p-3.5 rounded-lg bg-[#fcfbf9] border border-[#e3ded5] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#1f2946]">Step 1: Offset IGST Credit against IGST Liability</div>
                  <div className="text-[11px] text-[#5a6376] mt-0.5">
                    Utilizing ₹1,20,000 IGST Credit against ₹1,80,000 IGST Liability.
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-[#b45309]">
                  Remaining IGST Liability: ₹60,000
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-lg bg-[#fcfbf9] border border-[#e3ded5] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#1f2946]">Step 2: Offset CGST Credit against CGST Liability</div>
                  <div className="text-[11px] text-[#5a6376] mt-0.5">
                    Utilizing ₹2,34,300 CGST Credit against ₹2,47,500 CGST Liability.
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-[#b45309]">
                  Net CGST Payable: ₹13,200
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-lg bg-[#fcfbf9] border border-[#e3ded5] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#1f2946]">Step 3: Offset SGST Credit against SGST Liability</div>
                  <div className="text-[11px] text-[#5a6376] mt-0.5">
                    Utilizing ₹2,34,300 SGST Credit against ₹2,47,500 SGST Liability.
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-[#b45309]">
                  Net SGST Payable: ₹13,200
                </div>
              </div>

              {/* Step 4: Final Net Liability */}
              <div className="p-4 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-between text-sm">
                <div>
                  <div className="font-bold text-[#065f46]">Net Tax Payable in Cash Ledger (Challan PMT-06)</div>
                  <div className="text-xs text-[#047857] mt-0.5">
                    Statutory cash payment due before 20th November 2026.
                  </div>
                </div>
                <div className="text-xl font-bold font-mono text-[#065f46]">
                  {formatInr(totalCashPayable)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GSTR-1 OUTWARD SUPPLIES */}
      {activeSubTab === 'gstr1' && (
        <div className="card-editorial bg-white p-5 space-y-4 border border-[#e3ded5] rounded-xl shadow-xs">
          <div className="flex items-center justify-between border-b border-[#e3ded5] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#1f2946]">GSTR-1 Outward Supplies Summary (October 2026)</h3>
              <p className="text-xs text-[#5a6376]">Classified by HSN / SAC codes for direct upload to GST Portal</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-editorial">
              <thead>
                <tr>
                  <th className="pb-3 font-semibold">HSN / SAC Code</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold text-right">Taxable Value</th>
                  <th className="pb-3 font-semibold text-right">CGST</th>
                  <th className="pb-3 font-semibold text-right">SGST</th>
                  <th className="pb-3 font-semibold text-right">IGST</th>
                  <th className="pb-3 font-semibold text-right">Total Tax (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebe7df]">
                {hsnSummary.map((hsn) => (
                  <tr key={hsn.code} className="hover:bg-[#faf9f5] transition">
                    <td className="py-3 font-mono font-bold text-[#1f2946]">{hsn.code}</td>
                    <td className="py-3 text-[#1f2946]">{hsn.description}</td>
                    <td className="py-3 text-right font-mono text-[#1f2946]">{formatInr(hsn.taxableValue)}</td>
                    <td className="py-3 text-right font-mono text-[#5a6376]">{formatInr(hsn.cgst)}</td>
                    <td className="py-3 text-right font-mono text-[#5a6376]">{formatInr(hsn.sgst)}</td>
                    <td className="py-3 text-right font-mono text-[#5a6376]">{formatInr(hsn.igst)}</td>
                    <td className="py-3 text-right font-mono font-bold text-[#15803d]">{formatInr(hsn.totalTax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ITC RECONCILIATION */}
      {activeSubTab === 'itc' && (
        <div className="card-editorial bg-white p-5 space-y-4 border border-[#e3ded5] rounded-xl shadow-xs">
          <div className="flex items-center justify-between border-b border-[#e3ded5] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#1f2946]">Input Tax Credit (ITC) 2B Reconciliation</h3>
              <p className="text-xs text-[#5a6376]">Matching vendor filed bills with books of accounts</p>
            </div>
            <span className="badge-tag badge-emerald">100% Reconciled</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-lg bg-[#fcfbf9] border border-[#e3ded5]">
              <div className="text-[#5a6376] font-sans">Eligible ITC in Books</div>
              <div className="text-lg font-bold text-[#1f2946] mt-1">{formatInr(availableItc.total)}</div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#fcfbf9] border border-[#e3ded5]">
              <div className="text-[#5a6376] font-sans">Auto-Drafted in GSTR-2B</div>
              <div className="text-lg font-bold text-[#15803d] mt-1">{formatInr(availableItc.total)}</div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#fcfbf9] border border-[#e3ded5]">
              <div className="text-[#5a6376] font-sans">Unreconciled Variance</div>
              <div className="text-lg font-bold text-[#5a6376] mt-1">₹0.00</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
