import { AuthenticatedPrincipal } from "./interfaces/authenticated-principal";

export interface SafeEmployeeContext {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string | null;
  division: { id: string; slug: string; name: string } | null;
  department: { id: string; slug: string; name: string } | null;
}

export interface SafeAuthContext {
  user: {
    id: string;
    email: string;
    roles: string[];
  };
  employee: SafeEmployeeContext | null;
  permissions: string[];
}

export interface AuthResult extends SafeAuthContext {
  accessToken: string;
  refreshToken: string;
}

export type Principal = AuthenticatedPrincipal;
