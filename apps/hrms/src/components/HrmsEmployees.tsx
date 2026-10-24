import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  Edit,
  Eye,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Shield,
  User,
  Users,
  X,
} from 'lucide-react';
import { EmployeeItem } from '../types';

interface HrmsEmployeesProps {
  employees: EmployeeItem[];
  onAddEmployee: (data: Partial<EmployeeItem>) => void;
}

export const HrmsEmployees: React.FC<HrmsEmployeesProps> = ({
  employees,
  onAddEmployee,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [selectedEmp, setSelectedEmp] = useState<EmployeeItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New hire form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Engineering & Technology');
  const [designation, setDesignation] = useState('Software Engineer');
  const [ctcAnnual, setCtcAnnual] = useState(1200000);
  const [panNumber, setPanNumber] = useState('');
  const [pfUan, setPfUan] = useState('');

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept =
      deptFilter === 'ALL' || emp.department.name.toLowerCase().includes(deptFilter.toLowerCase());
    return matchesSearch && matchesDept;
  });

  const handleSubmitNewHire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email) return;

    onAddEmployee({
      firstName,
      lastName,
      email,
      phone,
      department: { id: `d-${Date.now()}`, name: department, code: 'DEPT' },
      designation: { id: `des-${Date.now()}`, title: designation, level: 3 },
      branch: { id: 'b-1', name: 'Hyderabad Headquarters', city: 'Hyderabad' },
      panNumber: panNumber || 'ABCDE1234F',
      pfUan: pfUan || '100987654320',
      ctcAnnual: Number(ctcAnnual) || 1200000,
      employmentStatus: 'ACTIVE',
      employmentType: 'FULL_TIME',
      dateOfJoining: new Date().toISOString().split('T')[0],
    });

    setIsAddModalOpen(false);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Filters & Add Employee */}
      <div className="bg-white rounded-2xl p-6 border border-[#e3ded5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1f2946] tracking-tight">
            Workforce Directory &amp; Digital Profiles
          </h2>
          <p className="text-xs text-[#5a6376] mt-1">
            Complete employee census with Indian statutory identifiers (PAN, UAN) and departmental assignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-[#5a6376] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#d1cbbf] text-xs bg-[#f7f6f2] focus:bg-white focus:border-[#1f2946] focus:outline-hidden transition-all text-[#1f2946]"
            />
          </div>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-[#d1cbbf] text-xs bg-[#f7f6f2] text-[#1f2946] font-semibold focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="People">People &amp; Operations</option>
            <option value="Finance">Finance &amp; Accounts</option>
            <option value="Schools">Schools &amp; Academic</option>
            <option value="Space">Space Systems</option>
          </select>

          {/* Add Employee Trigger */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#1f2946] hover:bg-[#151c31] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Hire</span>
          </button>
        </div>
      </div>

      {/* Employees Table Card */}
      <div className="bg-white rounded-2xl border border-[#e3ded5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f7f6f2] border-b border-[#e3ded5] text-[#5a6376] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Emp Code</th>
                <th className="py-3 px-4">Department &amp; Designation</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Statutory Identifiers</th>
                <th className="py-3 px-4">Duty Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece3]">
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-[#fbfbf9] transition-colors cursor-pointer"
                  onClick={() => setSelectedEmp(emp)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c62d37] to-[#1f2946] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                        {emp.firstName[0]}
                        {emp.lastName[0] || ''}
                      </div>
                      <div>
                        <div className="font-bold text-[#1f2946]">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-[#5a6376] text-[11px]">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-[#1f2946] px-2 py-0.5 rounded bg-[#f1efe9] border border-[#d1cbbf]">
                      {emp.employeeNumber}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#1f2946]">{emp.designation.title}</div>
                    <div className="text-[11px] text-[#5a6376]">{emp.department.name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-[#1f2946] font-medium">{emp.branch.name}</div>
                    <div className="text-[11px] text-[#5a6376]">{emp.branch.city}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-[11px] text-[#5a6376]">
                      PAN: <strong className="text-[#1f2946] font-mono">{emp.panNumber || '—'}</strong>
                    </div>
                    <div className="text-[11px] text-[#5a6376]">
                      UAN: <strong className="text-[#1f2946] font-mono">{emp.pfUan || '—'}</strong>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                      {emp.employmentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmp(emp);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#f1efe9] hover:bg-[#e8e4da] text-[#1f2946] font-bold text-[11px] border border-[#d1cbbf] transition shadow-xs"
                    >
                      Profile &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 border border-[#e3ded5] shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedEmp(null)}
              className="absolute right-5 top-5 p-1 rounded-lg text-[#5a6376] hover:bg-[#f7f6f2] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c62d37] to-[#1f2946] text-white flex items-center justify-center text-xl font-black shadow-md shrink-0">
                {selectedEmp.firstName[0]}
                {selectedEmp.lastName[0] || ''}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1f2946]">
                  {selectedEmp.firstName} {selectedEmp.lastName}
                </h3>
                <p className="text-xs text-[#5a6376]">
                  {selectedEmp.designation.title} · {selectedEmp.department.name}
                </p>
                <span className="inline-block mt-1 font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#f1efe9] text-[#1f2946] border border-[#d1cbbf]">
                  {selectedEmp.employeeNumber}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#f7f6f2] border border-[#e3ded5] space-y-1">
                <span className="text-[#5a6376]">Corporate Email</span>
                <div className="font-semibold text-[#1f2946] break-all">{selectedEmp.email}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#f7f6f2] border border-[#e3ded5] space-y-1">
                <span className="text-[#5a6376]">Contact Phone</span>
                <div className="font-semibold text-[#1f2946]">{selectedEmp.phone}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#f7f6f2] border border-[#e3ded5] space-y-1">
                <span className="text-[#5a6376]">PAN Number</span>
                <div className="font-mono font-bold text-[#1f2946]">{selectedEmp.panNumber || '—'}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#f7f6f2] border border-[#e3ded5] space-y-1">
                <span className="text-[#5a6376]">PF UAN Number</span>
                <div className="font-mono font-bold text-[#1f2946]">{selectedEmp.pfUan || '—'}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#f7f6f2] border border-[#e3ded5] space-y-1">
                <span className="text-[#5a6376]">Bank Account</span>
                <div className="font-mono font-bold text-[#1f2946]">
                  {selectedEmp.bankAccount || '50100456789123'} ({selectedEmp.bankName || 'HDFC'})
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#f7f6f2] border border-[#e3ded5] space-y-1">
                <span className="text-[#5a6376]">Annual Compensation (CTC)</span>
                <div className="font-mono font-bold text-[#047857] text-sm">
                  ₹{(selectedEmp.ctcAnnual || 1800000).toLocaleString('en-IN')}/yr
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedEmp(null)}
                className="px-4 py-2 rounded-xl bg-[#1f2946] text-white text-xs font-bold hover:bg-[#151c31] transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard New Hire Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-[#e3ded5] shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-lg text-[#5a6376] hover:bg-[#f7f6f2] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-[#1f2946]">Onboard New Employee</h3>
              <p className="text-xs text-[#5a6376] mt-0.5">
                Register a new workforce member under the central identity directory.
              </p>
            </div>

            <form onSubmit={handleSubmitNewHire} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5a6376] font-bold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Sravya"
                    className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] focus:bg-white text-[#1f2946]"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6376] font-bold mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Rao"
                    className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] focus:bg-white text-[#1f2946]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#5a6376] font-bold mb-1">Corporate Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@techm4india.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] focus:bg-white text-[#1f2946]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5a6376] font-bold mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] text-[#1f2946] font-medium"
                  >
                    <option value="Engineering & Technology">Engineering &amp; Technology</option>
                    <option value="People & Operations">People &amp; Operations</option>
                    <option value="Finance & Accounts">Finance &amp; Accounts</option>
                    <option value="Schools & Academic STEM">Schools &amp; Academic</option>
                    <option value="Space Systems & CanSat">Space Systems</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#5a6376] font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] text-[#1f2946]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5a6376] font-bold mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] font-mono text-[#1f2946]"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6376] font-bold mb-1">PF UAN Number</label>
                  <input
                    type="text"
                    value={pfUan}
                    onChange={(e) => setPfUan(e.target.value)}
                    placeholder="100987654321"
                    className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] font-mono text-[#1f2946]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#5a6376] font-bold mb-1">Annual CTC (INR)</label>
                <input
                  type="number"
                  value={ctcAnnual}
                  onChange={(e) => setCtcAnnual(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#d1cbbf] bg-[#f7f6f2] font-mono text-[#1f2946]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#d1cbbf] text-[#5a6376] hover:bg-[#f7f6f2] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1f2946] text-white hover:bg-[#151c31] font-bold shadow-xs"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
