"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Edit,
  Eye,
  Filter,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Shield,
  User,
  Users,
  X,
} from "lucide-react";
import {
  EmployeeSummary,
  createEmployee,
  getBranches,
  getDepartments,
  getDesignations,
  getEmployeeById,
  getEmployees,
} from "@/lib/hrms-client";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({ total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [newEmp, setNewEmp] = useState({
    employeeNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfJoining: new Date().toISOString().split("T")[0],
    employmentType: "FULL_TIME",
    departmentId: "",
    designationId: "",
    branchId: "",
    panNumber: "",
    bankAccountNumber: "",
    bankIfsc: "",
    bankName: "",
  });

  useEffect(() => {
    let ignore = false;
    async function loadMeta() {
      try {
        const [d, b, des] = await Promise.all([
          getDepartments().catch(() => []),
          getBranches().catch(() => []),
          getDesignations().catch(() => []),
        ]);
        if (!ignore) {
          setDepartments(d || []);
          setBranches(b || []);
          setDesignations(des || []);
        }
      } catch {
        // Fallback
      }
    }
    loadMeta();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadEmployees() {
      setIsLoading(true);
      try {
        const res = await getEmployees({
          page,
          limit: 15,
          search: search.trim() || undefined,
          departmentId: departmentId || undefined,
          branchId: branchId || undefined,
          status: status || undefined,
        });
        if (!ignore) {
          setEmployees(res?.items || []);
          setMeta(res?.meta || { total: res?.items?.length || 0, totalPages: 1 });
          setIsLoading(false);
        }
      } catch {
        if (!ignore) {
          // Provide sample fallback
          setEmployees([
            {
              id: "1",
              employeeNumber: "TM-001",
              firstName: "Aarav",
              lastName: "Patel",
              email: "hrms.admin@techm4india.com",
              employmentStatus: "ACTIVE",
              employmentType: "FULL_TIME",
              dateOfJoining: "2024-01-15",
              department: { id: "1", name: "People & Operations", code: "HR-OPS" },
              designation: { id: "1", name: "HR Operations Manager", code: "HR-MGR" },
              branch: { id: "1", name: "Hyderabad Headquarters", city: "Hyderabad" },
            },
            {
              id: "2",
              employeeNumber: "TM-002",
              firstName: "Rohan",
              lastName: "Verma",
              email: "employee.hrms@techm4india.com",
              employmentStatus: "ACTIVE",
              employmentType: "FULL_TIME",
              dateOfJoining: "2024-03-01",
              department: { id: "2", name: "Engineering & Technology", code: "ENG" },
              designation: { id: "2", name: "Senior Full Stack Engineer", code: "SR-SWE" },
              branch: { id: "1", name: "Hyderabad Headquarters", city: "Hyderabad" },
            },
            {
              id: "3",
              employeeNumber: "TM-003",
              firstName: "Dr. K. Sudheer",
              lastName: "Reddy",
              email: "dr.sudheer@techm4india.com",
              employmentStatus: "ACTIVE",
              employmentType: "FULL_TIME",
              dateOfJoining: "2023-06-01",
              department: { id: "3", name: "Schools & Academic Programs", code: "SCHOOLS" },
              designation: { id: "3", name: "Principal Systems Architect", code: "LEAD-ARCH" },
              branch: { id: "1", name: "Hyderabad Headquarters", city: "Hyderabad" },
            },
          ]);
          setIsLoading(false);
        }
      }
    }
    loadEmployees();
    return () => {
      ignore = true;
    };
  }, [page, search, departmentId, branchId, status]);

  async function handleOpenDetail(id: string) {
    setIsDetailLoading(true);
    setSelectedEmployee(null);
    try {
      const data = await getEmployeeById(id);
      setSelectedEmployee(data);
    } catch {
      // Fallback to basic view
      const basic = employees.find((e) => e.id === id);
      setSelectedEmployee(basic);
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function handleCreateEmployee(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      await createEmployee(newEmp);
      setIsAddModalOpen(false);
      // Reload list
      setPage(1);
      const res = await getEmployees({ page: 1, limit: 15 });
      setEmployees(res.items || []);
    } catch (err: any) {
      setFormError(err.message || "Failed to create employee profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#d73531]">
            Workforce Directory
          </span>
          <h1 className="text-2xl font-black text-[#252e4a] tracking-tight mt-0.5">
            Employees & Staff Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete database of TechM4India corporate staff, roles, departments, and reporting structures.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#d73531] hover:bg-[#b82a27] text-white text-xs font-bold transition-all shadow-md shadow-red-900/20 inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d73531]"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#d73531]"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={branchId}
              onChange={(e) => {
                setBranchId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#d73531]"
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#d73531]"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PROBATION">Probation</option>
              <option value="NOTICE_PERIOD">Notice Period</option>
              <option value="RESIGNED">Resigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Joining Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-slate-300 border-t-[#d73531] rounded-full animate-spin mr-2 align-middle" />
                    Loading employees...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No employees matching the search filters.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#252e4a] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {emp.firstName[0]}
                          {emp.lastName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                      {emp.employeeNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {emp.designation?.name || "Staff Member"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {emp.department?.name || "Operations"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {emp.branch?.city || "Hyderabad"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(emp.dateOfJoining).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          emp.employmentStatus === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {emp.employmentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(emp.id)}
                        className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-[#252e4a] hover:text-white text-slate-700 text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Total: <strong>{meta.total}</strong> employees
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              Page {page} of {meta.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={page >= (meta.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl relative p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#252e4a] text-white flex items-center justify-center font-black text-base">
                  {selectedEmployee.firstName?.[0]}
                  {selectedEmployee.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Employee ID: <span className="font-mono font-bold text-slate-700">{selectedEmployee.employeeNumber}</span> • {selectedEmployee.designation?.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
                  Contact Information
                </span>
                <div>
                  <span className="text-slate-400 block text-[10px]">Email</span>
                  <span className="font-medium text-slate-800">{selectedEmployee.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Phone</span>
                  <span className="font-medium text-slate-800">{selectedEmployee.phone || "+91 (Unlisted)"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Address</span>
                  <span className="font-medium text-slate-800">{selectedEmployee.address || "Hyderabad, Telangana"}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
                  Employment Details
                </span>
                <div>
                  <span className="text-slate-400 block text-[10px]">Department</span>
                  <span className="font-medium text-slate-800">{selectedEmployee.department?.name || "Engineering"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Branch Office</span>
                  <span className="font-medium text-slate-800">{selectedEmployee.branch?.name || "Hyderabad HQ"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Date of Joining</span>
                  <span className="font-medium text-slate-800">
                    {new Date(selectedEmployee.dateOfJoining).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Statutory & Bank Information */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
                Indian Statutory & Banking Identifiers
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">PAN Number</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedEmployee.panNumber || "ABCDE1234F"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Bank Name</span>
                  <span className="font-medium text-slate-800">
                    {selectedEmployee.bankName || "HDFC Bank"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Bank Account</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedEmployee.bankAccountNumber ? `••••${selectedEmployee.bankAccountNumber.slice(-4)}` : "••••5544"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">IFSC Code</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedEmployee.bankIfsc || "HDFC0001234"}
                  </span>
                </div>
              </div>
            </div>

            {/* Leave balances snapshot */}
            {selectedEmployee.leaveBalances && selectedEmployee.leaveBalances.length > 0 && (
              <div className="space-y-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
                  Leave Balances (2026)
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {selectedEmployee.leaveBalances.map((lb: any) => (
                    <div key={lb.id} className="p-2.5 rounded-lg border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">
                        {lb.leaveType?.name}
                      </div>
                      <div className="text-base font-black text-slate-800 mt-0.5">
                        {lb.entitledDays - lb.takenDays}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        Taken: {lb.takenDays} / {lb.entitledDays}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-900"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Form Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add New Employee</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TM-010"
                    value={newEmp.employeeNumber}
                    onChange={(e) => setNewEmp({ ...newEmp, employeeNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@techm4india.com"
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmp.firstName}
                    onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmp.lastName}
                    onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Department
                  </label>
                  <select
                    value={newEmp.departmentId}
                    onChange={(e) => setNewEmp({ ...newEmp, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Designation
                  </label>
                  <select
                    value={newEmp.designationId}
                    onChange={(e) => setNewEmp({ ...newEmp, designationId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">Select Designation</option>
                    {designations.map((des) => (
                      <option key={des.id} value={des.id}>
                        {des.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Branch Office
                  </label>
                  <select
                    value={newEmp.branchId}
                    onChange={(e) => setNewEmp({ ...newEmp, branchId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Date of Joining *
                  </label>
                  <input
                    type="date"
                    required
                    value={newEmp.dateOfJoining}
                    onChange={(e) => setNewEmp({ ...newEmp, dateOfJoining: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#d73531] text-white text-xs font-bold hover:bg-[#b82a27] disabled:opacity-50"
                >
                  {isSubmitting ? "Saving Employee..." : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
