import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial TechM4India foundation data...');

  // 1. Core Organization
  const org = await prisma.organization.upsert({
    where: { code: 'TECHM4INDIA' },
    update: {},
    create: {
      code: 'TECHM4INDIA',
      name: 'TechM4India Innovations Pvt. Ltd.',
      legalName: 'TechM4India Innovations Private Limited',
      taxId: '27AABCT0000A1Z5',
      isActive: true,
    },
  });
  console.log(`Organization verified: ${org.name} (${org.code})`);

  // 2. Central Applications
  const applications = [
    {
      code: 'CENTRAL_DASHBOARD',
      name: 'Central Identity & Application Dashboard',
      description: 'Single sign-on launchpad and central administration portal.',
      baseUrl: 'http://localhost:3000',
    },
    {
      code: 'HRMS',
      name: 'TechM4 HRMS',
      description: 'Human Resource Management System application.',
      baseUrl: 'http://localhost:3001',
    },
    {
      code: 'FINANCE',
      name: 'TechM4 Finance ERP',
      description: 'Financial Management and Accounting application.',
      baseUrl: 'http://localhost:3002',
    },
  ];

  for (const app of applications) {
    await prisma.application.upsert({
      where: { code: app.code },
      update: {
        name: app.name,
        description: app.description,
        baseUrl: app.baseUrl,
      },
      create: {
        code: app.code,
        name: app.name,
        description: app.description,
        baseUrl: app.baseUrl,
        isActive: true,
      },
    });
    console.log(`Application verified: ${app.name} (${app.code})`);
  }

  // 3. System Roles
  const roles = [
    {
      code: 'SUPER_ADMIN',
      name: 'Super Administrator',
      description: 'Full cross-platform administrative privileges.',
      isSystemRole: true,
    },
    {
      code: 'HRMS_ADMIN',
      name: 'HRMS Administrator',
      description: 'Administrative control over the HRMS module.',
      isSystemRole: false,
    },
    {
      code: 'HRMS_USER',
      name: 'HRMS Standard User',
      description: 'Standard employee access to HRMS self-service.',
      isSystemRole: false,
    },
    {
      code: 'FINANCE_ADMIN',
      name: 'Finance Administrator',
      description: 'Administrative control over Finance & Accounting ERP.',
      isSystemRole: false,
    },
    {
      code: 'FINANCE_USER',
      name: 'Finance Standard User',
      description: 'Standard access to Finance and accounting views.',
      isSystemRole: false,
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {
        name: role.name,
        description: role.description,
      },
      create: {
        code: role.code,
        name: role.name,
        description: role.description,
        isSystemRole: role.isSystemRole,
      },
    });
    console.log(`Role verified: ${role.name} (${role.code})`);
  }

  // 4. Baseline Permissions
  const permissions = [
    { code: 'auth:login', name: 'User Authentication', module: 'AUTH' },
    { code: 'users:read', name: 'View Users', module: 'USERS' },
    { code: 'users:manage', name: 'Manage Users', module: 'USERS' },
    { code: 'roles:read', name: 'View Roles', module: 'ROLES' },
    { code: 'roles:manage', name: 'Manage Roles', module: 'ROLES' },
    { code: 'apps:read', name: 'View Applications', module: 'APPLICATIONS' },
    { code: 'apps:manage', name: 'Manage Applications', module: 'APPLICATIONS' },
    { code: 'hrms:access', name: 'Access HRMS Application', module: 'HRMS' },
    { code: 'hrms:manage', name: 'Manage HRMS Operations', module: 'HRMS' },
    { code: 'finance:access', name: 'Access Finance Application', module: 'FINANCE' },
    { code: 'finance:manage', name: 'Manage Finance Operations', module: 'FINANCE' },
    { code: 'audit:read', name: 'Read Audit Logs', module: 'AUDIT' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, module: perm.module },
      create: {
        code: perm.code,
        name: perm.name,
        module: perm.module,
      },
    });
  }
  console.log(`Permissions verified (${permissions.length} items).`);

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
