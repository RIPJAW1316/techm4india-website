export interface AuthenticatedPrincipal {
  userId: string;
  email: string;
  status: string;
  employeeId?: string;
  organizationId?: string;
  divisionId?: string;
  departmentId?: string;
  roles: string[];
  permissions: string[];
}
