type FounderSection =
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

const links: Array<{ id: FounderSection; label: string; href: string }> = [
  { id: "dashboard", label: "Dashboard", href: "/erp/founder/dashboard" },
  { id: "work", label: "Tasks / Work", href: "/erp/founder/dashboard#workforce" },
  { id: "employees", label: "Employees", href: "/erp/founder/employees" },
  { id: "recruitment", label: "Recruitment", href: "/erp/founder/recruitment" },
  { id: "users", label: "Users & Roles", href: "/erp/founder/users" },
  { id: "organization", label: "Organization", href: "/erp/founder/organization" },
  { id: "attendance", label: "Attendance", href: "/erp/founder/attendance" },
  { id: "leave", label: "Leave", href: "/erp/founder/leave" },
  { id: "payroll", label: "Payroll", href: "/erp/founder/payroll" },
  { id: "finance", label: "Finance", href: "/erp/founder/finance" },
  { id: "crm", label: "CRM", href: "/erp/founder/crm" },
  { id: "institutions", label: "Institutions", href: "/erp/founder/institutions" },
  { id: "programs", label: "Programs", href: "/erp/founder/programs" },
  { id: "performance", label: "Performance", href: "/erp/founder/performance" },
  { id: "supply-chain", label: "Supply Chain", href: "/erp/founder/supply-chain" },
  { id: "support", label: "Helpdesk", href: "/erp/founder/support" },
  { id: "cms", label: "Content", href: "/erp/founder/cms" },
  { id: "compliance", label: "Compliance", href: "/erp/founder/compliance" },
  { id: "delivery", label: "Delivery", href: "/erp/founder/delivery" },
  { id: "analytics", label: "Analytics", href: "/erp/founder/analytics" },
];

export function FounderModuleNavigation({ active }: { active: FounderSection }) {
  return (
    <nav className="founder-module-nav" aria-label="Founder workspace navigation">
      {links.map((link) => (
        <a className={link.id === active ? "is-active" : undefined} href={link.href} key={link.id}>
          {link.label}
        </a>
      ))}
    </nav>
  );
}
