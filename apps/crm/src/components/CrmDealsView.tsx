'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  Filter,
  Kanban,
  Layers,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { AccountItem, DealItem, DealStage, DivisionCode } from '../types';

interface CrmDealsViewProps {
  deals: DealItem[];
  accounts: AccountItem[];
  onCreateDeal: (deal: Partial<DealItem>) => void;
  onUpdateDealStage: (dealId: string, stage: DealStage) => void;
}

const STAGES: { key: DealStage; label: string; prob: number; color: string }[] = [
  { key: 'QUALIFICATION', label: '1. Qualification', prob: 10, color: 'border-t-blue-500' },
  { key: 'NEEDS_ANALYSIS', label: '2. Needs Analysis', prob: 30, color: 'border-t-indigo-500' },
  { key: 'PROPOSAL_QUOTATION', label: '3. Proposal / Quote', prob: 60, color: 'border-t-purple-500' },
  { key: 'NEGOTIATION_REVIEW', label: '4. Negotiation', prob: 80, color: 'border-t-amber-500' },
  { key: 'CLOSED_WON', label: '5. Closed Won', prob: 100, color: 'border-t-emerald-500' },
  { key: 'CLOSED_LOST', label: '6. Closed Lost', prob: 0, color: 'border-t-rose-500' },
];

export const CrmDealsView: React.FC<CrmDealsViewProps> = ({
  deals,
  accounts,
  onCreateDeal,
  onUpdateDealStage,
}) => {
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [divisionFilter, setDivisionFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    accountId: accounts[0]?.id || '',
    accountName: accounts[0]?.name || '',
    contactName: 'Dean R&D / Principal',
    contactEmail: 'contact@institution.edu',
    stage: 'QUALIFICATION' as DealStage,
    division: 'TECHM4_ENGINEERING' as DivisionCode,
    amount: 1500000,
    closingDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    probability: 40,
    ownerName: 'Aryan Reddy',
    notes: '',
  });

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.dealNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = divisionFilter === 'ALL' || deal.division === divisionFilter;
    return matchesSearch && matchesDivision;
  });

  // KPI Calculations
  const activeDeals = filteredDeals.filter(
    (d) => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST'
  );
  const totalPipeline = activeDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const weightedPipeline = Math.round(
    activeDeals.reduce((sum, d) => sum + (Number(d.amount) * (Number(d.probability) || 0)) / 100, 0)
  );
  const closedWonTotal = filteredDeals
    .filter((d) => d.stage === 'CLOSED_WON')
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const formatInr = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

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
    onCreateDeal(formData);
    setIsModalOpen(false);
    setFormData({
      title: '',
      accountId: accounts[0]?.id || '',
      accountName: accounts[0]?.name || '',
      contactName: 'Dean R&D / Principal',
      contactEmail: 'contact@institution.edu',
      stage: 'QUALIFICATION',
      division: 'TECHM4_ENGINEERING',
      amount: 1500000,
      closingDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      probability: 40,
      ownerName: 'Aryan Reddy',
      notes: '',
    });
  };

  const advanceStage = (deal: DealItem, direction: 'NEXT' | 'PREV') => {
    const currentIndex = STAGES.findIndex((s) => s.key === deal.stage);
    if (direction === 'NEXT' && currentIndex < STAGES.length - 2) {
      onUpdateDealStage(deal.id, STAGES[currentIndex + 1].key);
    } else if (direction === 'PREV' && currentIndex > 0) {
      onUpdateDealStage(deal.id, STAGES[currentIndex - 1].key);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-[1700px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-[#1f2946] flex items-center gap-2">
            <span>Deals &amp; Opportunities Pipeline</span>
            <span className="badge-tag badge-purple text-[10px]">
              {filteredDeals.length} Opportunities
            </span>
          </h1>
          <p className="text-xs text-[#5a6376] mt-0.5">
            Zoho 6-Stage Institutional Sales Pipeline with dynamic win-probability forecasting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-[#f7f6f2] p-1 rounded-lg border border-[#e3ded5]">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                viewMode === 'KANBAN'
                  ? 'bg-white text-[#1f2946] shadow-2xs'
                  : 'text-[#5a6376] hover:text-[#1f2946]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                viewMode === 'LIST'
                  ? 'bg-white text-[#1f2946] shadow-2xs'
                  : 'text-[#5a6376] hover:text-[#1f2946]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#c62d37] hover:bg-[#a8222b] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Deal</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
          <div className="text-[#5a6376] text-xs font-medium">Total Open Pipeline</div>
          <div className="text-xl sm:text-2xl font-black text-[#1f2946] mt-1">
            {formatInr(totalPipeline)}
          </div>
          <div className="text-[11px] text-[#5a6376] mt-0.5">{activeDeals.length} Active Deals</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
          <div className="text-[#5a6376] text-xs font-medium">Weighted Forecast</div>
          <div className="text-xl sm:text-2xl font-black text-purple-700 mt-1">
            {formatInr(weightedPipeline)}
          </div>
          <div className="text-[11px] text-purple-600 font-semibold mt-0.5">Probability Adjusted</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
          <div className="text-[#5a6376] text-xs font-medium">Closed Won (FY26)</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
            {formatInr(closedWonTotal)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Signed Revenue</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
          <div className="text-[#5a6376] text-xs font-medium">Lead-to-Deal Conversion</div>
          <div className="text-xl sm:text-2xl font-black text-[#1f2946] mt-1">38.4%</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Above Target</div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#e3ded5] shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#88909f]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search deals, institutions..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs font-medium text-[#1f2946] cursor-pointer"
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

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'KANBAN' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === stage.key);
            const stageTotal = stageDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

            return (
              <div
                key={stage.key}
                className={`bg-[#f7f6f2] rounded-xl border border-[#e3ded5] border-t-4 ${stage.color} p-3 flex flex-col min-h-[500px] shadow-2xs`}
              >
                {/* Column Header */}
                <div className="pb-3 border-b border-[#e3ded5]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1f2946]">{stage.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#e3ded5] text-[#5a6376]">
                      {stage.prob}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-[#5a6376]">
                    <span>{stageDeals.length} deals</span>
                    <span className="font-bold text-[#1f2946]">{formatInr(stageTotal)}</span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 mt-3 flex-1 overflow-y-auto">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-white p-3 rounded-lg border border-[#e3ded5] hover:border-[#c62d37]/40 transition shadow-2xs space-y-2 group"
                    >
                      <div>
                        <div className="text-[10px] font-mono text-[#88909f]">{deal.dealNumber}</div>
                        <h4 className="font-bold text-xs text-[#1f2946] line-clamp-2 mt-0.5 group-hover:text-[#c62d37] transition-colors">
                          {deal.title}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-[#5a6376] mt-1">
                          <Building2 className="w-3 h-3 text-[#88909f] shrink-0" />
                          <span className="truncate">{deal.accountName}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#f1efe9] flex items-center justify-between">
                        <div className="font-bold text-xs text-[#1f2946]">
                          {formatInr(deal.amount)}
                        </div>
                        <div className="text-[10px] text-[#5a6376] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#88909f]" />
                          <span>{deal.closingDate.slice(5)}</span>
                        </div>
                      </div>

                      {/* Stage Move Controls */}
                      <div className="pt-1 flex items-center justify-between text-[11px] border-t border-[#f7f6f2]">
                        <span className="text-[9px] font-semibold text-[#88909f]">
                          {deal.division.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1">
                          {stage.key !== 'QUALIFICATION' && (
                            <button
                              onClick={() => advanceStage(deal, 'PREV')}
                              title="Move back"
                              className="p-1 rounded hover:bg-[#f1efe9] text-[#5a6376] cursor-pointer"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {stage.key !== 'CLOSED_WON' && stage.key !== 'CLOSED_LOST' && (
                            <button
                              onClick={() => advanceStage(deal, 'NEXT')}
                              title="Advance stage"
                              className="p-1 rounded bg-[#f7f6f2] hover:bg-[#c62d37] hover:text-white text-[#1f2946] border border-[#e3ded5] cursor-pointer transition"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="text-center py-10 text-[11px] text-[#88909f] border border-dashed border-[#e3ded5] rounded-lg">
                      No deals in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white rounded-xl border border-[#e3ded5] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f7f6f2] border-b border-[#e3ded5] text-[#5a6376] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Deal Title</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Win Prob.</th>
                  <th className="py-3 px-4">Closing Date</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4 text-right">Quick Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3ded5]">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-[#fcfbf9] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#1f2946]">
                      {deal.title}
                      <div className="text-[10px] font-mono text-[#88909f] mt-0.5">
                        {deal.dealNumber}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#5a6376]">{deal.accountName}</td>
                    <td className="py-3 px-4">
                      <span className="badge-tag badge-purple font-semibold">
                        {deal.stage.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1f2946]">
                      {formatInr(deal.amount)}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#1f2946]">
                      {deal.probability}%
                    </td>
                    <td className="py-3 px-4 text-[#5a6376]">{deal.closingDate}</td>
                    <td className="py-3 px-4 text-[#5a6376]">{deal.ownerName}</td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={deal.stage}
                        onChange={(e) => onUpdateDealStage(deal.id, e.target.value as DealStage)}
                        className="px-2 py-1 bg-[#f7f6f2] border border-[#e3ded5] rounded text-[11px] font-medium text-[#1f2946] cursor-pointer"
                      >
                        {STAGES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Deal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#e3ded5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-[#e3ded5] bg-[#f7f6f2]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#c62d37] text-white flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1f2946]">Create New Deal</h3>
                  <p className="text-[11px] text-[#5a6376]">
                    Track institutional contract or lab setup in the pipeline
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
                  Deal Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Anurag University — Advanced Robotics Lab &amp; Faculty Training"
                  className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                  Institution Account *
                </label>
                <select
                  required
                  value={formData.accountId}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Deal Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Target Closing Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.closingDate}
                    onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Pipeline Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) =>
                      setFormData({ ...formData, stage: e.target.value as DealStage })
                    }
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label} ({s.prob}%)
                      </option>
                    ))}
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
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  >
                    <option value="TECHM4_ENGINEERING">TechM4 Engineering</option>
                    <option value="TECHM4_SCHOOLS">TechM4 Schools</option>
                    <option value="TECHM4_SOLUTIONS">TechM4 Solutions</option>
                    <option value="TECHM4_SPACE">TechM4 Space</option>
                    <option value="HORIZON_INSTITUTES">Horizon Institutes</option>
                  </select>
                </div>
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
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
