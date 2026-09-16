/**
 * Single source of truth for the ERP workspace navigation.
 *
 * Every ERP page reads its sidebar, breadcrumb and page title from this
 * registry, so a module can never appear in one place and be missing from
 * another. Each entry carries the permission that gates it: the shell hides
 * modules the signed-in principal cannot open, which mirrors the backend
 * `PermissionsGuard` rather than relying on the user not clicking.
 */

export type ErpModuleId =
  | "dashboard"
  | "work"
  | "employees"
  | "recruitment"
  | "users"
  | "organization"
  | "attendance"
  | "leave"
  | "payroll"
  | "finance"
  | "crm"
  | "institutions"
  | "programs"
  | "performance"
  | "supply-chain"
  | "support"
  | "cms"
  | "compliance"
  | "delivery"
  | "analytics";

export type ErpModuleGroupId =
  "overview" | "people" | "commercial" | "delivery" | "operations" | "administration";

export type ErpModule = {
  id: ErpModuleId;
  /** Sidebar label. */
  label: string;
  /** Page heading, used by the shell so a module's title cannot drift. */
  title: string;
  href: string;
  group: ErpModuleGroupId;
  /** Permission required to open the module. Absent means always visible. */
  permission?: string;
  /** Short line rendered under the page title. */
  summary: string;
};

export const ERP_MODULE_GROUPS: Array<{ id: ErpModuleGroupId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "people", label: "People" },
  { id: "commercial", label: "Commercial" },
  { id: "delivery", label: "Delivery" },
  { id: "operations", label: "Operations" },
  { id: "administration", label: "Administration" },
];

export const ERP_MODULES: ErpModule[] = [
  {
    id: "dashboard",
    label: "Control centre",
    title: "Control centre",
    href: "/erp/founder/dashboard",
    group: "overview",
    permission: "executive.dashboard.read",
    summary: "Organization-wide position across people, divisions and active work.",
  },
  {
    id: "work",
    label: "Tasks & work",
    title: "Tasks & work",
    href: "/erp/founder/dashboard#workforce",
    group: "overview",
    permission: "tasks.read_all",
    summary: "Assignment and progress of work across every division.",
  },
  {
    id: "analytics",
    label: "Analytics",
    title: "Analytics",
    href: "/erp/founder/analytics",
    group: "overview",
    permission: "analytics.read",
    summary: "Read-only rollups across education, operations, supply chain and people.",
  },

  {
    id: "employees",
    label: "Employees",
    title: "Employees",
    href: "/erp/founder/employees",
    group: "people",
    permission: "hr.employees.read",
    summary: "Employee master, employment history and reporting lines.",
  },
  {
    id: "recruitment",
    label: "Recruitment",
    title: "Recruitment",
    href: "/erp/founder/recruitment",
    group: "people",
    permission: "recruitment.dashboard.read",
    summary: "Requisitions, applicants, interviews, offers and onboarding.",
  },
  {
    id: "attendance",
    label: "Attendance",
    title: "Attendance",
    href: "/erp/founder/attendance",
    group: "people",
    permission: "attendance.read",
    summary: "Daily attendance, regularisation and working-time records.",
  },
  {
    id: "leave",
    label: "Leave",
    title: "Leave",
    href: "/erp/founder/leave",
    group: "people",
    permission: "leave.read",
    summary: "Leave applications, balances, approvals and holiday calendar.",
  },
  {
    id: "payroll",
    label: "Payroll",
    title: "Payroll",
    href: "/erp/founder/payroll",
    group: "people",
    permission: "payroll.dashboard.read",
    summary: "Salary structures, compensation, payroll runs and payslips.",
  },
  {
    id: "performance",
    label: "Performance",
    title: "Performance",
    href: "/erp/founder/performance",
    group: "people",
    permission: "performance.dashboard.read",
    summary: "Review cycles, goals and appraisal outcomes.",
  },

  {
    id: "finance",
    label: "Finance & GST",
    title: "Finance & GST",
    href: "/erp/founder/finance",
    group: "commercial",
    permission: "finance.dashboard.read",
    summary: "Receivables, payables, ledger and GST return workings.",
  },
  {
    id: "crm",
    label: "CRM",
    title: "CRM",
    href: "/erp/founder/crm",
    group: "commercial",
    permission: "crm.dashboard.read",
    summary: "Leads, accounts, contacts, opportunities and activity history.",
  },
  {
    id: "institutions",
    label: "Institutions",
    title: "Institutions",
    href: "/erp/founder/institutions",
    group: "commercial",
    permission: "institutions.dashboard.read",
    summary: "Partner institutions, contacts and engagement records.",
  },

  {
    id: "delivery",
    label: "Project delivery",
    title: "Project delivery",
    href: "/erp/founder/delivery",
    group: "delivery",
    permission: "projects.delivery.read",
    summary: "Milestones, risks, sprints and time logged against projects.",
  },
  {
    id: "programs",
    label: "Programmes",
    title: "Programmes & learning",
    href: "/erp/founder/programs",
    group: "delivery",
    permission: "programs.dashboard.read",
    summary: "Programme catalogue, batches, enrollments and certification.",
  },
  {
    id: "supply-chain",
    label: "Supply chain",
    title: "Supply chain",
    href: "/erp/founder/supply-chain",
    group: "delivery",
    permission: "procurement.vendors.read",
    summary: "Vendors, purchase orders, inventory and asset register.",
  },

  {
    id: "support",
    label: "Helpdesk",
    title: "Helpdesk",
    href: "/erp/founder/support",
    group: "operations",
    permission: "support.dashboard.read",
    summary: "Support tickets, assignment and SLA tracking.",
  },
  {
    id: "cms",
    label: "Content",
    title: "Content",
    href: "/erp/founder/cms",
    group: "operations",
    permission: "cms.dashboard.read",
    summary: "Website content records and publication state.",
  },
  {
    id: "compliance",
    label: "Compliance",
    title: "Compliance",
    href: "/erp/founder/compliance",
    group: "operations",
    permission: "compliance.dashboard.read",
    summary: "Statutory obligations, due dates and completion evidence.",
  },

  {
    id: "organization",
    label: "Organization",
    title: "Organization",
    href: "/erp/founder/organization",
    group: "administration",
    permission: "organization.structure.read",
    summary: "Company profile, branches, divisions, teams and cost centres.",
  },
  {
    id: "users",
    label: "Users & roles",
    title: "Users & roles",
    href: "/erp/founder/users",
    group: "administration",
    permission: "admin.users.read",
    summary: "User accounts, role assignment and account status.",
  },
];

const MODULES_BY_ID = new Map(ERP_MODULES.map((module) => [module.id, module]));

export function erpModule(id: ErpModuleId): ErpModule {
  const found = MODULES_BY_ID.get(id);
  if (!found) throw new Error(`Unknown ERP module: ${id}`);
  return found;
}

/**
 * Modules the principal may open, grouped for the sidebar. Groups that end up
 * empty are dropped so the sidebar never renders a heading over nothing.
 */
export function visibleModuleGroups(permissions: readonly string[]) {
  const granted = new Set(permissions);
  return ERP_MODULE_GROUPS.map((group) => ({
    ...group,
    modules: ERP_MODULES.filter(
      (module) =>
        module.group === group.id && (!module.permission || granted.has(module.permission)),
    ),
  })).filter((group) => group.modules.length > 0);
}
