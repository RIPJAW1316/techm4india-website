import {
  PrismaClient,
  Priority,
  ProjectStatus,
  TaskStatus,
  UserStatus,
  NotificationType,
} from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const divisions = [
  { name: "TechM4Engineering", slug: "engineering", departments: ["Civil Engineering", "Mechanical Engineering", "Software Engineering"] },
  { name: "TechM4Solutions", slug: "solutions", departments: ["AI & Data", "Software Development", "Cloud & DevOps"] },
  { name: "TechM4Schools", slug: "schools", departments: ["School Programs", "Robotics & Maker Education"] },
  { name: "TechM4Space", slug: "space", departments: ["Aerospace Systems", "Space Research"] },
] as const;

const roleNames = [
  "SUPER_ADMIN", "DIRECTOR", "DIVISION_HEAD", "HR_MANAGER", "SALES_MANAGER",
  "SALES_EXECUTIVE", "FINANCE_MANAGER", "PROJECT_MANAGER", "EMPLOYEE",
  "CONTENT_MANAGER", "VIEWER",
] as const;

const permissionKeys = [
  "employees.read_self", "projects.read_assigned", "projects.read_division",
  "projects.read_all", "projects.manage", "tasks.read_assigned", "tasks.read_project", "tasks.read_all", "tasks.update_assigned", "tasks.manage",
  "employees.read_division", "employees.read_all", "notifications.read_self",
  "organization.read_self", "organization.read_division", "organization.read_all", "task_comments.read", "task_comments.create",
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
      where: { organizationId_slug: { organizationId: organization.id, slug: division.slug } },
      update: { name: division.name },
      create: { organizationId: organization.id, name: division.name, slug: division.slug },
    });
    divisionRecords.set(division.slug, divisionRecord);
    for (const departmentName of division.departments) {
      const departmentSlug = departmentName.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      await prisma.department.upsert({
        where: { divisionId_slug: { divisionId: divisionRecord.id, slug: departmentSlug } },
        update: { name: departmentName },
        create: { divisionId: divisionRecord.id, name: departmentName, slug: departmentSlug },
      });
    }
  }

  const permissions = new Map<string, { id: string }>();
  for (const key of permissionKeys) {
    permissions.set(key, await prisma.permission.upsert({ where: { key }, update: {}, create: { key } }));
  }
  const roles = new Map<string, { id: string }>();
  for (const name of roleNames) {
    roles.set(name, await prisma.role.upsert({ where: { name }, update: {}, create: { name } }));
  }

  for (const [name, role] of roles) {
    const keys = name === "SUPER_ADMIN" || name === "DIRECTOR"
      ? permissionKeys
      : name === "DIVISION_HEAD"
        ? [
            "employees.read_self", "employees.read_division", "projects.read_assigned",
            "projects.read_division", "projects.manage", "tasks.read_assigned", "tasks.manage",
            "tasks.read_project", "task_comments.read", "task_comments.create", "notifications.read_self", "organization.read_self", "organization.read_division",
          ]
      : name === "PROJECT_MANAGER"
        ? ["projects.read_assigned", "projects.read_division", "projects.manage", "tasks.read_assigned", "tasks.read_project", "tasks.manage", "task_comments.read", "task_comments.create", "notifications.read_self", "organization.read_self"]
        : name === "EMPLOYEE"
          ? ["employees.read_self", "projects.read_assigned", "tasks.read_assigned", "tasks.update_assigned", "task_comments.read", "task_comments.create", "notifications.read_self", "organization.read_self"]
          : ["notifications.read_self", "organization.read_self"];
    for (const key of keys) {
      const permission = permissions.get(key);
      if (!permission) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {}, create: { roleId: role.id, permissionId: permission.id },
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
  const seedDemoData = process.env.NODE_ENV !== "production" && Boolean(passwordHash);
  if (!seedDemoData) {
    console.log(`Seeded ${organization.legalName}, ${divisions.length} divisions, ${roleNames.length} roles; demo employees skipped (development opt-in required).`);
    return;
  }

  const engineering = divisionRecords.get("engineering");
  if (!engineering) throw new Error("Engineering division seed failed");
  const softwareDepartment = await prisma.department.findFirstOrThrow({ where: { divisionId: engineering.id, slug: "software-engineering" } });
  const existingUser = await prisma.user.findUnique({ where: { email: "aryan@techm4india.com" } });
  if (!existingUser && !passwordHash) {
    throw new Error("SEED_DEMO_PASSWORD is required when creating the demo account");
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
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: employeeRole.id } },
    update: {}, create: { userId: user.id, roleId: employeeRole.id },
  });
  const employee = await prisma.employee.upsert({
    where: { employeeCode: "EMP-DEV-001" },
    update: { firstName: "Aryan", lastName: "TechM4India", divisionId: engineering.id, departmentId: softwareDepartment.id },
    create: {
      userId: user.id, employeeCode: "EMP-DEV-001", firstName: "Aryan", lastName: "TechM4India",
      designation: "Employee", joiningDate: new Date("2026-01-01T00:00:00.000Z"),
      divisionId: engineering.id, departmentId: softwareDepartment.id,
    },
  });
  const project = await prisma.project.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: "TM4-FOUNDATION" } },
    update: { name: "TechM4Engineering Portal", description: "Development-only project for the TechM4Engineering employee work portal.", projectManagerId: employee.id, progress: 65, status: ProjectStatus.ACTIVE, divisionId: engineering.id },
    create: {
      organizationId: organization.id, divisionId: engineering.id, code: "TM4-FOUNDATION",
      name: "TechM4Engineering Portal", description: "Development-only project for the TechM4Engineering employee work portal.",
      projectManagerId: employee.id, createdByUserId: user.id, priority: Priority.HIGH,
      status: ProjectStatus.ACTIVE, progress: 65,
    },
  });
  await prisma.projectMember.upsert({
    where: { projectId_employeeId: { projectId: project.id, employeeId: employee.id } },
    update: { removedAt: null }, create: { projectId: project.id, employeeId: employee.id },
  });
  await prisma.projectTask.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: { title: "Build employee login integration", description: "Validate the authenticated employee flow for the engineering portal.", status: TaskStatus.COMPLETED, assigneeId: employee.id, completedAt: new Date("2026-08-25T00:00:00.000Z") },
    create: {
      id: "00000000-0000-0000-0000-000000000001", projectId: project.id,
      title: "Build employee login integration", description: "Validate the authenticated employee flow for the engineering portal.",
      assigneeId: employee.id, createdByUserId: user.id, createdByEmployeeId: employee.id,
      priority: Priority.HIGH, status: TaskStatus.COMPLETED, completedAt: new Date("2026-08-25T00:00:00.000Z"),
    },
  });
  const demoTasks = [
    { id: "00000000-0000-0000-0000-000000000002", title: "Implement engineering dashboard", description: "Prepare the employee work summary for Phase 6.", priority: Priority.HIGH, status: TaskStatus.IN_PROGRESS, dueDate: new Date("2026-09-15T00:00:00.000Z") },
    { id: "00000000-0000-0000-0000-000000000003", title: "API integration testing", description: "Exercise project, task, comment, and notification APIs.", priority: Priority.MEDIUM, status: TaskStatus.TODO, dueDate: new Date("2026-09-25T00:00:00.000Z") },
  ] as const;
  for (const demoTask of demoTasks) {
    await prisma.projectTask.upsert({
      where: { id: demoTask.id },
      update: { ...demoTask, assigneeId: employee.id, projectId: project.id },
      create: { ...demoTask, projectId: project.id, assigneeId: employee.id, createdByUserId: user.id, createdByEmployeeId: employee.id },
    });
  }

  await prisma.notification.upsert({
    where: { id: "10000000-0000-0000-0000-000000000001" },
    update: { title: "Welcome to your workspace", body: "Your TechM4India development workspace is ready for review.", type: NotificationType.SYSTEM, resourceType: "Workspace", resourceId: project.id },
    create: { id: "10000000-0000-0000-0000-000000000001", userId: user.id, type: NotificationType.SYSTEM, title: "Welcome to your workspace", body: "Your TechM4India development workspace is ready for review.", resourceType: "Workspace", resourceId: project.id },
  });

  const additionalDemoEmployees = [
    {
      slug: "solutions", email: "solutions.employee@techm4india.com", employeeCode: "EMP-DEV-002", firstName: "Samira", lastName: "Solutions", departmentSlug: "software-development", designation: "Solutions Employee", projectCode: "TM4-DEMO-SOLUTIONS", projectName: "Solutions Lab Demo", projectDescription: "Development-only Solutions workspace project.", taskId: "00000000-0000-0000-0000-000000000011", taskTitle: "Review solutions lab brief", taskDescription: "Development-only task for cross-division workspace testing.", taskStatus: TaskStatus.IN_PROGRESS, taskPriority: Priority.HIGH, notificationId: "10000000-0000-0000-0000-000000000002",
    },
    {
      slug: "schools", email: "schools.employee@techm4india.com", employeeCode: "EMP-DEV-003", firstName: "Meera", lastName: "Schools", departmentSlug: "school-programs", designation: "Schools Employee", projectCode: "TM4-DEMO-SCHOOLS", projectName: "Schools Innovation Demo", projectDescription: "Development-only Schools workspace project.", taskId: "00000000-0000-0000-0000-000000000021", taskTitle: "Prepare maker session outline", taskDescription: "Development-only task for cross-division workspace testing.", taskStatus: TaskStatus.TODO, taskPriority: Priority.MEDIUM, notificationId: "10000000-0000-0000-0000-000000000003",
    },
    {
      slug: "space", email: "space.employee@techm4india.com", employeeCode: "EMP-DEV-004", firstName: "Rohan", lastName: "Space", departmentSlug: "aerospace-systems", designation: "Space Employee", projectCode: "TM4-DEMO-SPACE", projectName: "Space Systems Demo", projectDescription: "Development-only Space workspace project.", taskId: "00000000-0000-0000-0000-000000000031", taskTitle: "Inspect propulsion test notes", taskDescription: "Development-only task for cross-division workspace testing.", taskStatus: TaskStatus.REVIEW, taskPriority: Priority.HIGH, notificationId: "10000000-0000-0000-0000-000000000004",
    },
  ] as const;

  for (const demo of additionalDemoEmployees) {
    const division = divisionRecords.get(demo.slug);
    if (!division) throw new Error(`${demo.slug} division seed failed`);
    const department = await prisma.department.findFirstOrThrow({ where: { divisionId: division.id, slug: demo.departmentSlug } });
    const existingDemoUser = await prisma.user.findUnique({ where: { email: demo.email } });
    if (!existingDemoUser && !passwordHash) throw new Error(`SEED_DEMO_PASSWORD is required when creating ${demo.email}`);
    const demoUser = existingDemoUser
      ? await prisma.user.update({ where: { id: existingDemoUser.id }, data: { status: UserStatus.ACTIVE } })
      : await prisma.user.create({ data: { email: demo.email, passwordHash: passwordHash as string, status: UserStatus.ACTIVE } });
    await prisma.userRole.upsert({ where: { userId_roleId: { userId: demoUser.id, roleId: employeeRole.id } }, update: {}, create: { userId: demoUser.id, roleId: employeeRole.id } });
    const demoEmployee = await prisma.employee.upsert({
      where: { employeeCode: demo.employeeCode },
      update: { userId: demoUser.id, firstName: demo.firstName, lastName: demo.lastName, designation: demo.designation, divisionId: division.id, departmentId: department.id, employmentStatus: "ACTIVE" },
      create: { userId: demoUser.id, employeeCode: demo.employeeCode, firstName: demo.firstName, lastName: demo.lastName, designation: demo.designation, joiningDate: new Date("2026-01-01T00:00:00.000Z"), divisionId: division.id, departmentId: department.id },
    });
    const demoProject = await prisma.project.upsert({
      where: { organizationId_code: { organizationId: organization.id, code: demo.projectCode } },
      update: { name: demo.projectName, description: demo.projectDescription, projectManagerId: demoEmployee.id, progress: 35, status: ProjectStatus.ACTIVE, divisionId: division.id },
      create: { organizationId: organization.id, divisionId: division.id, code: demo.projectCode, name: demo.projectName, description: demo.projectDescription, projectManagerId: demoEmployee.id, createdByUserId: demoUser.id, priority: Priority.MEDIUM, status: ProjectStatus.ACTIVE, progress: 35 },
    });
    await prisma.projectMember.upsert({ where: { projectId_employeeId: { projectId: demoProject.id, employeeId: demoEmployee.id } }, update: { removedAt: null }, create: { projectId: demoProject.id, employeeId: demoEmployee.id } });
    await prisma.projectTask.upsert({
      where: { id: demo.taskId },
      update: { title: demo.taskTitle, description: demo.taskDescription, status: demo.taskStatus, priority: demo.taskPriority, assigneeId: demoEmployee.id, projectId: demoProject.id },
      create: { id: demo.taskId, projectId: demoProject.id, title: demo.taskTitle, description: demo.taskDescription, assigneeId: demoEmployee.id, createdByUserId: demoUser.id, createdByEmployeeId: demoEmployee.id, priority: demo.taskPriority, status: demo.taskStatus },
    });
    await prisma.notification.upsert({
      where: { id: demo.notificationId },
      update: { title: `Welcome to ${demo.slug} workspace`, body: "This development notification is available for mark-as-read testing.", type: NotificationType.SYSTEM, resourceType: "Workspace", resourceId: demoProject.id },
      create: { id: demo.notificationId, userId: demoUser.id, type: NotificationType.SYSTEM, title: `Welcome to ${demo.slug} workspace`, body: "This development notification is available for mark-as-read testing.", resourceType: "Workspace", resourceId: demoProject.id },
    });
  }

  console.log(`Seeded ${organization.legalName}, ${divisions.length} divisions, ${roleNames.length} roles, and development employees across all divisions.`);
}

main()
  .catch((error: unknown) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
