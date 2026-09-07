export type RoleCapabilityState = "IMPLEMENTED" | "RESERVED_FUTURE";

export const OFFICIAL_ROLE_CATALOG = [
  {
    name: "SUPER_ADMIN",
    displayName: "Super Admin",
    description: "System-wide administration.",
    capabilityState: "IMPLEMENTED",
  },
  {
    name: "FOUNDER_CEO",
    displayName: "Founder / CEO",
    description: "Executive organization-wide oversight.",
    capabilityState: "IMPLEMENTED",
  },
  {
    name: "DIRECTOR",
    displayName: "Director",
    description:
      "Leadership and organization-wide visibility according to permissions.",
    capabilityState: "IMPLEMENTED",
  },
  {
    name: "DIVISION_HEAD",
    displayName: "Division Head",
    description: "Division-scoped operational visibility.",
    capabilityState: "IMPLEMENTED",
  },
  {
    name: "HR_MANAGER",
    displayName: "HR Manager",
    description: "HR employee-management capabilities.",
    capabilityState: "IMPLEMENTED",
  },
  {
    name: "HR_EXECUTIVE",
    displayName: "HR Executive",
    description: "Operational HR capabilities.",
    capabilityState: "IMPLEMENTED",
  },
  {
    name: "FINANCE_MANAGER",
    displayName: "Finance Manager",
    description:
      "Finance-management role. Finance and GST implementation is an upcoming mandatory phase.",
    capabilityState: "RESERVED_FUTURE",
  },
  {
    name: "FINANCE_EXECUTIVE",
    displayName: "Finance Executive",
    description:
      "Finance-operations role. Finance and GST implementation is upcoming.",
    capabilityState: "RESERVED_FUTURE",
  },
  {
    name: "SALES_MANAGER",
    displayName: "Sales Manager",
    description: "Organization-wide CRM management.",
    capabilityState: "IMPLEMENTED",
  },
  {
    name: "SALES_EXECUTIVE",
    displayName: "Sales Executive",
    description: "Owned and assigned CRM operations.",
    capabilityState: "IMPLEMENTED",
  },
  {
    name: "MARKETING_MANAGER",
    displayName: "Marketing Manager",
    description: "Reserved marketing-management role.",
    capabilityState: "RESERVED_FUTURE",
  },
  {
    name: "PROJECT_MANAGER",
    displayName: "Project Manager",
    description: "Project and task management role.",
    capabilityState: "IMPLEMENTED",
  },
  {
    name: "FACULTY_TRAINER",
    displayName: "Faculty / Trainer",
    description: "Reserved training and LMS role.",
    capabilityState: "RESERVED_FUTURE",
  },
  {
    name: "STUDENT",
    displayName: "Student",
    description: "Reserved student-portal role.",
    capabilityState: "RESERVED_FUTURE",
  },
  {
    name: "INSTITUTION_ADMIN",
    displayName: "Institution Admin",
    description: "Reserved institution-facing administration role.",
    capabilityState: "RESERVED_FUTURE",
  },
  {
    name: "CONTENT_MANAGER",
    displayName: "Content Manager",
    description: "Reserved CMS-management role.",
    capabilityState: "RESERVED_FUTURE",
  },
  {
    name: "IT_ADMIN",
    displayName: "IT Admin",
    description: "System and integration administration foundation.",
    capabilityState: "RESERVED_FUTURE",
  },
  {
    name: "VENDOR",
    displayName: "Vendor",
    description: "Reserved vendor-facing role.",
    capabilityState: "RESERVED_FUTURE",
  },
  {
    name: "EMPLOYEE",
    displayName: "Employee",
    description: "Personal employee workspace.",
    capabilityState: "IMPLEMENTED",
  },
  {
    name: "VIEWER",
    displayName: "Viewer",
    description: "Read-only assigned capabilities.",
    capabilityState: "IMPLEMENTED",
  },
] as const;

export const OFFICIAL_ROLE_NAMES = OFFICIAL_ROLE_CATALOG.map(
  (role) => role.name,
);

export const ADMINISTRATIVE_ROLE_NAMES = [
  "SUPER_ADMIN",
  "FOUNDER_CEO",
] as const;

export function roleCatalogueEntry(name: string) {
  return OFFICIAL_ROLE_CATALOG.find((role) => role.name === name);
}
