'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Building,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  ExternalLink,
  Flame,
  Layers,
  MoreHorizontal,
  PhoneCall,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  UserCheck,
  Video,
} from 'lucide-react';
import {
  CallLogItem,
  CrmViewTab,
  DealItem,
  LeadItem,
  MeetingItem,
  TaskItem,
} from '../types';

interface CrmHomeDashboardProps {
  leads: LeadItem[];
  deals: DealItem[];
  tasks: TaskItem[];
  meetings: MeetingItem[];
  callLogs: CallLogItem[];
  setActiveTab: (tab: CrmViewTab) => void;
  onToggleTask: (taskId: string) => void;
  onOpenConvertModal: (lead: LeadItem) => void;
  onRefresh: () => void;
}

export const CrmHomeDashboard: React.FC<CrmHomeDashboardProps> = ({
  leads,
  deals,
  tasks,
  meetings,
  callLogs,
  setActiveTab,
  onToggleTask,
  onOpenConvertModal,
  onRefresh,
}) => {
  const [taskSortAsc, setTaskSortAsc] = useState(true);

  // Dynamic KPI Metrics
  const openDeals = deals.filter((d) => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST');
  const openDealsValue = openDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const untouchedDeals = openDeals.filter((d) => d.stage === 'QUALIFICATION');
  const callsToday = callLogs.length;
  const activeLeads = leads.filter((l) => !l.isConverted && l.status !== 'LOST');

  const formatInr = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-[1600px] mx-auto">
      {/* Top Welcome Strip (Matching Zoho Screenshot) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#e3ded5] p-4 rounded-xl shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#f7f6f2] border border-[#e3ded5] flex items-center justify-center text-[#1f2946]">
            <Building className="w-5 h-5 text-[#c62d37]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1f2946] flex items-center gap-2">
              <span>Welcome Aryan Reddy</span>
              <span className="badge-tag badge-emerald text-[9px]">Founder &amp; CEO</span>
            </h1>
            <p className="text-xs text-[#5a6376] mt-0.5">
              TechM4India Innovations · Enterprise CRM &amp; Institutional Partnerships Hub
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs font-semibold text-[#1f2946]">
            <span>Aryan Reddy&apos;s Home</span>
          </div>
          <button
            onClick={onRefresh}
            className="p-1.5 text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9] rounded-lg border border-[#e3ded5] transition cursor-pointer"
            title="Refresh Dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Metric Summary Cards Strip (Matching Zoho Screenshot) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: My Open Deals */}
        <div
          onClick={() => setActiveTab('deals')}
          className="bg-white border border-[#e3ded5] hover:border-[#1f2946] p-4 rounded-xl shadow-2xs hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5a6376]">
            <span className="text-xs font-bold text-[#1f2946]">My Open Deals</span>
            <Briefcase className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1f2946] crm-num">{openDeals.length}</span>
            <span className="text-xs font-bold text-emerald-700 crm-num">
              ({formatInr(openDealsValue)})
            </span>
          </div>
          <p className="text-[11px] text-[#5a6376] mt-1">Active institutional opportunities</p>
        </div>

        {/* Card 2: My Untouched Deals */}
        <div
          onClick={() => setActiveTab('deals')}
          className="bg-white border border-[#e3ded5] hover:border-[#1f2946] p-4 rounded-xl shadow-2xs hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5a6376]">
            <span className="text-xs font-bold text-[#1f2946]">My Untouched Deals</span>
            <Clock className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1f2946] crm-num">{untouchedDeals.length}</span>
            {untouchedDeals.length > 0 && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Needs Touch
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#5a6376] mt-1">No logged activity in 7+ days</p>
        </div>

        {/* Card 3: My Calls Today */}
        <div
          onClick={() => setActiveTab('activities')}
          className="bg-white border border-[#e3ded5] hover:border-[#1f2946] p-4 rounded-xl shadow-2xs hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5a6376]">
            <span className="text-xs font-bold text-[#1f2946]">My Calls Today</span>
            <PhoneCall className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1f2946] crm-num">{callsToday}</span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              Completed
            </span>
          </div>
          <p className="text-[11px] text-[#5a6376] mt-1">Telephonic outreach &amp; demos</p>
        </div>

        {/* Card 4: My Leads */}
        <div
          onClick={() => setActiveTab('leads')}
          className="bg-white border border-[#e3ded5] hover:border-[#1f2946] p-4 rounded-xl shadow-2xs hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5a6376]">
            <span className="text-xs font-bold text-[#1f2946]">My Leads</span>
            <Target className="w-4 h-4 text-[#c62d37] group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1f2946] crm-num">{activeLeads.length}</span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              In Pipeline
            </span>
          </div>
          <p className="text-[11px] text-[#5a6376] mt-1">Colleges, schools, govt, CSR</p>
        </div>
      </div>

      {/* 2-Column Responsive Card Grid (The 4 Workdecks Matching Zoho Screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Workdeck 1: My Open Tasks */}
        <div className="bg-white border border-[#e3ded5] rounded-xl shadow-2xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="px-4 py-3 border-b border-[#f1efe9] flex items-center justify-between bg-[#faf9f5]">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#c62d37]" />
                <h3 className="text-xs font-bold text-[#1f2946] uppercase tracking-wider">
                  My Open Tasks
                </h3>
              </div>
              <button
                onClick={() => setTaskSortAsc(!taskSortAsc)}
                className="text-[11px] font-semibold text-[#5a6376] hover:text-[#1f2946] flex items-center gap-1 cursor-pointer"
              >
                <span>Due Date {taskSortAsc ? '↑' : '↓'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs table-editorial">
                <thead>
                  <tr>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3 text-right">Done</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1efe9]">
                  {tasks.slice(0, 5).map((task) => (
                    <tr key={task.id} className="hover:bg-[#f7f6f2] transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#1f2946] max-w-[200px] truncate">
                        <span title={task.subject}>{task.subject}</span>
                        <div className="text-[10px] text-[#5a6376] font-normal truncate">
                          {task.relatedTo}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 crm-num text-[#5a6376] whitespace-nowrap">
                        {task.dueDate}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`badge-tag ${
                            task.status === 'COMPLETED'
                              ? 'badge-emerald'
                              : task.status === 'IN_PROGRESS'
                              ? 'badge-blue'
                              : 'badge-muted'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-bold ${
                            task.priority === 'HIGH'
                              ? 'text-[#c62d37]'
                              : task.priority === 'NORMAL'
                              ? 'text-blue-700'
                              : 'text-[#5a6376]'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onToggleTask(task.id)}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition cursor-pointer ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-[#cbd5e1] hover:border-[#1f2946]'
                          }`}
                        >
                          {task.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="px-4 py-2 bg-[#fbfbf9] border-t border-[#f1efe9] flex items-center justify-between text-xs text-[#5a6376]">
            <span>Total Records: {tasks.length}</span>
            <button
              onClick={() => setActiveTab('activities')}
              className="text-[#c62d37] hover:underline font-semibold cursor-pointer"
            >
              View All Tasks →
            </button>
          </div>
        </div>

        {/* Workdeck 2: My Meetings */}
        <div className="bg-white border border-[#e3ded5] rounded-xl shadow-2xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="px-4 py-3 border-b border-[#f1efe9] flex items-center justify-between bg-[#faf9f5]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-[#1f2946] uppercase tracking-wider">
                  My Meetings &amp; Demos
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-[#5a6376]">Upcoming Schedule</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs table-editorial">
                <thead>
                  <tr>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Schedule</th>
                    <th className="py-2.5 px-3">Related To</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1efe9]">
                  {meetings.map((mtg) => (
                    <tr key={mtg.id} className="hover:bg-[#f7f6f2] transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#1f2946] max-w-[180px] truncate">
                        <span title={mtg.title}>{mtg.title}</span>
                        <div className="text-[10px] text-[#5a6376] flex items-center gap-1 mt-0.5">
                          <Video className="w-3 h-3 text-blue-600" />
                          <span>{mtg.location}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-[#5a6376] whitespace-nowrap font-medium text-[11px]">
                        <div>{mtg.fromTime}</div>
                        <div className="text-[10px] text-[#5a6376]">{mtg.toTime}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-[#1f2946] font-semibold text-[11px]">
                        {mtg.relatedTo}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        {mtg.meetLink ? (
                          <a
                            href={mtg.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1f2946] hover:bg-[#2d395e] text-white text-[11px] font-bold shadow-2xs"
                          >
                            <span>Join</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="badge-tag badge-muted text-[10px]">On Campus</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="px-4 py-2 bg-[#fbfbf9] border-t border-[#f1efe9] flex items-center justify-between text-xs text-[#5a6376]">
            <span>Total Records: {meetings.length}</span>
            <button
              onClick={() => setActiveTab('activities')}
              className="text-[#c62d37] hover:underline font-semibold cursor-pointer"
            >
              Full Calendar →
            </button>
          </div>
        </div>

        {/* Workdeck 3: Today's Leads (with 1-Click Convert) */}
        <div className="bg-white border border-[#e3ded5] rounded-xl shadow-2xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="px-4 py-3 border-b border-[#f1efe9] flex items-center justify-between bg-[#faf9f5]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#c62d37]" />
                <h3 className="text-xs font-bold text-[#1f2946] uppercase tracking-wider">
                  Today&apos;s Leads
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-[#5a6376]">Incoming Inquiries</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs table-editorial">
                <thead>
                  <tr>
                    <th className="py-2.5 px-3">Lead Name</th>
                    <th className="py-2.5 px-3">Organization</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">Sector</th>
                    <th className="py-2.5 px-3 text-right">Convert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1efe9]">
                  {leads.slice(0, 4).map((lead) => (
                    <tr key={lead.id} className="hover:bg-[#f7f6f2] transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#1f2946] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{lead.firstName} {lead.lastName}</span>
                          <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                            ★ {lead.leadScore}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#5a6376] font-normal">
                          {lead.designation || 'Contact Person'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-[#1f2946] font-medium max-w-[150px] truncate" title={lead.organization}>
                        {lead.organization}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[#5a6376] whitespace-nowrap font-mono">
                        <div>{lead.email}</div>
                        <div>{lead.phone}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="badge-tag badge-muted text-[9px]">
                          {lead.type.replace('B2B_', '').replace('B2C_', '')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onOpenConvertModal(lead)}
                          className="px-2.5 py-1 rounded bg-[#c62d37] hover:bg-[#a8222e] text-white text-[11px] font-bold shadow-2xs transition cursor-pointer"
                          title="1-Click Convert to Account, Contact & Deal"
                        >
                          Convert
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="px-4 py-2 bg-[#fbfbf9] border-t border-[#f1efe9] flex items-center justify-between text-xs text-[#5a6376]">
            <span>Total Records: {leads.length}</span>
            <button
              onClick={() => setActiveTab('leads')}
              className="text-[#c62d37] hover:underline font-semibold cursor-pointer"
            >
              Manage All Leads →
            </button>
          </div>
        </div>

        {/* Workdeck 4: My Deals Closing This Month */}
        <div className="bg-white border border-[#e3ded5] rounded-xl shadow-2xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="px-4 py-3 border-b border-[#f1efe9] flex items-center justify-between bg-[#faf9f5]">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-[#1f2946] uppercase tracking-wider">
                  My Deals Closing This Month
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-[#047857] font-mono">
                Pipeline: {formatInr(openDealsValue)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs table-editorial">
                <thead>
                  <tr>
                    <th className="py-2.5 px-3">Deal Name</th>
                    <th className="py-2.5 px-3">Amount (₹)</th>
                    <th className="py-2.5 px-3">Stage</th>
                    <th className="py-2.5 px-3">Closing Date</th>
                    <th className="py-2.5 px-3 text-right">Win Prob</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1efe9]">
                  {deals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-[#f7f6f2] transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#1f2946] max-w-[180px] truncate" title={deal.title}>
                        <span>{deal.title}</span>
                        <div className="text-[10px] text-[#5a6376] font-normal truncate">
                          {deal.accountName}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#1f2946] crm-num whitespace-nowrap">
                        {formatInr(deal.amount)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`badge-tag ${
                            deal.stage === 'CLOSED_WON'
                              ? 'badge-emerald'
                              : deal.stage === 'NEGOTIATION_REVIEW'
                              ? 'badge-amber'
                              : 'badge-blue'
                          }`}
                        >
                          {deal.stage.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#5a6376] crm-num whitespace-nowrap">
                        {deal.closingDate}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono font-bold text-emerald-700">
                        {deal.probability}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="px-4 py-2 bg-[#fbfbf9] border-t border-[#f1efe9] flex items-center justify-between text-xs text-[#5a6376]">
            <span>Total Records: {deals.length}</span>
            <button
              onClick={() => setActiveTab('deals')}
              className="text-[#c62d37] hover:underline font-semibold cursor-pointer"
            >
              Full Revenue Pipeline →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
