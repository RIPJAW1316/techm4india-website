'use client';

import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { AccountItem, ContactItem } from '../types';

interface CrmContactsViewProps {
  contacts: ContactItem[];
  accounts: AccountItem[];
  onCreateContact: (contact: Partial<ContactItem>) => void;
}

export const CrmContactsView: React.FC<CrmContactsViewProps> = ({
  contacts,
  accounts,
  onCreateContact,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountFilter, setAccountFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    accountId: accounts[0]?.id || '',
    accountName: accounts[0]?.name || '',
    firstName: '',
    lastName: '',
    title: 'Dean R&D / Principal',
    department: 'Engineering / Research',
    email: '',
    phone: '',
    isPrimary: false,
  });

  const filteredContacts = contacts.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      c.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);

    const matchesAccount = accountFilter === 'ALL' || c.accountId === accountFilter;

    return matchesSearch && matchesAccount;
  });

  const handleAccountChange = (accId: string) => {
    const acc = accounts.find((a) => a.id === accId);
    setFormData({
      ...formData,
      accountId: accId,
      accountName: acc ? acc.name : '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateContact(formData);
    setIsModalOpen(false);
    setFormData({
      accountId: accounts[0]?.id || '',
      accountName: accounts[0]?.name || '',
      firstName: '',
      lastName: '',
      title: 'Dean R&D / Principal',
      department: 'Engineering / Research',
      email: '',
      phone: '',
      isPrimary: false,
    });
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-[#1f2946] flex items-center gap-2">
            <span>Institutional Stakeholders &amp; Contacts</span>
            <span className="badge-tag badge-blue text-[10px]">{filteredContacts.length} Total</span>
          </h1>
          <p className="text-xs text-[#5a6376] mt-0.5">
            Key academic decision makers, Vice Chancellors, Deans of R&amp;D, Principals, and Placement Officers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#c62d37] hover:bg-[#a8222b] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Stakeholder</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-[#e3ded5] shadow-2xs">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#88909f]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by stakeholder name, designation, institution, email..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
          />
        </div>

        <div>
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs font-medium text-[#1f2946] cursor-pointer"
          >
            <option value="ALL">All Partner Institutions</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white p-4 rounded-xl border border-[#e3ded5] hover:border-[#c62d37]/40 transition shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f7f6f2] border border-[#e3ded5] text-[#1f2946] font-bold text-sm flex items-center justify-center">
                  {contact.firstName.charAt(0)}
                  {contact.lastName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1f2946] flex items-center gap-1.5">
                    <span>
                      {contact.firstName} {contact.lastName}
                    </span>
                    {contact.isPrimary && (
                      <span className="badge-tag badge-emerald text-[9px]">Primary</span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#5a6376] font-medium">{contact.title}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#fcfbf9] p-2.5 rounded-lg border border-[#e3ded5] space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-[#1f2946] font-semibold">
                <Building2 className="w-3.5 h-3.5 text-[#c62d37] shrink-0" />
                <span className="truncate">{contact.accountName}</span>
              </div>
              <div className="flex items-center gap-2 text-[#5a6376]">
                <Mail className="w-3.5 h-3.5 text-[#88909f] shrink-0" />
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-[#c62d37] truncate hover:underline"
                >
                  {contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-[#5a6376]">
                <Phone className="w-3.5 h-3.5 text-[#88909f] shrink-0" />
                <a
                  href={`tel:${contact.phone}`}
                  className="hover:text-[#c62d37] hover:underline"
                >
                  {contact.phone}
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#88909f] pt-1">
              <span>{contact.department || 'Institutional Leadership'}</span>
              <span className="font-mono text-[10px]">
                {new Date(contact.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="bg-white rounded-xl border border-[#e3ded5] p-12 text-center text-[#88909f]">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
          No stakeholders found matching the criteria.
        </div>
      )}

      {/* Add Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#e3ded5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-[#e3ded5] bg-[#f7f6f2]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#c62d37] text-white flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1f2946]">Add Institutional Contact</h3>
                  <p className="text-[11px] text-[#5a6376]">
                    Link a key academic leader to an institution
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#88909f] hover:text-[#1f2946] rounded-md transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                  Parent Institution *
                </label>
                <select
                  required
                  value={formData.accountId}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Dean R&D / Principal"
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="primaryContact"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="rounded text-[#c62d37] focus:ring-[#c62d37]"
                />
                <label htmlFor="primaryContact" className="text-xs font-semibold text-[#1f2946] cursor-pointer">
                  Primary Decision Maker for this Institution
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e3ded5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#5a6376] hover:text-[#1f2946] rounded-lg border border-[#e3ded5] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#c62d37] hover:bg-[#a8222b] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Save Stakeholder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
