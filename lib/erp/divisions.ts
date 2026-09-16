import type { AuthContext } from "../api/types";

export const DIVISION_CONFIG = {
  engineering: {
    slug: "engineering",
    displayName: "TechM4Engineering",
    shortName: "Engineering",
    workspaceLabel: "Engineering workspace",
    publicPath: "/engineering",
    dashboardPath: "/erp/engineering/dashboard",
  },
  solutions: {
    slug: "solutions",
    displayName: "TechM4Solutions",
    shortName: "Solutions",
    workspaceLabel: "Solutions workspace",
    publicPath: "/solutions",
    dashboardPath: "/erp/solutions/dashboard",
  },
  schools: {
    slug: "schools",
    displayName: "TechM4Schools",
    shortName: "Schools",
    workspaceLabel: "Schools workspace",
    publicPath: "/schools",
    dashboardPath: "/erp/schools/dashboard",
  },
  space: {
    slug: "space",
    displayName: "TechM4Space",
    shortName: "Space",
    workspaceLabel: "Space workspace",
    publicPath: "/space",
    dashboardPath: "/erp/space/dashboard",
  },
} as const;

export type DivisionSlug = keyof typeof DIVISION_CONFIG;
export type DivisionConfig = (typeof DIVISION_CONFIG)[DivisionSlug];

export const DIVISIONS = Object.values(DIVISION_CONFIG);

export function isSupportedDivisionSlug(value: string | null | undefined): value is DivisionSlug {
  return Boolean(value && value in DIVISION_CONFIG);
}

export function getDivisionConfig(slug: string | null | undefined): DivisionConfig | null {
  return isSupportedDivisionSlug(slug) ? DIVISION_CONFIG[slug] : null;
}

export function isOrganizationWideContext(context: AuthContext | null): boolean {
  if (!context) return false;
  const hasOrganizationRole = context.user.roles.some(
    (role) => role === "SUPER_ADMIN" || role === "DIRECTOR" || role === "FOUNDER_CEO",
  );
  return hasOrganizationRole && context.permissions.includes("organization.read_all");
}

export function canAccessExecutiveWorkspace(context: AuthContext | null): boolean {
  return Boolean(context?.permissions.includes("executive.dashboard.read"));
}

export function resolveDashboardPath(context: AuthContext | null): string {
  if (!context) return "/erp";
  if (canAccessExecutiveWorkspace(context)) return "/erp/founder/dashboard";
  if (isOrganizationWideContext(context)) return "/erp";
  return getDivisionConfig(context.employee?.division?.slug)?.dashboardPath ?? "/erp";
}

export function canAccessDivisionWorkspace(
  context: AuthContext | null,
  divisionSlug: DivisionSlug,
): boolean {
  if (!context) return false;
  if (isOrganizationWideContext(context)) return true;
  return context.employee?.division?.slug === divisionSlug;
}
