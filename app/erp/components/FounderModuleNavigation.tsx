type FounderSection =
  | "dashboard"
  | "work"
  | "employees"
  | "users"
  | "organization"
  | "attendance"
  | "leave"
  | "payroll"
  | "finance"
  | "crm"
  | "institutions";

const links: Array<{ id: FounderSection; label: string; href: string }> = [
  { id: "dashboard", label: "Dashboard", href: "/erp/founder/dashboard" },
  { id: "work", label: "Tasks / Work", href: "/erp/founder/dashboard#workforce" },
  { id: "employees", label: "Employees", href: "/erp/founder/employees" },
  { id: "users", label: "Users & Roles", href: "/erp/founder/users" },
  { id: "organization", label: "Organization", href: "/erp/founder/organization" },
  { id: "attendance", label: "Attendance", href: "/erp/founder/attendance" },
  { id: "leave", label: "Leave", href: "/erp/founder/leave" },
  { id: "payroll", label: "Payroll", href: "/erp/founder/payroll" },
  { id: "finance", label: "Finance", href: "/erp/founder/finance" },
  { id: "crm", label: "CRM", href: "/erp/founder/crm" },
  { id: "institutions", label: "Institutions", href: "/erp/founder/institutions" },
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
