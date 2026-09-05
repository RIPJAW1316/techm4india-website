import { Injectable } from "@nestjs/common";

import { Principal } from "../auth.types";

export interface ProjectScope {
  divisionId: string;
  projectManagerId?: string | null;
  memberEmployeeIds?: string[];
}

export interface TaskScope extends ProjectScope {
  assigneeId?: string | null;
}

@Injectable()
export class AuthorizationPolicy {
  isOrganizationWide(principal: Principal): boolean {
    return principal.roles.includes("SUPER_ADMIN") || principal.roles.includes("DIRECTOR");
  }

  canAccessDivision(principal: Principal, divisionId: string, permission: string): boolean {
    if (!principal.permissions.includes(permission)) return false;
    return this.isOrganizationWide(principal) || principal.divisionId === divisionId;
  }

  canReadDivision(principal: Principal, divisionId: string): boolean {
    if (this.isOrganizationWide(principal)) {
      return principal.permissions.includes("organization.read_all");
    }
    return principal.divisionId === divisionId && (
      principal.permissions.includes("organization.read_division") ||
      principal.permissions.includes("organization.read_self")
    );
  }

  canReadDepartment(principal: Principal, divisionId: string): boolean {
    return this.canReadDivision(principal, divisionId);
  }

  canReadEmployee(principal: Principal, target: { id: string; divisionId?: string | null }): boolean {
    if (principal.employeeId === target.id) return principal.permissions.includes("employees.read_self");
    if (this.isOrganizationWide(principal)) return principal.permissions.includes("employees.read_all");
    return Boolean(
      target.divisionId &&
      principal.divisionId === target.divisionId &&
      principal.permissions.includes("employees.read_division"),
    );
  }

  canListEmployees(principal: Principal, divisionId?: string): boolean {
    if (this.isOrganizationWide(principal)) {
      return principal.permissions.includes("employees.read_all");
    }
    return Boolean(
      principal.divisionId &&
      (!divisionId || divisionId === principal.divisionId) &&
      principal.permissions.includes("employees.read_division"),
    );
  }

  canAccessProject(principal: Principal, project: ProjectScope): boolean {
    const member = Boolean(principal.employeeId && project.memberEmployeeIds?.includes(principal.employeeId));
    const manager = Boolean(principal.employeeId && project.projectManagerId === principal.employeeId);
    if (member || manager) return true;
    if (this.isOrganizationWide(principal)) {
      return principal.permissions.includes("projects.read_all") || principal.permissions.includes("projects.read_division") || principal.permissions.includes("projects.manage");
    }
    return principal.divisionId === project.divisionId && principal.permissions.includes("projects.read_division");
  }

  canAccessTask(principal: Principal, task: TaskScope): boolean {
    const assigned = principal.employeeId && task.assigneeId === principal.employeeId;
    const member = principal.employeeId && task.memberEmployeeIds?.includes(principal.employeeId);
    const manager = principal.employeeId && task.projectManagerId === principal.employeeId;
    if (assigned || member || manager) return true;
    if (this.isOrganizationWide(principal)) {
      return principal.permissions.includes("tasks.read_all") || principal.permissions.includes("tasks.manage");
    }
    return Boolean(principal.divisionId === task.divisionId && principal.permissions.includes("tasks.read_project"));
  }

  canManageProject(principal: Principal, project: ProjectScope): boolean {
    if (!principal.permissions.includes("projects.manage")) return false;
    return this.isOrganizationWide(principal) || principal.divisionId === project.divisionId;
  }

  canManageTask(principal: Principal, task: TaskScope): boolean {
    if (!principal.permissions.includes("tasks.manage")) return false;
    return this.isOrganizationWide(principal) || principal.divisionId === task.divisionId;
  }
}
