'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Building,
  CheckCircle2,
  ChevronDown,
  Filter,
  GraduationCap,
  Layers,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { DivisionCode, LeadItem, LeadStatus, LeadType } from '../types';

interface CrmLeadsViewProps {
  leads: LeadItem[];
  onCreateLead: (lead: Partial<LeadItem>) => void;
  onOpenConvertModal: (lead: LeadItem) => void;
}

export const CrmLeadsView: React.FC<CrmLeadsViewProps> = ({
  leads,
  onCreateLead,
  onOpenConvertModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [divisionFilter, setDivisionFilter] = useState<string>('ALL');
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  // Form state for new lead
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    organization: '',
    designation: '',
    email: '',
    phone: '',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'B2B_COLLEGE' as LeadType,
    division: 'TECHM4_ENGINEERING' as DivisionCode,
    estimatedValue: 1500000,
    source: 'Website Inbound',
    notes: '',
  });

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.leadNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSector = sectorFilter === 'ALL' || lead.type === sectorFilter;
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    const matchesDivision = divisionFilter === 'ALL' || lead.division === divisionFilter;

    return matchesSearch && matchesSector && matchesStatus && matchesDivision;
  });

  const formatInr = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'QUALIFIED':
        return <span className="badge-tag badge-emerald">Qualified</span>;
      case 'MEETING_SCHEDULED':
        return <span className="badge-tag badge-blue">Meeting Scheduled</span>;
      case 'DEMO_GIVEN':
        return <span className="badge-tag badge-purple">Demo Given</span>;
      case 'PROPOSAL_SENT':
        return <span className="badge-tag badge-amber">Proposal Sent</span>;
      case 'NEGOTIATION':
        return <span className="badge-tag badge-crimson">Negotiation</span>;
      case 'WON':
        return <span className="badge-tag badge-emerald">Converted / Won</span>;
      case 'LOST':
        return <span className="badge-tag badge-gray">Lost</span>;
      default:
        return <span className="badge-tag badge-blue">New Lead</span>;
    }
  };

  const getSectorBadge = (type: LeadType) => {
    switch (type) {
      case 'B2B_COLLEGE':
        return <span className="badge-tag badge-blue">B2B College</span>;
      case 'B2B_UNIVERSITY':
        return <span className="badge-tag badge-purple">B2B University</span>;
      case 'B2B_SCHOOL':
        return <span className="badge-tag badge-emerald">B2B School</span>;
      case 'GOVERNMENT':
        return <span className="badge-tag badge-crimson">Govt / DRDO / ISRO</span>;
      case 'CORPORATE_CSR':
        return <span className="badge-tag badge-amber">Corporate CSR</span>;
      case 'INTERNATIONAL':
        return <span className="badge-tag badge-purple">Diaspora / Global</span>;
      default:
        return <span className="badge-tag badge-gray">{type}</span>;
    }
  };

  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateLead(formData);
    setIsNewLeadModalOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      organization: '',
      designation: '',
      email: '',
      phone: '',
      city: 'Hyderabad',
      state: 'Telangana',
      type: 'B2B_COLLEGE',
      division: 'TECHM4_ENGINEERING',
      estimatedValue: 1500000,
      source: 'Website Inbound',
      notes: '',
    });
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-[1600px] mx-auto">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-[#1f2946] flex items-center gap-2">
            <span>Leads Management</span>
            <span className="badge-tag badge-blue text-[10px]">{filteredLeads.length} Total</span>
          </h1>
          <p className="text-xs text-[#5a6376] mt-0.5">
            Capture, qualify, and convert educational institutions, schools, defense labs, and CSR leads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsNewLeadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#c62d37] hover:bg-[#a8222b] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-[#e3ded5] shadow-2xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#88909f]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leads, institutions, cities..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:outline-none focus:border-[#1f2946]"
          />
        </div>

        {/* Sector Filter */}
        <div>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs font-medium text-[#1f2946] focus:outline-none focus:border-[#1f2946] cursor-pointer"
          >
            <option value="ALL">All Sectors (8 TechM4 Verticals)</option>
            <option value="B2B_COLLEGE">B2B Colleges &amp; Engineering</option>
            <option value="B2B_UNIVERSITY">B2B Universities &amp; Campuses</option>
            <option value="B2B_SCHOOL">B2B K-12 Schools (AI / Robotics)</option>
            <option value="GOVERNMENT">Government &amp; Defense (DRDO / ISRO)</option>
            <option value="CORPORATE_CSR">Corporate CSR &amp; Industry Labs</option>
            <option value="INTERNATIONAL">International / GCC Diaspora</option>
            <option value="PARTNER_FRANCHISE">Partner &amp; Franchise Network</option>
            <option value="B2C_STUDENT">B2C Direct Students</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs font-medium text-[#1f2946] focus:outline-none focus:border-[#1f2946] cursor-pointer"
          >
            <option value="ALL">All Lead Stages</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="MEETING_SCHEDULED">Meeting Scheduled</option>
            <option value="DEMO_GIVEN">Demo Given</option>
            <option value="PROPOSAL_SENT">Proposal Sent</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="WON">Converted / Won</option>
            <option value="LOST">Lost</option>
          </select>
        </div>

        {/* Division Filter */}
        <div>
          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs font-medium text-[#1f2946] focus:outline-none focus:border-[#1f2946] cursor-pointer"
          >
            <option value="ALL">All TechM4 Divisions</option>
            <option value="TECHM4_ENGINEERING">TechM4 Engineering</option>
            <option value="TECHM4_SCHOOLS">TechM4 Schools</option>
            <option value="TECHM4_SOLUTIONS">TechM4 Solutions</option>
            <option value="TECHM4_SPACE">TechM4 Space</option>
            <option value="HORIZON_INSTITUTES">Horizon Institutes</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-[#e3ded5] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f7f6f2] border-b border-[#e3ded5] text-[#5a6376] font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Lead &amp; Institution</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Lead Score</th>
                <th className="py-3 px-4">Est. Pipeline</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3ded5]">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#88909f]">
                    <Building className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No leads found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#fcfbf9] transition-colors group">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#1f2946] text-sm group-hover:text-[#c62d37] transition-colors">
                        {lead.organization}
                      </div>
                      <div className="text-[11px] text-[#5a6376] flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-[#88909f]">{lead.leadNumber}</span>
                        <span>·</span>
                        <span>{lead.division.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getSectorBadge(lead.type)}</td>
                    <td className="py-3 px-4">{getStatusBadge(lead.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-[#e3ded5] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              lead.leadScore >= 80
                                ? 'bg-emerald-500'
                                : lead.leadScore >= 60
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${lead.leadScore}%` }}
                          />
                        </div>
                        <span className="font-semibold text-[#1f2946]">{lead.leadScore}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#1f2946]">{formatInr(lead.estimatedValue)}</div>
                      <div className="text-[10px] text-[#88909f]">{lead.source}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#1f2946]">
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div className="text-[11px] text-[#5a6376] flex items-center gap-2 mt-0.5">
                        <span className="truncate max-w-[140px]">{lead.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-[#5a6376]">
                        <MapPin className="w-3.5 h-3.5 text-[#88909f] shrink-0" />
                        <span>
                          {lead.city}, {lead.state}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {lead.isConverted ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Converted
                        </span>
                      ) : (
                        <button
                          onClick={() => onOpenConvertModal(lead)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f7f6f2] hover:bg-[#c62d37] text-[#1f2946] hover:text-white rounded-md border border-[#e3ded5] hover:border-[#c62d37] font-semibold text-[11px] transition cursor-pointer shadow-2xs"
                          title="Convert to Account, Contact and Deal in 1-Click"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:text-white" />
                          <span>Convert Lead</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Lead Modal */}
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#e3ded5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-[#e3ded5] bg-[#f7f6f2]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#c62d37] text-white flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1f2946]">Create New Lead</h3>
                  <p className="text-[11px] text-[#5a6376]">
                    Capture institutional prospect into TechM4 Sales Pipeline
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewLeadModalOpen(false)}
                className="p-1 text-[#88909f] hover:text-[#1f2946] rounded-md transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLead} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="e.g. Dr. Rajesh"
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
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
                    placeholder="e.g. Varma"
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Organization / Institution *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. Osmania University College of Engineering"
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Principal / Dean R&D"
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. principal@uceou.edu"
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Phone / Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98490 12345"
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Sector Vertical
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as LeadType })}
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                  >
                    <option value="B2B_COLLEGE">B2B College</option>
                    <option value="B2B_UNIVERSITY">B2B University</option>
                    <option value="B2B_SCHOOL">B2B K-12 School</option>
                    <option value="GOVERNMENT">Govt / Defense (DRDO/ISRO)</option>
                    <option value="CORPORATE_CSR">Corporate CSR</option>
                    <option value="INTERNATIONAL">Diaspora / International</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    TechM4 Division
                  </label>
                  <select
                    value={formData.division}
                    onChange={(e) =>
                      setFormData({ ...formData, division: e.target.value as DivisionCode })
                    }
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                  >
                    <option value="TECHM4_ENGINEERING">TechM4 Engineering</option>
                    <option value="TECHM4_SCHOOLS">TechM4 Schools</option>
                    <option value="TECHM4_SOLUTIONS">TechM4 Solutions</option>
                    <option value="TECHM4_SPACE">TechM4 Space</option>
                    <option value="HORIZON_INSTITUTES">Horizon Institutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Estimated Deal Value (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedValue: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
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
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                  Notes &amp; Academic Requirements
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Interested in NAAC Criterion 3 R&D Lab setup, 120-seat AI lab kit..."
                  className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e3ded5]">
                <button
                  type="button"
                  onClick={() => setIsNewLeadModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#5a6376] hover:text-[#1f2946] rounded-lg border border-[#e3ded5] hover:bg-[#f7f6f2] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#c62d37] hover:bg-[#a8222b] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
