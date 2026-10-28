'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  ExternalLink,
  Filter,
  MapPin,
  MoreHorizontal,
  Phone,
  PhoneCall,
  Plus,
  Search,
  Sparkles,
  Square,
  User,
  Video,
  X,
} from 'lucide-react';
import { CallLogItem, MeetingItem, TaskItem } from '../types';

interface CrmActivitiesViewProps {
  tasks: TaskItem[];
  meetings: MeetingItem[];
  callLogs: CallLogItem[];
  initialSubTab?: 'TASKS' | 'MEETINGS' | 'CALLS';
  onToggleTask: (taskId: string) => void;
  onCreateTask: (task: Partial<TaskItem>) => void;
  onCreateMeeting: (meeting: Partial<MeetingItem>) => void;
  onCreateCallLog: (call: Partial<CallLogItem>) => void;
}

export const CrmActivitiesView: React.FC<CrmActivitiesViewProps> = ({
  tasks,
  meetings,
  callLogs,
  initialSubTab = 'TASKS',
  onToggleTask,
  onCreateTask,
  onCreateMeeting,
  onCreateCallLog,
}) => {
  const [subTab, setSubTab] = useState<'TASKS' | 'MEETINGS' | 'CALLS'>(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  // Task form
  const [taskData, setTaskData] = useState({
    subject: '',
    dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    priority: 'HIGH' as 'HIGH' | 'NORMAL' | 'LOW',
    relatedTo: 'Anurag University',
    relatedType: 'ACCOUNT' as 'LEAD' | 'DEAL' | 'ACCOUNT',
    assignedTo: 'Aryan Reddy',
  });

  // Meeting form
  const [meetingData, setMeetingData] = useState({
    title: '',
    fromTime: '11:00 AM',
    toTime: '11:45 AM',
    location: 'Google Meet',
    meetLink: 'https://meet.google.com/new',
    relatedTo: 'Anurag University',
    relatedType: 'ACCOUNT' as 'LEAD' | 'DEAL' | 'ACCOUNT',
    host: 'Aryan Reddy',
  });

  // Call form
  const [callData, setCallData] = useState({
    subject: '',
    callTime: 'Today, 2:30 PM',
    durationMinutes: 15,
    contactName: '',
    organization: '',
    outcome: 'INTERESTED' as CallLogItem['outcome'],
    notes: '',
  });

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.relatedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      taskFilter === 'ALL' ||
      (taskFilter === 'COMPLETED' && t.status === 'COMPLETED') ||
      (taskFilter === 'PENDING' && t.status !== 'COMPLETED');
    return matchesSearch && matchesFilter;
  });

  const filteredMeetings = meetings.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.relatedTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCalls = callLogs.filter(
    (c) =>
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTask({
      ...taskData,
      status: 'NOT_STARTED',
    });
    setIsTaskModalOpen(false);
  };

  const handleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateMeeting(meetingData);
    setIsMeetingModalOpen(false);
  };

  const handleCallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCallLog(callData);
    setIsCallModalOpen(false);
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-[#1f2946] flex items-center gap-2">
            <span>Sales Activities &amp; Engagements</span>
            <span className="badge-tag badge-emerald text-[10px]">
              {tasks.length + meetings.length + callLogs.length} Total
            </span>
          </h1>
          <p className="text-xs text-[#5a6376] mt-0.5">
            Manage your daily tasks, institutional campus meetings, and phone outreach logs.
          </p>
        </div>

        {/* Tab Controls & Add Action */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#f7f6f2] p-1 rounded-lg border border-[#e3ded5]">
            <button
              onClick={() => setSubTab('TASKS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                subTab === 'TASKS'
                  ? 'bg-white text-[#1f2946] shadow-2xs'
                  : 'text-[#5a6376] hover:text-[#1f2946]'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Tasks ({tasks.length})</span>
            </button>
            <button
              onClick={() => setSubTab('MEETINGS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                subTab === 'MEETINGS'
                  ? 'bg-white text-[#1f2946] shadow-2xs'
                  : 'text-[#5a6376] hover:text-[#1f2946]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Meetings ({meetings.length})</span>
            </button>
            <button
              onClick={() => setSubTab('CALLS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                subTab === 'CALLS'
                  ? 'bg-white text-[#1f2946] shadow-2xs'
                  : 'text-[#5a6376] hover:text-[#1f2946]'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Logs ({callLogs.length})</span>
            </button>
          </div>

          {subTab === 'TASKS' && (
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#c62d37] hover:bg-[#a8222b] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          )}

          {subTab === 'MEETINGS' && (
            <button
              onClick={() => setIsMeetingModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#c62d37] hover:bg-[#a8222b] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Meeting</span>
            </button>
          )}

          {subTab === 'CALLS' && (
            <button
              onClick={() => setIsCallModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#c62d37] hover:bg-[#a8222b] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Call</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. TASKS VIEW */}
      {subTab === 'TASKS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#e3ded5]">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#88909f]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks or institutions..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs focus:border-[#1f2946]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTaskFilter('ALL')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg cursor-pointer transition ${
                  taskFilter === 'ALL'
                    ? 'bg-[#1f2946] text-white'
                    : 'bg-[#f7f6f2] text-[#5a6376] hover:bg-[#e3ded5]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTaskFilter('PENDING')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg cursor-pointer transition ${
                  taskFilter === 'PENDING'
                    ? 'bg-[#1f2946] text-white'
                    : 'bg-[#f7f6f2] text-[#5a6376] hover:bg-[#e3ded5]'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setTaskFilter('COMPLETED')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg cursor-pointer transition ${
                  taskFilter === 'COMPLETED'
                    ? 'bg-[#1f2946] text-white'
                    : 'bg-[#f7f6f2] text-[#5a6376] hover:bg-[#e3ded5]'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#e3ded5] shadow-2xs divide-y divide-[#e3ded5]">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#fcfbf9] transition"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="p-1 text-[#88909f] hover:text-[#1f2946] transition cursor-pointer"
                  >
                    {task.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        task.status === 'COMPLETED'
                          ? 'line-through text-[#88909f]'
                          : 'text-[#1f2946]'
                      }`}
                    >
                      {task.subject}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-[#5a6376] mt-0.5">
                      <span>Related: {task.relatedTo}</span>
                      <span>·</span>
                      <span>Assigned to: {task.assignedTo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`badge-tag ${
                      task.priority === 'HIGH'
                        ? 'badge-crimson'
                        : task.priority === 'NORMAL'
                        ? 'badge-blue'
                        : 'badge-gray'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <div className="text-right text-[11px] text-[#5a6376] hidden sm:block">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#88909f]" />
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="p-8 text-center text-xs text-[#88909f]">
                No tasks found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. MEETINGS VIEW */}
      {subTab === 'MEETINGS' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs space-y-3 hover:border-[#c62d37]/40 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#fff1f2] text-[#c62d37] flex items-center justify-center">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#1f2946]">{meeting.title}</h4>
                      <div className="text-[11px] text-[#5a6376]">{meeting.relatedTo}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#fcfbf9] p-2.5 rounded-lg border border-[#e3ded5] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[#1f2946]">
                    <span className="font-semibold">{meeting.fromTime} - {meeting.toTime}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">Today</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#5a6376] text-[11px]">
                    <MapPin className="w-3 h-3 text-[#88909f]" />
                    <span>{meeting.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#88909f]">Host: {meeting.host}</span>
                  <a
                    href={meeting.meetLink || 'https://meet.google.com/new'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1f2946] hover:bg-[#c62d37] text-white rounded-md text-[11px] font-semibold transition shadow-2xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Call</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
          {filteredMeetings.length === 0 && (
            <div className="bg-white p-10 rounded-xl border border-[#e3ded5] text-center text-xs text-[#88909f]">
              No scheduled meetings.
            </div>
          )}
        </div>
      )}

      {/* 3. CALL LOGS VIEW */}
      {subTab === 'CALLS' && (
        <div className="bg-white rounded-xl border border-[#e3ded5] shadow-2xs divide-y divide-[#e3ded5]">
          {filteredCalls.map((call) => (
            <div key={call.id} className="p-4 hover:bg-[#fcfbf9] transition space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#1f2946] flex items-center gap-2">
                    <span>{call.subject}</span>
                    <span className="badge-tag badge-emerald text-[9px]">{call.outcome.replace('_', ' ')}</span>
                  </h4>
                  <div className="text-[11px] text-[#5a6376] mt-0.5">
                    Contact: <span className="font-semibold text-[#1f2946]">{call.contactName}</span> ({call.organization})
                  </div>
                </div>

                <div className="text-right text-[11px] text-[#5a6376]">
                  <div>{call.callTime}</div>
                  <div className="text-[#88909f]">{call.durationMinutes} minutes</div>
                </div>
              </div>

              {call.notes && (
                <div className="text-xs bg-[#f7f6f2] p-2.5 rounded-lg border border-[#e3ded5] text-[#5a6376]">
                  &ldquo;{call.notes}&rdquo;
                </div>
              )}
            </div>
          ))}
          {filteredCalls.length === 0 && (
            <div className="p-8 text-center text-xs text-[#88909f]">
              No call logs recorded.
            </div>
          )}
        </div>
      )}

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#e3ded5] shadow-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e3ded5]">
              <h3 className="font-bold text-sm text-[#1f2946]">Create New Task</h3>
              <button onClick={() => setIsTaskModalOpen(false)}>
                <X className="w-4 h-4 text-[#88909f]" />
              </button>
            </div>
            <form onSubmit={handleTaskSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={taskData.subject}
                  onChange={(e) => setTaskData({ ...taskData, subject: e.target.value })}
                  placeholder="e.g. Send Revised Lab Equipment BOM"
                  className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskData.dueDate}
                    onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">Priority</label>
                  <select
                    value={taskData.priority}
                    onChange={(e) => setTaskData({ ...taskData, priority: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="NORMAL">Normal</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">Related Entity</label>
                <input
                  type="text"
                  value={taskData.relatedTo}
                  onChange={(e) => setTaskData({ ...taskData, relatedTo: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e3ded5]">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#5a6376] border border-[#e3ded5] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#c62d37] text-white rounded-lg text-xs font-semibold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meeting Modal */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#e3ded5] shadow-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e3ded5]">
              <h3 className="font-bold text-sm text-[#1f2946]">Schedule Institutional Meeting</h3>
              <button onClick={() => setIsMeetingModalOpen(false)}>
                <X className="w-4 h-4 text-[#88909f]" />
              </button>
            </div>
            <form onSubmit={handleMeetingSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">Meeting Title *</label>
                <input
                  type="text"
                  required
                  value={meetingData.title}
                  onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
                  placeholder="e.g. MoU Finalization with Dean R&D"
                  className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">From Time</label>
                  <input
                    type="text"
                    value={meetingData.fromTime}
                    onChange={(e) => setMeetingData({ ...meetingData, fromTime: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">To Time</label>
                  <input
                    type="text"
                    value={meetingData.toTime}
                    onChange={(e) => setMeetingData({ ...meetingData, toTime: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">Location</label>
                <input
                  type="text"
                  value={meetingData.location}
                  onChange={(e) => setMeetingData({ ...meetingData, location: e.target.value })}
                  placeholder="Google Meet or Campus Location"
                  className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e3ded5]">
                <button
                  type="button"
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#5a6376] border border-[#e3ded5] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#c62d37] text-white rounded-lg text-xs font-semibold"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Call Modal */}
      {isCallModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#e3ded5] shadow-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e3ded5]">
              <h3 className="font-bold text-sm text-[#1f2946]">Log Phone Call</h3>
              <button onClick={() => setIsCallModalOpen(false)}>
                <X className="w-4 h-4 text-[#88909f]" />
              </button>
            </div>
            <form onSubmit={handleCallSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={callData.subject}
                  onChange={(e) => setCallData({ ...callData, subject: e.target.value })}
                  placeholder="e.g. Discovery Call with Principal"
                  className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={callData.contactName}
                    onChange={(e) => setCallData({ ...callData, contactName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">Institution</label>
                  <input
                    type="text"
                    required
                    value={callData.organization}
                    onChange={(e) => setCallData({ ...callData, organization: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">Outcome</label>
                <select
                  value={callData.outcome}
                  onChange={(e) => setCallData({ ...callData, outcome: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                >
                  <option value="INTERESTED">Interested in Lab Setup</option>
                  <option value="DEMO_FIXED">Demo / Campus Visit Fixed</option>
                  <option value="CALLBACK_REQUESTED">Callback Requested</option>
                  <option value="NO_ANSWER">No Answer</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#1f2946] mb-1">Discussion Notes</label>
                <textarea
                  rows={2}
                  value={callData.notes}
                  onChange={(e) => setCallData({ ...callData, notes: e.target.value })}
                  placeholder="Key takeaways, requested materials..."
                  className="w-full px-3 py-1.5 bg-[#f7f6f2] border border-[#e3ded5] rounded-lg text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e3ded5]">
                <button
                  type="button"
                  onClick={() => setIsCallModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#5a6376] border border-[#e3ded5] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#c62d37] text-white rounded-lg text-xs font-semibold"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
