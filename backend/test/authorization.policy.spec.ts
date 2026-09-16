import { AuthorizationPolicy } from "../src/auth/policies/authorization.policy";
import { Principal } from "../src/auth/auth.types";

const engineeringEmployee: Principal = {
  userId: "eng-user",
  email: "eng@example.com",
  status: "ACTIVE",
  employeeId: "eng-employee",
  divisionId: "engineering",
  departmentId: "software-engineering",
  roles: ["EMPLOYEE"],
  permissions: ["projects.read_division", "projects.read_assigned"],
};

describe("AuthorizationPolicy", () => {
  const policy = new AuthorizationPolicy();

  it("allows an employee inside their own division", () => {
    expect(
      policy.canAccessDivision(engineeringEmployee, "engineering", "projects.read_division"),
    ).toBe(true);
    expect(policy.canAccessProject(engineeringEmployee, { divisionId: "engineering" })).toBe(true);
  });

  it("denies an employee across divisions", () => {
    expect(policy.canAccessDivision(engineeringEmployee, "space", "projects.read_division")).toBe(
      false,
    );
    expect(policy.canAccessProject(engineeringEmployee, { divisionId: "space" })).toBe(false);
  });

  it("allows organization-wide principals across divisions", () => {
    const director = {
      ...engineeringEmployee,
      roles: ["DIRECTOR"],
      permissions: ["projects.read_division"],
    };
    expect(policy.canAccessProject(director, { divisionId: "space" })).toBe(true);
  });
});
