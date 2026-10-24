import React, { useState } from 'react';
import {
  CheckCircle2,
  DollarSign,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Printer,
  ShieldCheck,
  X,
} from 'lucide-react';
import { PayrollRecordItem } from '../types';

interface HrmsPayrollProps {
  payrollRecords: PayrollRecordItem[];
}

export const HrmsPayroll: React.FC<HrmsPayrollProps> = ({ payrollRecords }) => {
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecordItem | null>(null);

  const totalGross = payrollRecords.reduce((acc, r) => acc + r.grossSalary, 0);
  const totalNet = payrollRecords.reduce((acc, r) => acc + r.netPay, 0);
  const totalTds = payrollRecords.reduce((acc, r) => acc + r.tdsDeduction, 0);
  const totalPf = payrollRecords.reduce((acc, r) => acc + r.pfDeduction, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#e3ded5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1f2946] tracking-tight">
            Indian Statutory Payroll &amp; Payslip Register
          </h2>
          <p className="text-xs text-[#5a6376] mt-1">
            Compliant with EPF Act 1952, ESI Act 1948, Telangana Professional Tax Act &amp; Section 192 TDS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-xs font-bold font-mono">
            Cycle: 01 Oct 2026 – 31 Oct 2026
          </span>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#e3ded5] shadow-xs">
          <span className="text-[11px] font-bold text-[#5a6376] uppercase">Gross Payroll Batch</span>
          <div className="text-2xl font-black text-[#1f2946] mt-1">
            ₹{totalGross.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#5a6376]">October 2026 earnings</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#e3ded5] shadow-xs">
          <span className="text-[11px] font-bold text-[#5a6376] uppercase">Net Salary Disbursed</span>
          <div className="text-2xl font-black text-[#047857] mt-1">
            ₹{totalNet.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#047857] font-semibold">Direct NEFT via HDFC</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#e3ded5] shadow-xs">
          <span className="text-[11px] font-bold text-[#5a6376] uppercase">Statutory PF Remittance</span>
          <div className="text-2xl font-black text-[#2563eb] mt-1">
            ₹{(totalPf * 2).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#5a6376]">Employee + Employer Match</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#e3ded5] shadow-xs">
          <span className="text-[11px] font-bold text-[#5a6376] uppercase">TDS Withheld (ITD)</span>
          <div className="text-2xl font-black text-[#b45309] mt-1">
            ₹{totalTds.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#5a6376]">Form 24Q Quarterly Return</span>
        </div>
      </div>

      {/* Salary Register Table */}
      <div className="bg-white rounded-2xl border border-[#e3ded5] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#e3ded5] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1f2946]">Employee Salary Breakdown &amp; Slips</h3>
          <span className="text-xs text-[#5a6376]">All figures in INR (₹)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f7f6f2] border-b border-[#e3ded5] text-[#5a6376] font-bold uppercase text-[11px]">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Gross Earnings</th>
                <th className="py-3 px-4">Basic + HRA</th>
                <th className="py-3 px-4">PF Deduction</th>
                <th className="py-3 px-4">Prof Tax</th>
                <th className="py-3 px-4">TDS</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece3]">
              {payrollRecords.map((r) => (
                <tr key={r.id} className="hover:bg-[#fbfbf9]">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#1f2946]">{r.employeeName}</div>
                    <div className="font-mono text-[10px] text-[#5a6376]">{r.employeeNumber}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#1f2946]">
                    ₹{r.grossSalary.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#5a6376]">
                    ₹{r.basicSalary.toLocaleString('en-IN')} + ₹{r.hra.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#2563eb]">
                    ₹{r.pfDeduction.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#5a6376]">
                    ₹{r.profTax.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#b45309]">
                    ₹{r.tdsDeduction.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-[#047857]">
                    ₹{r.netPay.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedSlip(r)}
                      className="px-2.5 py-1 rounded-lg bg-[#f1efe9] hover:bg-[#e8e4da] text-[#1f2946] font-bold text-[11px] border border-[#d1cbbf] transition shadow-xs cursor-pointer flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#5a6376]" />
                      <span>Payslip</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Payslip Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 border border-[#e3ded5] shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedSlip(null)}
              className="absolute right-5 top-5 p-1 rounded-lg text-[#5a6376] hover:bg-[#f7f6f2] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Letterhead */}
            <div className="border-b border-[#e3ded5] pb-4 flex items-center justify-between">
              <div>
                <div className="text-base font-black uppercase text-[#1f2946]">
                  TECHM4<span className="text-[#c62d37]">INDIA</span> INNOVATIONS PVT. LTD.
                </div>
                <div className="text-[11px] text-[#5a6376]">
                  Registered Office: H.No 8-2-293/82/A, Road No 10, Banjara Hills, Hyderabad, TG
                </div>
                <div className="text-[11px] font-mono text-[#5a6376]">
                  CIN: U72900TG2023PTC174829 · PAN: AAECT1234F
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#1f2946] text-white font-mono text-xs font-bold">
                PAYSLIP
              </span>
            </div>

            {/* Employee Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#f7f6f2] p-4 rounded-xl border border-[#e3ded5]">
              <div>
                <span className="text-[#5a6376]">Employee Name:</span>{' '}
                <strong className="text-[#1f2946]">{selectedSlip.employeeName}</strong>
              </div>
              <div>
                <span className="text-[#5a6376]">Employee ID:</span>{' '}
                <strong className="text-[#1f2946] font-mono">{selectedSlip.employeeNumber}</strong>
              </div>
              <div>
                <span className="text-[#5a6376]">Department:</span>{' '}
                <span className="text-[#1f2946] font-medium">{selectedSlip.department}</span>
              </div>
              <div>
                <span className="text-[#5a6376]">Pay Period:</span>{' '}
                <strong className="text-[#1f2946] font-mono">{selectedSlip.periodMonth}</strong>
              </div>
            </div>

            {/* Salary Calculation Tables */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Earnings */}
              <div className="border border-[#e3ded5] rounded-xl overflow-hidden">
                <div className="bg-[#f7f6f2] px-3 py-2 font-bold text-[#1f2946] border-b border-[#e3ded5]">
                  EARNINGS
                </div>
                <div className="p-3 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span>Basic Salary:</span>
                    <span>₹{selectedSlip.basicSalary.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>House Rent (HRA):</span>
                    <span>₹{selectedSlip.hra.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Special Allowance:</span>
                    <span>₹{selectedSlip.specialAllowance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-[#e3ded5] flex justify-between font-bold text-[#1f2946]">
                    <span>Total Gross:</span>
                    <span>₹{selectedSlip.grossSalary.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="border border-[#e3ded5] rounded-xl overflow-hidden">
                <div className="bg-[#f7f6f2] px-3 py-2 font-bold text-[#1f2946] border-b border-[#e3ded5]">
                  DEDUCTIONS
                </div>
                <div className="p-3 space-y-1.5 font-mono text-[#b45309]">
                  <div className="flex justify-between">
                    <span>Employee PF (12%):</span>
                    <span>₹{selectedSlip.pfDeduction.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional Tax:</span>
                    <span>₹{selectedSlip.profTax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Income Tax (TDS):</span>
                    <span>₹{selectedSlip.tdsDeduction.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-[#e3ded5] flex justify-between font-bold text-[#be123c]">
                    <span>Total Deductions:</span>
                    <span>₹{selectedSlip.totalDeductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Callout */}
            <div className="p-4 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#047857]">
                  Net Salary Payable (in bank)
                </div>
                <div className="text-2xl font-black font-mono text-[#047857]">
                  ₹{selectedSlip.netPay.toLocaleString('en-IN')}
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-[#047857] border border-[#a7f3d0]">
                Disbursed via Direct Deposit
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-[#5a6376]">
                This is a computer-generated payslip and does not require physical signature.
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#1f2946] text-white text-xs font-bold hover:bg-[#151c31] flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
