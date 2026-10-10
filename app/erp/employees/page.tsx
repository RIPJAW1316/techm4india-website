"use client";

import { useState, type FormEvent } from "react";
import { Briefcase, Building2, Mail, MapPin, Plus, SlidersHorizontal, User, UserRoundPlus, X } from "lucide-react";
import { ErpShell } from "../components/erp-shell";
import {
  Avatar,
  EmptyState,
  PageHeader,
  Panel,
  SearchField,
  SlideOverDrawer,
  StatusBadge,
  ToastMessage,
} from "../components/erp-ui";
import { useEmployeesData } from "@/lib/erp/replit-store";
import type { Employee } from "@/lib/erp/replit-data";

const emptyForm = { name: "", email: "", role: "", department: "", location: "" };

function EmployeeDialog({
  onClose,
  onSuccess,
  onAdd,
}: {
  onClose: () => void;
  onSuccess: (message: string) => void;
  onAdd: (data: typeof emptyForm & { status: string }) => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const update = (key: keyof typeof emptyForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.role || !form.department || !form.location) {
      setError("Please complete all required fields before adding this team member.");
      return;
    }
    setError("");
    onAdd({ ...form, status: "Active" });
    onSuccess(`${form.name} added to the employee directory.`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity erp-modal-backdrop"
    >
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close dialog" />
      <div
        className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-200/80 bg-white shadow-2xl erp-modal-box overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Add employee"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 border border-teal-200/60 text-teal-600 shadow-xs">
              <UserRoundPlus className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-[.18em] text-teal-700">
                  People Ops · New Record
                </span>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">Add Team Member</h3>
            </div>
          </div>
          <button
            type="button"
            data-testid="button-close-employee-dialog"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={submit}>
          <div className="space-y-4 p-6">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    Full Name <span className="text-rose-500">*</span>
                  </span>
                  <input
                    data-testid="input-employee-name"
                    type="text"
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                    placeholder="e.g. Vikram Sharma"
                  />
                </label>
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    Work Email <span className="text-rose-500">*</span>
                  </span>
                  <input
                    data-testid="input-employee-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                    placeholder="vikram@techm4india.com"
                  />
                </label>
              </div>

              {/* Role */}
              <div>
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                    Role / Title <span className="text-rose-500">*</span>
                  </span>
                  <input
                    data-testid="input-employee-role"
                    type="text"
                    value={form.role}
                    onChange={(event) => update("role", event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                    placeholder="e.g. Lead Systems Engineer"
                  />
                </label>
              </div>

              {/* Department */}
              <div>
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    Department <span className="text-rose-500">*</span>
                  </span>
                  <input
                    data-testid="input-employee-department"
                    type="text"
                    value={form.department}
                    onChange={(event) => update("department", event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                    placeholder="Engineering / Delivery / Growth"
                  />
                </label>
              </div>

              {/* Location */}
              <div className="sm:col-span-2">
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Operating Location <span className="text-rose-500">*</span>
                  </span>
                  <input
                    data-testid="input-employee-location"
                    type="text"
                    value={form.location}
                    onChange={(event) => update("location", event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                    placeholder="Bengaluru, Karnataka, IN"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <button
              type="button"
              data-testid="button-cancel-employee"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="button-submit-employee"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 transition-colors focus:ring-2 focus:ring-teal-600/20"
            >
              <UserRoundPlus className="h-4 w-4" />
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Employees() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [toast, setToast] = useState("");

  const { employees, addEmployee } = useEmployeesData({
    search: search || undefined,
    department: department || undefined,
  });

  return (
    <ErpShell>
      <div className="page-enter">
        <PageHeader
          eyebrow="People Operations"
          title="Employee Directory"
          description="Enterprise directory and organization management for all active team members across divisions."
          action={
            <button
              type="button"
              data-testid="button-add-employee"
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add employee
            </button>
          }
        />
        <Panel>
          {/* Controls Bar */}
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/40 p-4 sm:flex-row sm:items-center">
            <SearchField value={search} onChange={setSearch} placeholder="Search by name, role, or email" />
            <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500 sm:w-56 shadow-xs focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/10 transition-all">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
              <select
                data-testid="select-department-filter"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 outline-none cursor-pointer"
              >
                <option value="">All departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Delivery">Delivery</option>
                <option value="Growth">Growth</option>
                <option value="Leadership">Leadership</option>
                <option value="People">People</option>
              </select>
            </div>
            <div className="ml-auto hidden items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono-ui text-[11px] font-semibold uppercase tracking-wider text-slate-600 shadow-xs sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
              {employees.length} team members
            </div>
          </div>

          {/* Table */}
          {employees.length === 0 ? (
            <EmptyState
              title="No people match this view"
              description="Try adjusting your search criteria or add a new team member to the directory."
              action={
                <button
                  type="button"
                  data-testid="button-empty-add-employee"
                  onClick={() => setDialogOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-500"
                >
                  <UserRoundPlus className="h-3.5 w-3.5" />
                  Add employee
                </button>
              }
            />
          ) : (
            <div className="scrollbar-thin overflow-x-auto">
              <table className="erp-table-modern erp-table-clickable w-full min-w-[760px] text-left">
                <thead>
                  <tr>
                    <th className="px-5 py-3">Team Member</th>
                    <th className="px-4 py-3">Designation</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((employee) => (
                    <tr
                      key={employee.id}
                      data-testid={`row-employee-${employee.id}`}
                      onClick={() => setSelectedEmployee(employee)}
                      className="group cursor-pointer hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar initials={employee.initials} className="h-9 w-9 rounded-xl shadow-xs" />
                          <div>
                            <div className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                              {employee.name}
                            </div>
                            <div className="text-xs text-slate-400 font-mono-ui">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-slate-800">{employee.role}</td>
                      <td className="px-4 py-3.5 text-sm">
                        <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {employee.department}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {employee.location}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge value={employee.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono-ui text-xs text-slate-500">
                        {employee.joinedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        {dialogOpen && (
          <EmployeeDialog
            onClose={() => setDialogOpen(false)}
            onSuccess={setToast}
            onAdd={addEmployee}
          />
        )}
        <SlideOverDrawer
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          title={selectedEmployee?.name ?? "Employee Profile"}
          subtitle={`${selectedEmployee?.role ?? ""} · ${selectedEmployee?.department ?? ""}`}
          footer={
            <div className="flex items-center justify-between">
              <span className="font-mono-ui text-xs text-slate-500">ID: EMP-00{selectedEmployee?.id}</span>
              <button
                type="button"
                onClick={() => {
                  setToast(`Profile for ${selectedEmployee?.name} synchronized.`);
                  setSelectedEmployee(null);
                }}
                className="rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-xs transition-colors"
              >
                Close Inspector
              </button>
            </div>
          }
        >
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <Avatar initials={selectedEmployee.initials} className="h-14 w-14 text-base rounded-2xl shadow-xs" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedEmployee.name}</h3>
                  <p className="text-xs text-slate-500 font-mono-ui">{selectedEmployee.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge value={selectedEmployee.status} />
                    <span className="rounded bg-slate-200/70 px-2 py-0.5 font-mono-ui text-[10px] font-semibold text-slate-700">
                      {selectedEmployee.department}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
                  <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-400">Designation</span>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{selectedEmployee.role}</div>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
                  <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-400">Location</span>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{selectedEmployee.location}</div>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
                  <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-400">Joined Date</span>
                  <div className="mt-1 font-mono-ui text-sm font-semibold text-slate-900">{selectedEmployee.joinedAt}</div>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
                  <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-400">Workstation</span>
                  <div className="mt-1 text-sm font-semibold text-slate-900">Hyderabad Hub</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono-ui mb-3">
                  Operational Responsibilities
                </h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                    <span>Authorized for division milestone approvals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                    <span>Synchronized with central HR attendance & payroll</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                    <span>Standard enterprise SLA response coverage</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </SlideOverDrawer>
        {toast && <ToastMessage message={toast} onDismiss={() => setToast("")} />}
      </div>
    </ErpShell>
  );
}
