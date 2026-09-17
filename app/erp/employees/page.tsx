"use client";

import { useState, type FormEvent } from "react";
import { Plus, SlidersHorizontal, UserRoundPlus } from "lucide-react";
import { ErpShell } from "../components/erp-shell";
import {
  Avatar,
  EmptyState,
  PageHeader,
  Panel,
  SearchField,
  StatusBadge,
  ToastMessage,
} from "../components/erp-ui";
import { useEmployeesData } from "@/lib/erp/replit-store";

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
      setError("Complete every field before adding this person.");
      return;
    }
    setError("");
    onAdd({ ...form, status: "Active" });
    onSuccess(`${form.name} added to the directory.`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/35 p-0 sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-2xl border border-card-border bg-card shadow-2xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border px-5 py-5">
          <div>
            <div className="mb-1 font-mono-ui text-[10px] uppercase tracking-[.16em] text-primary">
              People / New record
            </div>
            <h3 className="text-lg font-semibold">Add an employee</h3>
          </div>
          <button
            type="button"
            data-testid="button-close-employee-dialog"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold"
          >
            Close
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["name", "Full name"],
              ["email", "Work email"],
              ["role", "Role"],
              ["department", "Department"],
              ["location", "Location"],
            ].map(([key, label], index) => (
              <label key={key} className={`block ${index === 0 ? "sm:col-span-2" : ""}`}>
                <span className="mb-1.5 block text-xs font-semibold text-foreground">{label}</span>
                <input
                  data-testid={`input-employee-${key}`}
                  type={key === "email" ? "email" : "text"}
                  value={form[key as keyof typeof emptyForm]}
                  onChange={(event) => update(key as keyof typeof emptyForm, event.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder={key === "location" ? "Bengaluru, IN" : ""}
                />
              </label>
            ))}
          </div>
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              data-testid="button-cancel-employee"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="button-submit-employee"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Add employee
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
  const [toast, setToast] = useState("");

  const { employees, addEmployee } = useEmployeesData({
    search: search || undefined,
    department: department || undefined,
  });

  return (
    <ErpShell>
      <div className="page-enter">
        <PageHeader
          eyebrow="People operations"
          title="Employee directory"
          description="One source of truth for the people building and delivering the work."
          action={
            <button
              type="button"
              data-testid="button-add-employee"
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add employee
            </button>
          }
        />
        <Panel>
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
            <SearchField value={search} onChange={setSearch} placeholder="Search by name or email" />
            <div className="flex h-10 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm text-muted-foreground sm:w-48">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
              <select
                data-testid="select-department-filter"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="w-full bg-transparent text-sm text-foreground outline-none cursor-pointer"
              >
                <option value="">All departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Delivery">Delivery</option>
                <option value="Growth">Growth</option>
                <option value="Leadership">Leadership</option>
                <option value="People">People</option>
              </select>
            </div>
            <div className="hidden items-center px-2 font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground sm:flex">
              {employees.length} records
            </div>
          </div>
          {employees.length === 0 ? (
            <EmptyState
              title="No people match this view"
              description="Try a wider search or add the next person to the team."
              action={
                <button
                  type="button"
                  data-testid="button-empty-add-employee"
                  onClick={() => setDialogOpen(true)}
                  className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                >
                  <UserRoundPlus className="mr-1.5 inline h-3.5 w-3.5" />
                  Add employee
                </button>
              }
            />
          ) : (
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead className="bg-background/60 font-mono-ui text-[10px] uppercase tracking-[.13em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Person</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/65">
                  {employees.map((employee) => (
                    <tr key={employee.id} data-testid={`row-employee-${employee.id}`} className="group hover:bg-background/70">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar initials={employee.initials} />
                          <div>
                            <div className="text-sm font-semibold text-foreground">{employee.name}</div>
                            <div className="mt-0.5 text-xs text-muted-foreground">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">{employee.role}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{employee.department}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{employee.location}</td>
                      <td className="px-4 py-4">
                        <StatusBadge value={employee.status} />
                      </td>
                      <td className="px-5 py-4 text-right font-mono-ui text-[11px] text-muted-foreground">
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
        {toast && <ToastMessage message={toast} onDismiss={() => setToast("")} />}
      </div>
    </ErpShell>
  );
}
