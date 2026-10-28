'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { AccountItem, ContactItem, DealItem, LeadItem } from '../types';

interface CrmConvertLeadModalProps {
  lead: LeadItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirmConvert: (
    leadId: string,
    accountData: Partial<AccountItem>,
    contactData: Partial<ContactItem>,
    dealData: Partial<DealItem>
  ) => void;
}

export const CrmConvertLeadModal: React.FC<CrmConvertLeadModalProps> = ({
  lead,
  isOpen,
  onClose,
  onConfirmConvert,
}) => {
  if (!isOpen) return null;

  const [accountName, setAccountName] = useState(lead.organization);
  const [naacGrade, setNaacGrade] = useState('A++');
  const [aisheCode, setAisheCode] = useState('U-0543');
  const [studentStrength, setStudentStrength] = useState(5000);

  const [contactName, setContactName] = useState(`${lead.firstName} ${lead.lastName}`.trim());
  const [contactTitle, setContactTitle] = useState(lead.designation || 'Principal / Dean');
  const [contactEmail, setContactEmail] = useState(lead.email);
  const [contactPhone, setContactPhone] = useState(lead.phone);

  const [createDeal, setCreateDeal] = useState(true);
  const [dealTitle, setDealTitle] = useState(`${lead.organization} — Institutional MoU`);
  const [dealAmount, setDealAmount] = useState(lead.estimatedValue || 1500000);
  const [closingDate, setClosingDate] = useState(
    new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  );

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();

    const accountData: Partial<AccountItem> = {
      name: accountName,
      type: lead.type,
      phone: contactPhone,
      email: contactEmail,
      city: lead.city,
      state: lead.state,
      naacGrade,
      aisheCode,
      studentStrength: Number(studentStrength),
      division: lead.division,
      activeMoU: false,
    };

    const [firstName, ...lastNames] = contactName.split(' ');
    const contactData: Partial<ContactItem> = {
      firstName: firstName || 'Lead',
      lastName: lastNames.join(' ') || 'Contact',
      title: contactTitle,
      email: contactEmail,
      phone: contactPhone,
      isPrimary: true,
    };

    const dealData: Partial<DealItem> = createDeal
      ? {
          title: dealTitle,
          amount: Number(dealAmount),
          closingDate,
          stage: 'QUALIFICATION',
          division: lead.division,
          probability: 40,
        }
      : {};

    onConfirmConvert(lead.id, accountData, contactData, dealData);
  };

  const formatInr = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#e3ded5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#e3ded5] bg-[#f7f6f2]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#c62d37] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1f2946] flex items-center gap-2">
                <span>Convert Lead: {lead.organization}</span>
                <span className="badge-tag badge-emerald text-[10px]">1-Click Zoho Engine</span>
              </h3>
              <p className="text-xs text-[#5a6376]">
                Converts unqualified prospect into an Institution Account, Primary Contact, and Active Pipeline Deal.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#88909f] hover:text-[#1f2946] rounded-md transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConvert} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Account (Institution) */}
          <div className="border border-[#e3ded5] rounded-xl p-4 bg-[#fcfbf9] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-[#1f2946]">
                <Building2 className="w-4 h-4 text-[#c62d37]" />
                <span>1. Institution Account Details</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Will create new Account
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                  Institution Name
                </label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                  NAAC Accreditation
                </label>
                <select
                  value={naacGrade}
                  onChange={(e) => setNaacGrade(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                >
                  <option value="A++">NAAC Grade A++</option>
                  <option value="A+">NAAC Grade A+</option>
                  <option value="A">NAAC Grade A</option>
                  <option value="B">NAAC Grade B</option>
                  <option value="NA">Not Applicable / CBSE School</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                  AISHE / UDISE Code
                </label>
                <input
                  type="text"
                  value={aisheCode}
                  onChange={(e) => setAisheCode(e.target.value)}
                  placeholder="e.g. C-19823 or U-0543"
                  className="w-full px-3 py-1.5 bg-white border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                  Approx. Student Strength
                </label>
                <input
                  type="number"
                  value={studentStrength}
                  onChange={(e) => setStudentStrength(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact (Key Stakeholder) */}
          <div className="border border-[#e3ded5] rounded-xl p-4 bg-[#fcfbf9] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-[#1f2946]">
                <UserCheck className="w-4 h-4 text-[#3b82f6]" />
                <span>2. Key Stakeholder Contact</span>
              </div>
              <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Primary Contact
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={contactTitle}
                  onChange={(e) => setContactTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Deal (Opportunity) */}
          <div className="border border-[#e3ded5] rounded-xl p-4 bg-[#fcfbf9] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-[#1f2946]">
                <Briefcase className="w-4 h-4 text-[#8b5cf6]" />
                <span>3. Commercial Deal Opportunity</span>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-[#1f2946] cursor-pointer">
                <input
                  type="checkbox"
                  checked={createDeal}
                  onChange={(e) => setCreateDeal(e.target.checked)}
                  className="rounded text-[#c62d37] focus:ring-[#c62d37]"
                />
                <span className="text-[11px] font-medium">Create Deal</span>
              </label>
            </div>

            {createDeal && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Deal Title
                  </label>
                  <input
                    type="text"
                    required
                    value={dealTitle}
                    onChange={(e) => setDealTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={dealAmount}
                    onChange={(e) => setDealAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Expected Closing Date
                  </label>
                  <input
                    type="date"
                    required
                    value={closingDate}
                    onChange={(e) => setClosingDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#e3ded5]">
            <div className="text-xs text-[#5a6376]">
              Target Division: <span className="font-semibold text-[#1f2946]">{lead.division.replace('_', ' ')}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-[#5a6376] hover:text-[#1f2946] rounded-lg border border-[#e3ded5] hover:bg-[#f7f6f2] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#c62d37] hover:bg-[#a8222b] text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Confirm &amp; Convert</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
