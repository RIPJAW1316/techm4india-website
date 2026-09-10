import {
  PrismaClient,
  Priority,
  ProjectStatus,
  TaskStatus,
  UserStatus,
  NotificationType,
} from "@prisma/client";
import argon2 from "argon2";
import { OFFICIAL_ROLE_CATALOG } from "../src/admin/role-catalog";

const prisma = new PrismaClient();

const divisions = [
  {
    name: "TechM4Engineering",
    slug: "engineering",
    departments: [
      "Civil Engineering",
      "Mechanical Engineering",
      "Software Engineering",
    ],
  },
  {
    name: "TechM4Solutions",
    slug: "solutions",
    departments: ["AI & Data", "Software Development", "Cloud & DevOps"],
  },
  {
    name: "TechM4Schools",
    slug: "schools",
    departments: ["School Programs", "Robotics & Maker Education"],
  },
  {
    name: "TechM4Space",
    slug: "space",
    departments: ["Aerospace Systems", "Space Research"],
  },
] as const;

const roleNames = OFFICIAL_ROLE_CATALOG.map((role) => role.name);

const permissionKeys = [
  "employees.read_self",
  "projects.read_assigned",
  "projects.read_division",
  "projects.read_all",
  "projects.manage",
  "tasks.read_assigned",
  "tasks.read_project",
  "tasks.read_all",
  "tasks.update_assigned",
  "tasks.manage",
  "employees.read_division",
  "employees.read_all",
  "notifications.read_self",
  "organization.read_self",
  "organization.read_division",
  "organization.read_all",
  "task_comments.read",
  "task_comments.create",
  "executive.dashboard.read",
  "tasks.create_all",
  "tasks.update_all",
  "tasks.assign_all",
  "tasks.cancel_all",
  "company.profile.read",
  "company.profile.manage",
  "branches.read",
  "branches.manage",
  "teams.read",
  "teams.manage",
  "cost_centres.read",
  "cost_centres.manage",
  "organization.structure.read",
  "hr.employees.read",
  "hr.employees.manage",
  "hr.employees.read_private",
  "hr.employment_history.read",
  "hr.employment_history.manage",
  "attendance.self.read",
  "attendance.self.checkin",
  "attendance.read",
  "attendance.manage",
  "leave.self.read",
  "leave.self.apply",
  "leave.read",
  "leave.review",
  "leave.manage_types",
  "leave.manage_balances",
  "holidays.read",
  "holidays.manage",
  "crm.dashboard.read",
  "crm.leads.read",
  "crm.leads.manage",
  "crm.leads.assign",
  "crm.leads.convert",
  "crm.accounts.read",
  "crm.accounts.manage",
  "crm.contacts.read",
  "crm.contacts.manage",
  "crm.opportunities.read",
  "crm.opportunities.manage",
  "crm.activities.read",
  "crm.activities.manage",
  "institutions.dashboard.read",
  "institutions.read",
  "institutions.manage",
  "institutions.contacts.read",
  "institutions.contacts.manage",
  "institutions.engagements.read",
  "institutions.engagements.manage",
  "institutions.assign",
  "admin.users.read",
  "admin.users.manage_roles",
  "admin.users.manage_status",
  "admin.roles.read",
  "admin.permissions.read",
  "payroll.dashboard.read",
  "payroll.components.read",
  "payroll.components.manage",
  "payroll.structures.read",
  "payroll.structures.manage",
  "payroll.compensation.read",
  "payroll.compensation.manage",
  "payroll.runs.read",
  "payroll.runs.process",
  "payroll.runs.approve",
  "payroll.payslip.read_self",
] as const;

const founderPermissionKeys = [
  "executive.dashboard.read",
  "employees.read_all",
  "projects.read_all",
  "tasks.read_all",
  "tasks.create_all",
  "tasks.update_all",
  "tasks.assign_all",
  "tasks.cancel_all",
] as const;

const companyReadPermissionKeys = [
  "company.profile.read",
  "branches.read",
  "teams.read",
  "cost_centres.read",
  "organization.structure.read",
] as const;

const companyManagePermissionKeys = [
  "company.profile.manage",
  "branches.manage",
  "teams.manage",
  "cost_centres.manage",
] as const;

const hrReadPermissionKeys = [
  "hr.employees.read",
  "hr.employment_history.read",
] as const;
const hrManagePermissionKeys = [
  "hr.employees.manage",
  "hr.employees.read_private",
  "hr.employment_history.manage",
] as const;
const attendanceEmployeeKeys = [
  "attendance.self.read",
  "attendance.self.checkin",
] as const;
const leaveEmployeeKeys = [
  "leave.self.read",
  "leave.self.apply",
  "holidays.read",
] as const;
const crmReadPermissionKeys = [
  "crm.leads.read",
  "crm.accounts.read",
  "crm.contacts.read",
  "crm.opportunities.read",
  "crm.activities.read",
] as const;
const crmManagePermissionKeys = [
  "crm.leads.manage",
  "crm.leads.assign",
  "crm.leads.convert",
  "crm.accounts.manage",
  "crm.contacts.manage",
  "crm.opportunities.manage",
  "crm.activities.manage",
] as const;
const institutionReadPermissionKeys = [
  "institutions.read",
  "institutions.contacts.read",
  "institutions.engagements.read",
] as const;
const institutionManagePermissionKeys = [
  "institutions.manage",
  "institutions.contacts.manage",
  "institutions.engagements.manage",
  "institutions.assign",
] as const;

async function main(): Promise<void> {
  const organization = await prisma.organization.upsert({
    where: { slug: "techm4india" },
    update: { legalName: "TechM4India" },
    create: { legalName: "TechM4India", slug: "techm4india" },
  });

  const divisionRecords = new Map<string, { id: string }>();
  for (const division of divisions) {
    const divisionRecord = await prisma.division.upsert({
      where: {
        organizationId_slug: {
          organizationId: organization.id,
          slug: division.slug,
        },
      },
      update: { name: division.name },
      create: {
        organizationId: organization.id,
        name: division.name,
        slug: division.slug,
      },
    });
    divisionRecords.set(division.slug, divisionRecord);
    for (const departmentName of division.departments) {
      const departmentSlug = departmentName
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      await prisma.department.upsert({
        where: {
          divisionId_slug: {
            divisionId: divisionRecord.id,
            slug: departmentSlug,
          },
        },
        update: { name: departmentName },
        create: {
          divisionId: divisionRecord.id,
          name: departmentName,
          slug: departmentSlug,
        },
      });
    }
  }

  const permissions = new Map<string, { id: string }>();
  for (const key of permissionKeys) {
    permissions.set(
      key,
      await prisma.permission.upsert({
        where: { key },
        update: {},
        create: { key },
      }),
    );
  }
  const roles = new Map<string, { id: string }>();
  for (const name of roleNames) {
    const catalogue = OFFICIAL_ROLE_CATALOG.find((role) => role.name === name);
    roles.set(
      name,
      await prisma.role.upsert({
        where: { name },
        update: { description: catalogue?.description },
        create: { name, description: catalogue?.description },
      }),
    );
  }

  for (const [name, role] of roles) {
    const keys =
      name === "SUPER_ADMIN"
        ? permissionKeys
        : name === "FOUNDER_CEO"
          ? [
              ...founderPermissionKeys,
              ...companyReadPermissionKeys,
              ...companyManagePermissionKeys,
              ...hrReadPermissionKeys,
              ...hrManagePermissionKeys,
              "notifications.read_self",
              "organization.read_all",
              "attendance.self.read",
              "attendance.self.checkin",
              "attendance.read",
              "attendance.manage",
              "leave.self.read",
              "leave.self.apply",
              "leave.read",
              "leave.review",
              "leave.manage_types",
              "leave.manage_balances",
              "holidays.read",
              "holidays.manage",
              "crm.dashboard.read",
              ...crmReadPermissionKeys,
              ...crmManagePermissionKeys,
              "institutions.dashboard.read",
              ...institutionReadPermissionKeys,
              ...institutionManagePermissionKeys,
              "admin.users.read",
              "admin.users.manage_roles",
              "admin.users.manage_status",
              "admin.roles.read",
              "admin.permissions.read",
              "payroll.dashboard.read",
              "payroll.components.read",
              "payroll.components.manage",
              "payroll.structures.read",
              "payroll.structures.manage",
              "payroll.compensation.read",
              "payroll.compensation.manage",
              "payroll.runs.read",
              "payroll.runs.process",
              "payroll.runs.approve",
              "payroll.payslip.read_self",
            ]
          : name === "DIRECTOR"
            ? permissionKeys
                .filter(
                  (key) =>
                    !founderPermissionKeys.includes(
                      key as (typeof founderPermissionKeys)[number],
                    ) &&
                    !companyManagePermissionKeys.includes(
                      key as (typeof companyManagePermissionKeys)[number],
                    ) &&
                    !hrManagePermissionKeys.includes(
                      key as (typeof hrManagePermissionKeys)[number],
                    ) &&
                    ![
                      "attendance.manage",
                      "leave.review",
                      "leave.manage_types",
                      "leave.manage_balances",
                      "holidays.manage",
                      ...crmManagePermissionKeys,
                      ...institutionManagePermissionKeys,
                    ].includes(key) &&
                    key !== "hr.employees.read_private" &&
                    !key.startsWith("admin.") &&
                    !key.startsWith("payroll."),
                )
                .concat([
                  "crm.dashboard.read",
                  "institutions.dashboard.read",
                  ...institutionReadPermissionKeys,
                ])
            : name === "DIVISION_HEAD"
              ? [
                  "employees.read_self",
                  "employees.read_division",
                  "projects.read_assigned",
                  "projects.read_division",
                  "projects.manage",
                  "tasks.read_assigned",
                  "tasks.manage",
                  "tasks.read_project",
                  "task_comments.read",
                  "task_comments.create",
                  "notifications.read_self",
                  "organization.read_self",
                  "organization.read_division",
                  ...companyReadPermissionKeys,
                  "hr.employees.read",
                  "attendance.self.read",
                  "attendance.self.checkin",
                  "attendance.read",
                  "leave.self.read",
                  "leave.self.apply",
                  "leave.read",
                  "leave.review",
                  "holidays.read",
                ]
              : name === "HR_MANAGER"
                ? [
                    ...hrReadPermissionKeys,
                    ...hrManagePermissionKeys,
                    "notifications.read_self",
                    "organization.read_all",
                    "attendance.self.read",
                    "attendance.self.checkin",
                    "attendance.read",
                    "attendance.manage",
                    "leave.self.read",
                    "leave.self.apply",
                    "leave.read",
                    "leave.review",
                    "holidays.read",
                    "holidays.manage",
                    "leave.manage_types",
                    "leave.manage_balances",
                    "payroll.compensation.read",
                    "payroll.compensation.manage",
                  ]
                : name === "HR_EXECUTIVE"
                  ? [
                      ...hrReadPermissionKeys,
                      "hr.employees.manage",
                      "notifications.read_self",
                      "organization.read_self",
                      "attendance.self.read",
                      "attendance.self.checkin",
                      "attendance.read",
                      "attendance.manage",
                      "leave.self.read",
                      "leave.read",
                      "holidays.read",
                    ]
                  : name === "FINANCE_MANAGER"
                    ? [
                        "notifications.read_self",
                        "organization.read_all",
                        "payroll.dashboard.read",
                        "payroll.components.read",
                        "payroll.components.manage",
                        "payroll.structures.read",
                        "payroll.structures.manage",
                        "payroll.compensation.read",
                        "payroll.compensation.manage",
                        "payroll.runs.read",
                        "payroll.runs.process",
                        "payroll.runs.approve",
                        "payroll.payslip.read_self",
                      ]
                    : name === "FINANCE_EXECUTIVE"
                      ? [
                          "notifications.read_self",
                          "organization.read_self",
                          "payroll.dashboard.read",
                          "payroll.components.read",
                          "payroll.structures.read",
                          "payroll.compensation.read",
                          "payroll.runs.read",
                          "payroll.runs.process",
                          "payroll.payslip.read_self",
                        ]
                      : name === "SALES_MANAGER"
                    ? [
                        "notifications.read_self",
                        "organization.read_all",
                        "crm.dashboard.read",
                        ...crmReadPermissionKeys,
                        ...crmManagePermissionKeys,
                        "institutions.dashboard.read",
                        ...institutionReadPermissionKeys,
                        ...institutionManagePermissionKeys,
                      ]
                    : name === "SALES_EXECUTIVE"
                      ? [
                          "notifications.read_self",
                          "organization.read_self",
                          ...crmReadPermissionKeys,
                          "crm.leads.manage",
                          "crm.leads.convert",
                          "crm.accounts.manage",
                          "crm.contacts.manage",
                          "crm.opportunities.manage",
                          "crm.activities.manage",
                          "institutions.dashboard.read",
                          ...institutionReadPermissionKeys,
                          "institutions.manage",
                          "institutions.contacts.manage",
                          "institutions.engagements.manage",
                        ]
                      : name === "PROJECT_MANAGER"
                        ? [
                            "projects.read_assigned",
                            "projects.read_division",
                            "projects.manage",
                            "tasks.read_assigned",
                            "tasks.read_project",
                            "tasks.manage",
                            "task_comments.read",
                            "task_comments.create",
                            "notifications.read_self",
                            "organization.read_self",
                          ]
                        : name === "EMPLOYEE"
                          ? [
                              "employees.read_self",
                              "projects.read_assigned",
                              "tasks.read_assigned",
                              "tasks.update_assigned",
                              "task_comments.read",
                              "task_comments.create",
                              "notifications.read_self",
                              "organization.read_self",
                              ...attendanceEmployeeKeys,
                              ...leaveEmployeeKeys,
                              "payroll.payslip.read_self",
                            ]
                          : [
                              "notifications.read_self",
                              "organization.read_self",
                            ];
    for (const key of keys) {
      const permission = permissions.get(key);
      if (!permission) continue;
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: permission.id },
        },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  const seedPassword = process.env.SEED_DEMO_PASSWORD;
  const passwordHash = seedPassword
    ? await argon2.hash(seedPassword, {
        memoryCost: 19_456,
        parallelism: 1,
        timeCost: 2,
        type: argon2.argon2id,
      })
    : undefined;
  const seedDemoData =
    process.env.NODE_ENV !== "production" && Boolean(passwordHash);
  if (!seedDemoData) {
    console.log(
      `Seeded ${organization.legalName}, ${divisions.length} divisions, ${roleNames.length} roles; demo employees skipped (development opt-in required).`,
    );
    return;
  }

  const engineering = divisionRecords.get("engineering");
  if (!engineering) throw new Error("Engineering division seed failed");
  const softwareDepartment = await prisma.department.findFirstOrThrow({
    where: { divisionId: engineering.id, slug: "software-engineering" },
  });
  const existingUser = await prisma.user.findUnique({
    where: { email: "aryan@techm4india.com" },
  });
  if (!existingUser && !passwordHash) {
    throw new Error(
      "SEED_DEMO_PASSWORD is required when creating the demo account",
    );
  }
  const user = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: { status: UserStatus.ACTIVE },
      })
    : await prisma.user.create({
        data: {
          email: "aryan@techm4india.com",
          passwordHash: passwordHash as string,
          status: UserStatus.ACTIVE,
        },
      });
  const employeeRole = roles.get("EMPLOYEE");
  if (!employeeRole) throw new Error("Employee role seed failed");

  const founderRole = roles.get("FOUNDER_CEO");
  if (!founderRole) throw new Error("Founder role seed failed");
  const existingFounderUser = await prisma.user.findUnique({
    where: { email: "founder.dev@techm4india.com" },
  });
  const founderUser = existingFounderUser
    ? await prisma.user.update({
        where: { id: existingFounderUser.id },
        data: { status: UserStatus.ACTIVE },
      })
    : await prisma.user.create({
        data: {
          email: "founder.dev@techm4india.com",
          passwordHash: passwordHash as string,
          status: UserStatus.ACTIVE,
        },
      });
  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: founderUser.id, roleId: founderRole.id },
    },
    update: {},
    create: { userId: founderUser.id, roleId: founderRole.id },
  });
  await prisma.employee.upsert({
    where: { employeeCode: "EMP-DEV-CEO" },
    update: {
      userId: founderUser.id,
      firstName: "Founder",
      lastName: "Demo",
      designation: "Founder / CEO",
      divisionId: engineering.id,
      departmentId: softwareDepartment.id,
      employmentStatus: "ACTIVE",
    },
    create: {
      userId: founderUser.id,
      employeeCode: "EMP-DEV-CEO",
      firstName: "Founder",
      lastName: "Demo",
      designation: "Founder / CEO",
      joiningDate: new Date("2026-01-01T00:00:00.000Z"),
      divisionId: engineering.id,
      departmentId: softwareDepartment.id,
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: employeeRole.id } },
    update: {},
    create: { userId: user.id, roleId: employeeRole.id },
  });
  const employee = await prisma.employee.upsert({
    where: { employeeCode: "EMP-DEV-001" },
    update: {
      firstName: "Aryan",
      lastName: "TechM4India",
      divisionId: engineering.id,
      departmentId: softwareDepartment.id,
    },
    create: {
      userId: user.id,
      employeeCode: "EMP-DEV-001",
      firstName: "Aryan",
      lastName: "TechM4India",
      designation: "Employee",
      joiningDate: new Date("2026-01-01T00:00:00.000Z"),
      divisionId: engineering.id,
      departmentId: softwareDepartment.id,
    },
  });
  const project = await prisma.project.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "TM4-FOUNDATION",
      },
    },
    update: {
      name: "TechM4Engineering Portal",
      description:
        "Development-only project for the TechM4Engineering employee work portal.",
      projectManagerId: employee.id,
      progress: 65,
      status: ProjectStatus.ACTIVE,
      divisionId: engineering.id,
    },
    create: {
      organizationId: organization.id,
      divisionId: engineering.id,
      code: "TM4-FOUNDATION",
      name: "TechM4Engineering Portal",
      description:
        "Development-only project for the TechM4Engineering employee work portal.",
      projectManagerId: employee.id,
      createdByUserId: user.id,
      priority: Priority.HIGH,
      status: ProjectStatus.ACTIVE,
      progress: 65,
    },
  });
  await prisma.projectMember.upsert({
    where: {
      projectId_employeeId: { projectId: project.id, employeeId: employee.id },
    },
    update: { removedAt: null },
    create: { projectId: project.id, employeeId: employee.id },
  });
  await prisma.projectTask.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {
      title: "Build employee login integration",
      description:
        "Validate the authenticated employee flow for the engineering portal.",
      status: TaskStatus.COMPLETED,
      assigneeId: employee.id,
      completedAt: new Date("2026-08-25T00:00:00.000Z"),
    },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      projectId: project.id,
      title: "Build employee login integration",
      description:
        "Validate the authenticated employee flow for the engineering portal.",
      assigneeId: employee.id,
      createdByUserId: user.id,
      createdByEmployeeId: employee.id,
      priority: Priority.HIGH,
      status: TaskStatus.COMPLETED,
      completedAt: new Date("2026-08-25T00:00:00.000Z"),
    },
  });
  const demoTasks = [
    {
      id: "00000000-0000-0000-0000-000000000002",
      title: "Implement engineering dashboard",
      description: "Prepare the employee work summary for Phase 6.",
      priority: Priority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date("2026-09-15T00:00:00.000Z"),
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      title: "API integration testing",
      description: "Exercise project, task, comment, and notification APIs.",
      priority: Priority.MEDIUM,
      status: TaskStatus.TODO,
      dueDate: new Date("2026-09-25T00:00:00.000Z"),
    },
  ] as const;
  for (const demoTask of demoTasks) {
    await prisma.projectTask.upsert({
      where: { id: demoTask.id },
      update: { ...demoTask, assigneeId: employee.id, projectId: project.id },
      create: {
        ...demoTask,
        projectId: project.id,
        assigneeId: employee.id,
        createdByUserId: user.id,
        createdByEmployeeId: employee.id,
      },
    });
  }

  await prisma.notification.upsert({
    where: { id: "10000000-0000-0000-0000-000000000001" },
    update: {
      title: "Welcome to your workspace",
      body: "Your TechM4India development workspace is ready for review.",
      type: NotificationType.SYSTEM,
      resourceType: "Workspace",
      resourceId: project.id,
    },
    create: {
      id: "10000000-0000-0000-0000-000000000001",
      userId: user.id,
      type: NotificationType.SYSTEM,
      title: "Welcome to your workspace",
      body: "Your TechM4India development workspace is ready for review.",
      resourceType: "Workspace",
      resourceId: project.id,
    },
  });

  const additionalDemoEmployees = [
    {
      slug: "solutions",
      email: "solutions.employee@techm4india.com",
      employeeCode: "EMP-DEV-002",
      firstName: "Samira",
      lastName: "Solutions",
      departmentSlug: "software-development",
      designation: "Solutions Employee",
      projectCode: "TM4-DEMO-SOLUTIONS",
      projectName: "Solutions Lab Demo",
      projectDescription: "Development-only Solutions workspace project.",
      taskId: "00000000-0000-0000-0000-000000000011",
      taskTitle: "Review solutions lab brief",
      taskDescription:
        "Development-only task for cross-division workspace testing.",
      taskStatus: TaskStatus.IN_PROGRESS,
      taskPriority: Priority.HIGH,
      notificationId: "10000000-0000-0000-0000-000000000002",
    },
    {
      slug: "schools",
      email: "schools.employee@techm4india.com",
      employeeCode: "EMP-DEV-003",
      firstName: "Meera",
      lastName: "Schools",
      departmentSlug: "school-programs",
      designation: "Schools Employee",
      projectCode: "TM4-DEMO-SCHOOLS",
      projectName: "Schools Innovation Demo",
      projectDescription: "Development-only Schools workspace project.",
      taskId: "00000000-0000-0000-0000-000000000021",
      taskTitle: "Prepare maker session outline",
      taskDescription:
        "Development-only task for cross-division workspace testing.",
      taskStatus: TaskStatus.TODO,
      taskPriority: Priority.MEDIUM,
      notificationId: "10000000-0000-0000-0000-000000000003",
    },
    {
      slug: "space",
      email: "space.employee@techm4india.com",
      employeeCode: "EMP-DEV-004",
      firstName: "Rohan",
      lastName: "Space",
      departmentSlug: "aerospace-systems",
      designation: "Space Employee",
      projectCode: "TM4-DEMO-SPACE",
      projectName: "Space Systems Demo",
      projectDescription: "Development-only Space workspace project.",
      taskId: "00000000-0000-0000-0000-000000000031",
      taskTitle: "Inspect propulsion test notes",
      taskDescription:
        "Development-only task for cross-division workspace testing.",
      taskStatus: TaskStatus.REVIEW,
      taskPriority: Priority.HIGH,
      notificationId: "10000000-0000-0000-0000-000000000004",
    },
  ] as const;

  for (const demo of additionalDemoEmployees) {
    const division = divisionRecords.get(demo.slug);
    if (!division) throw new Error(`${demo.slug} division seed failed`);
    const department = await prisma.department.findFirstOrThrow({
      where: { divisionId: division.id, slug: demo.departmentSlug },
    });
    const existingDemoUser = await prisma.user.findUnique({
      where: { email: demo.email },
    });
    if (!existingDemoUser && !passwordHash)
      throw new Error(
        `SEED_DEMO_PASSWORD is required when creating ${demo.email}`,
      );
    const demoUser = existingDemoUser
      ? await prisma.user.update({
          where: { id: existingDemoUser.id },
          data: { status: UserStatus.ACTIVE },
        })
      : await prisma.user.create({
          data: {
            email: demo.email,
            passwordHash: passwordHash as string,
            status: UserStatus.ACTIVE,
          },
        });
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: demoUser.id, roleId: employeeRole.id },
      },
      update: {},
      create: { userId: demoUser.id, roleId: employeeRole.id },
    });
    const demoEmployee = await prisma.employee.upsert({
      where: { employeeCode: demo.employeeCode },
      update: {
        userId: demoUser.id,
        firstName: demo.firstName,
        lastName: demo.lastName,
        designation: demo.designation,
        divisionId: division.id,
        departmentId: department.id,
        employmentStatus: "ACTIVE",
      },
      create: {
        userId: demoUser.id,
        employeeCode: demo.employeeCode,
        firstName: demo.firstName,
        lastName: demo.lastName,
        designation: demo.designation,
        joiningDate: new Date("2026-01-01T00:00:00.000Z"),
        divisionId: division.id,
        departmentId: department.id,
      },
    });
    const demoProject = await prisma.project.upsert({
      where: {
        organizationId_code: {
          organizationId: organization.id,
          code: demo.projectCode,
        },
      },
      update: {
        name: demo.projectName,
        description: demo.projectDescription,
        projectManagerId: demoEmployee.id,
        progress: 35,
        status: ProjectStatus.ACTIVE,
        divisionId: division.id,
      },
      create: {
        organizationId: organization.id,
        divisionId: division.id,
        code: demo.projectCode,
        name: demo.projectName,
        description: demo.projectDescription,
        projectManagerId: demoEmployee.id,
        createdByUserId: demoUser.id,
        priority: Priority.MEDIUM,
        status: ProjectStatus.ACTIVE,
        progress: 35,
      },
    });
    await prisma.projectMember.upsert({
      where: {
        projectId_employeeId: {
          projectId: demoProject.id,
          employeeId: demoEmployee.id,
        },
      },
      update: { removedAt: null },
      create: { projectId: demoProject.id, employeeId: demoEmployee.id },
    });
    await prisma.projectTask.upsert({
      where: { id: demo.taskId },
      update: {
        title: demo.taskTitle,
        description: demo.taskDescription,
        status: demo.taskStatus,
        priority: demo.taskPriority,
        assigneeId: demoEmployee.id,
        projectId: demoProject.id,
      },
      create: {
        id: demo.taskId,
        projectId: demoProject.id,
        title: demo.taskTitle,
        description: demo.taskDescription,
        assigneeId: demoEmployee.id,
        createdByUserId: demoUser.id,
        createdByEmployeeId: demoEmployee.id,
        priority: demo.taskPriority,
        status: demo.taskStatus,
      },
    });
    await prisma.notification.upsert({
      where: { id: demo.notificationId },
      update: {
        title: `Welcome to ${demo.slug} workspace`,
        body: "This development notification is available for mark-as-read testing.",
        type: NotificationType.SYSTEM,
        resourceType: "Workspace",
        resourceId: demoProject.id,
      },
      create: {
        id: demo.notificationId,
        userId: demoUser.id,
        type: NotificationType.SYSTEM,
        title: `Welcome to ${demo.slug} workspace`,
        body: "This development notification is available for mark-as-read testing.",
        resourceType: "Workspace",
        resourceId: demoProject.id,
      },
    });
  }

  console.log(
    `Seeded ${organization.legalName}, ${divisions.length} divisions, ${roleNames.length} roles, and development employees across all divisions.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
