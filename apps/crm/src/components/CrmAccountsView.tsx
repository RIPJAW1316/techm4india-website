'use client';

import React, { useState } from 'react';
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  Layers,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { AccountItem, ContactItem, DealItem, DivisionCode, LeadType } from '../types';

interface CrmAccountsViewProps {
  accounts: AccountItem[];
  contacts: ContactItem[];
  deals: DealItem[];
  onCreateAccount: (account: Partial<AccountItem>) => void;
  onOpenCreateDealForAccount?: (account: AccountItem) => void;
}

export const CrmAccountsView: React.FC<CrmAccountsViewProps> = ({
  accounts,
  contacts,
  deals,
  onCreateAccount,
  onOpenCreateDealForAccount,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [naacFilter, setNaacFilter] = useState('ALL');
  const [mouFilter, setMouFilter] = useState('ALL');
  const [selectedAccount, setSelectedAccount] = useState<AccountItem | null>(null);
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);

  // New account form
  const [formData, setFormData] = useState({
    name: '',
    type: 'B2B_COLLEGE' as LeadType,
    email: '',
    phone: '',
    address: '',
    city: 'Hyderabad',
    state: 'Telangana',
    naacGrade: 'A++',
    aisheCode: '',
    studentStrength: 4500,
    annualRevenue: 2000000,
    activeMoU: true,
    mouValidTill: '2028-06-30',
    division: 'TECHM4_ENGINEERING' as DivisionCode,
  });

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.aisheCode && acc.aisheCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      acc.accountNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSector = sectorFilter === 'ALL' || acc.type === sectorFilter;
    const matchesNaac = naacFilter === 'ALL' || acc.naacGrade === naacFilter;
    const matchesMou =
      mouFilter === 'ALL' ||
      (mouFilter === 'ACTIVE' && acc.activeMoU) ||
      (mouFilter === 'INACTIVE' && !acc.activeMoU);

    return matchesSearch && matchesSector && matchesNaac && matchesMou;
  });

  // Summary Metrics
  const totalAccounts = accounts.length;
  const activeMousCount = accounts.filter((a) => a.activeMoU).length;
  const totalAnnualRev = accounts.reduce((sum, a) => sum + (a.annualRevenue || 0), 0);
  const avgHealth = Math.round(
    accounts.reduce((sum, a) => sum + (a.relationshipScore || 0), 0) / (accounts.length || 1)
  );

  const formatInr = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAccount(formData);
    setIsNewAccountModalOpen(false);
    setFormData({
      name: '',
      type: 'B2B_COLLEGE',
      email: '',
      phone: '',
      address: '',
      city: 'Hyderabad',
      state: 'Telangana',
      naacGrade: 'A++',
      aisheCode: '',
      studentStrength: 4500,
      annualRevenue: 2000000,
      activeMoU: true,
      mouValidTill: '2028-06-30',
      division: 'TECHM4_ENGINEERING',
    });
  };

  const getNaacBadge = (grade?: string) => {
    if (!grade || grade === 'NA') {
      return <span className="badge-tag badge-gray">CBSE / Not Graded</span>;
    }
    if (grade.includes('A++')) {
      return <span className="badge-tag badge-emerald font-bold">NAAC A++</span>;
    }
    if (grade.includes('A+')) {
      return <span className="badge-tag badge-blue font-bold">NAAC A+</span>;
    }
    return <span className="badge-tag badge-amber font-bold">NAAC {grade}</span>;
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-[#1f2946] flex items-center gap-2">
            <span>Institution Relationship Directory (Accounts)</span>
            <span className="badge-tag badge-emerald text-[10px]">{filteredAccounts.length} Active</span>
          </h1>
          <p className="text-xs text-[#5a6376] mt-0.5">
            Partner colleges, universities, K-12 schools, and defense labs with signed MoUs and active labs.
          </p>
        </div>

        <button
          onClick={() => setIsNewAccountModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#c62d37] hover:bg-[#a8222b] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Institution</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
          <div className="flex items-center justify-between text-[#5a6376] text-xs">
            <span>Total Institutions</span>
            <Building2 className="w-4 h-4 text-[#c62d37]" />
          </div>
          <div className="text-2xl font-black text-[#1f2946] mt-1">{totalAccounts}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">Pan-India Network</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
          <div className="flex items-center justify-between text-[#5a6376] text-xs">
            <span>Active Signed MoUs</span>
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{activeMousCount}</div>
          <div className="text-[11px] text-[#5a6376] mt-0.5">3-5 Year Validities</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
          <div className="flex items-center justify-between text-[#5a6376] text-xs">
            <span>Institutional Lifetime Value</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#1f2946] mt-1">{formatInr(totalAnnualRev)}</div>
          <div className="text-[11px] text-[#5a6376] mt-0.5">Labs &amp; Curriculum Revenue</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
          <div className="flex items-center justify-between text-[#5a6376] text-xs">
            <span>Avg. Relationship Health</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-[#1f2946] mt-1">{avgHealth}%</div>
          <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">High Engagement Score</div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-[#e3ded5] shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#88909f]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search institution name, city, AISHE..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
          />
        </div>

        <div>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs font-medium text-[#1f2946] cursor-pointer"
          >
            <option value="ALL">All Institution Types</option>
            <option value="B2B_COLLEGE">Engineering Colleges</option>
            <option value="B2B_UNIVERSITY">Autonomous Universities</option>
            <option value="B2B_SCHOOL">K-12 Schools (AI Labs)</option>
            <option value="GOVERNMENT">Government &amp; Defense Labs</option>
            <option value="CORPORATE_CSR">Corporate CSR Partners</option>
            <option value="INTERNATIONAL">International / GCC Campuses</option>
          </select>
        </div>

        <div>
          <select
            value={naacFilter}
            onChange={(e) => setNaacFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs font-medium text-[#1f2946] cursor-pointer"
          >
            <option value="ALL">All NAAC Grades</option>
            <option value="A++">NAAC A++</option>
            <option value="A+">NAAC A+</option>
            <option value="A">NAAC A</option>
            <option value="B">NAAC B</option>
          </select>
        </div>

        <div>
          <select
            value={mouFilter}
            onChange={(e) => setMouFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs font-medium text-[#1f2946] cursor-pointer"
          >
            <option value="ALL">All MoU Statuses</option>
            <option value="ACTIVE">Active Signed MoU</option>
            <option value="INACTIVE">Pending / No MoU</option>
          </select>
        </div>
      </div>

      {/* Accounts Directory Table */}
      <div className="bg-white rounded-xl border border-[#e3ded5] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f7f6f2] border-b border-[#e3ded5] text-[#5a6376] font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Accreditation</th>
                <th className="py-3 px-4">AISHE / UDISE</th>
                <th className="py-3 px-4">Students</th>
                <th className="py-3 px-4">MoU Status</th>
                <th className="py-3 px-4">AI Health Score</th>
                <th className="py-3 px-4">Lifetime Value</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3ded5]">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#88909f]">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No institution accounts found.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr
                    key={account.id}
                    onClick={() => setSelectedAccount(account)}
                    className="hover:bg-[#fcfbf9] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#1f2946] text-sm group-hover:text-[#c62d37] transition-colors">
                        {account.name}
                      </div>
                      <div className="text-[11px] text-[#5a6376] flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#88909f]" />
                        <span>
                          {account.city}, {account.state}
                        </span>
                        <span>·</span>
                        <span className="font-mono text-[10px] text-[#88909f]">
                          {account.accountNumber}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getNaacBadge(account.naacGrade)}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#5a6376]">
                      {account.aisheCode || account.udiseCode || '—'}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#1f2946]">
                      {account.studentStrength ? account.studentStrength.toLocaleString('en-IN') : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {account.activeMoU ? (
                        <div className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active MoU</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#88909f]">In Discussion</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-[#e3ded5] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              account.relationshipScore >= 80
                                ? 'bg-emerald-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${account.relationshipScore}%` }}
                          />
                        </div>
                        <span className="font-semibold text-[#1f2946]">
                          {account.relationshipScore}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1f2946]">
                      {formatInr(account.annualRevenue || 0)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="p-1.5 inline-block text-[#5a6376] group-hover:text-[#c62d37] transition">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Details Drawer / Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#e3ded5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-[#e3ded5] bg-[#f7f6f2]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1f2946] text-white flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1f2946]">{selectedAccount.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-[#5a6376]">
                    <span className="font-mono">{selectedAccount.accountNumber}</span>
                    <span>·</span>
                    <span>
                      {selectedAccount.city}, {selectedAccount.state}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAccount(null)}
                className="p-1 text-[#88909f] hover:text-[#1f2946] rounded-md transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Institution Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#fcfbf9] p-3 rounded-xl border border-[#e3ded5]">
                <div>
                  <span className="text-[10px] text-[#88909f] uppercase block font-semibold">
                    NAAC Grade
                  </span>
                  <div className="mt-0.5">{getNaacBadge(selectedAccount.naacGrade)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#88909f] uppercase block font-semibold">
                    AISHE Code
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1f2946] mt-0.5 block">
                    {selectedAccount.aisheCode || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#88909f] uppercase block font-semibold">
                    Students
                  </span>
                  <span className="text-xs font-bold text-[#1f2946] mt-0.5 block">
                    {selectedAccount.studentStrength?.toLocaleString('en-IN') || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#88909f] uppercase block font-semibold">
                    Health Score
                  </span>
                  <span className="text-xs font-bold text-emerald-600 mt-0.5 block">
                    {selectedAccount.relationshipScore}%
                  </span>
                </div>
              </div>

              {/* Associated Contacts */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#5a6376] mb-2 flex items-center justify-between">
                  <span>Institutional Stakeholders</span>
                  <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">
                    + Add Stakeholder
                  </span>
                </h4>
                <div className="space-y-2">
                  {contacts
                    .filter((c) => c.accountId === selectedAccount.id)
                    .map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-[#e3ded5] bg-white hover:bg-[#f7f6f2] transition"
                      >
                        <div>
                          <div className="font-bold text-xs text-[#1f2946] flex items-center gap-1.5">
                            <span>
                              {contact.firstName} {contact.lastName}
                            </span>
                            {contact.isPrimary && (
                              <span className="badge-tag badge-emerald text-[9px]">Primary</span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#5a6376]">{contact.title}</div>
                        </div>
                        <div className="text-right text-[11px] text-[#5a6376]">
                          <div>{contact.phone}</div>
                          <div className="text-[#88909f]">{contact.email}</div>
                        </div>
                      </div>
                    ))}
                  {contacts.filter((c) => c.accountId === selectedAccount.id).length === 0 && (
                    <div className="text-xs text-[#88909f] p-3 text-center border border-dashed border-[#e3ded5] rounded-lg">
                      No contacts linked to this institution yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Associated Deals */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#5a6376] mb-2 flex items-center justify-between">
                  <span>Active Commercial Deals</span>
                  {onOpenCreateDealForAccount && (
                    <button
                      onClick={() => {
                        onOpenCreateDealForAccount(selectedAccount);
                        setSelectedAccount(null);
                      }}
                      className="text-[10px] text-[#c62d37] font-semibold cursor-pointer hover:underline"
                    >
                      + Create Deal
                    </button>
                  )}
                </h4>
                <div className="space-y-2">
                  {deals
                    .filter((d) => d.accountId === selectedAccount.id)
                    .map((deal) => (
                      <div
                        key={deal.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-[#e3ded5] bg-white"
                      >
                        <div>
                          <div className="font-bold text-xs text-[#1f2946]">{deal.title}</div>
                          <div className="text-[11px] text-[#5a6376] flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-emerald-600">
                              {deal.stage.replace('_', ' ')}
                            </span>
                            <span>·</span>
                            <span>Target: {deal.closingDate}</span>
                          </div>
                        </div>
                        <div className="font-bold text-sm text-[#1f2946]">
                          {formatInr(deal.amount)}
                        </div>
                      </div>
                    ))}
                  {deals.filter((d) => d.accountId === selectedAccount.id).length === 0 && (
                    <div className="text-xs text-[#88909f] p-3 text-center border border-dashed border-[#e3ded5] rounded-lg">
                      No active deals linked yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end p-3 border-t border-[#e3ded5] bg-[#f7f6f2]">
              <button
                onClick={() => setSelectedAccount(null)}
                className="px-4 py-1.5 text-xs font-semibold text-[#1f2946] hover:bg-[#e3ded5] rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Account Modal */}
      {isNewAccountModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#e3ded5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-[#e3ded5] bg-[#f7f6f2]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#c62d37] text-white flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1f2946]">Add Institution Account</h3>
                  <p className="text-[11px] text-[#5a6376]">
                    Register a university, college, school or government facility
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewAccountModalOpen(false)}
                className="p-1 text-[#88909f] hover:text-[#1f2946] rounded-md transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                  Institution Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Chaitanya Bharathi Institute of Technology (CBIT)"
                  className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Sector
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as LeadType })
                    }
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  >
                    <option value="B2B_COLLEGE">B2B College</option>
                    <option value="B2B_UNIVERSITY">B2B University</option>
                    <option value="B2B_SCHOOL">B2B School</option>
                    <option value="GOVERNMENT">Govt / Defense (DRDO)</option>
                    <option value="CORPORATE_CSR">Corporate CSR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    NAAC Grade
                  </label>
                  <select
                    value={formData.naacGrade}
                    onChange={(e) => setFormData({ ...formData, naacGrade: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  >
                    <option value="A++">NAAC A++</option>
                    <option value="A+">NAAC A+</option>
                    <option value="A">NAAC A</option>
                    <option value="B">NAAC B</option>
                    <option value="NA">NA / School</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    AISHE Code
                  </label>
                  <input
                    type="text"
                    value={formData.aisheCode}
                    onChange={(e) => setFormData({ ...formData, aisheCode: e.target.value })}
                    placeholder="e.g. C-19823"
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Student Strength
                  </label>
                  <input
                    type="number"
                    value={formData.studentStrength}
                    onChange={(e) =>
                      setFormData({ ...formData, studentStrength: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeMoU"
                  checked={formData.activeMoU}
                  onChange={(e) => setFormData({ ...formData, activeMoU: e.target.checked })}
                  className="rounded text-[#c62d37] focus:ring-[#c62d37]"
                />
                <label htmlFor="activeMoU" className="text-xs font-semibold text-[#1f2946] cursor-pointer">
                  Has Signed Institutional MoU with TechM4
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e3ded5]">
                <button
                  type="button"
                  onClick={() => setIsNewAccountModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#5a6376] hover:text-[#1f2946] rounded-lg border border-[#e3ded5] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#c62d37] hover:bg-[#a8222b] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
