'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Layers,
  Mail,
  Megaphone,
  MessageSquare,
  Plus,
  Rocket,
  Search,
  Send,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { CampaignItem } from '../types';

interface CrmCampaignsViewProps {
  campaigns: CampaignItem[];
  onCreateCampaign: (campaign: Partial<CampaignItem>) => void;
}

export const CrmCampaignsView: React.FC<CrmCampaignsViewProps> = ({
  campaigns,
  onCreateCampaign,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    channel: 'WHATSAPP' as CampaignItem['channel'],
    targetAudience: '120 Autonomous Engineering Colleges in South India',
    status: 'ACTIVE' as CampaignItem['status'],
    sentCount: 120,
    openedCount: 98,
    repliedCount: 42,
    leadsGenerated: 18,
  });

  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.targetAudience.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getChannelBadge = (channel: CampaignItem['channel']) => {
    switch (channel) {
      case 'WHATSAPP':
        return <span className="badge-tag badge-emerald font-semibold">WhatsApp Business API</span>;
      case 'EMAIL':
        return <span className="badge-tag badge-blue font-semibold">Email Outreach</span>;
      case 'LINKEDIN':
        return <span className="badge-tag badge-purple font-semibold">LinkedIn InMail</span>;
      default:
        return <span className="badge-tag badge-gray">{channel}</span>;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCampaign(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-[#1f2946] flex items-center gap-2">
            <span>Institutional Outreach Campaigns</span>
            <span className="badge-tag badge-purple text-[10px]">
              {filteredCampaigns.length} Campaigns
            </span>
          </h1>
          <p className="text-xs text-[#5a6376] mt-0.5">
            Automated WhatsApp and Email outreach targeting Principals, Deans of R&amp;D, and Trustees.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#c62d37] hover:bg-[#a8222b] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampaigns.map((camp) => {
          const openRate =
            camp.sentCount > 0 ? Math.round((camp.openedCount / camp.sentCount) * 100) : 0;
          const replyRate =
            camp.openedCount > 0 ? Math.round((camp.repliedCount / camp.openedCount) * 100) : 0;

          return (
            <div
              key={camp.id}
              className="bg-white p-5 rounded-xl border border-[#e3ded5] hover:border-[#c62d37]/40 transition shadow-2xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#1f2946]">{camp.name}</h3>
                  <div className="text-[11px] text-[#5a6376] mt-0.5">{camp.targetAudience}</div>
                </div>
                {getChannelBadge(camp.channel)}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-2 bg-[#fcfbf9] p-3 rounded-xl border border-[#e3ded5] text-center">
                <div>
                  <div className="text-[10px] text-[#88909f] uppercase font-semibold">Sent</div>
                  <div className="text-xs font-bold text-[#1f2946] mt-0.5">{camp.sentCount}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#88909f] uppercase font-semibold">Opened</div>
                  <div className="text-xs font-bold text-blue-700 mt-0.5">{camp.openedCount}</div>
                  <div className="text-[9px] text-[#88909f]">{openRate}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#88909f] uppercase font-semibold">Replies</div>
                  <div className="text-xs font-bold text-purple-700 mt-0.5">{camp.repliedCount}</div>
                  <div className="text-[9px] text-[#88909f]">{replyRate}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#88909f] uppercase font-semibold">Leads</div>
                  <div className="text-xs font-bold text-emerald-700 mt-0.5">
                    {camp.leadsGenerated}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#5a6376] pt-1">
                <span>Started: {camp.startDate}</span>
                <span className="font-semibold text-emerald-600">Active Campaign</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#e3ded5] shadow-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e3ded5]">
              <h3 className="font-bold text-sm text-[#1f2946]">Launch Outreach Campaign</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-[#88909f]" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Telangana NAAC A++ Engineering Deans Briefing"
                  className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Channel
                  </label>
                  <select
                    value={formData.channel}
                    onChange={(e) =>
                      setFormData({ ...formData, channel: e.target.value as any })
                    }
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  >
                    <option value="WHATSAPP">WhatsApp Business API</option>
                    <option value="EMAIL">Verified Email Outreach</option>
                    <option value="LINKEDIN">LinkedIn InMail</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                    Target Count
                  </label>
                  <input
                    type="number"
                    value={formData.sentCount}
                    onChange={(e) =>
                      setFormData({ ...formData, sentCount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e3ded5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#5a6376] border border-[#e3ded5] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#c62d37] text-white rounded-lg text-xs font-semibold"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
