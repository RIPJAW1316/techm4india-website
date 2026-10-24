import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial TechM4India foundation data (Phase 2)...');

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

  // 5. Associate Permissions to Roles
  const rolePermissionMap: Record<string, string[]> = {
    SUPER_ADMIN: permissions.map((p) => p.code),
    HRMS_ADMIN: ['auth:login', 'users:read', 'hrms:access', 'hrms:manage', 'apps:read'],
    HRMS_USER: ['auth:login', 'hrms:access'],
    FINANCE_ADMIN: ['auth:login', 'users:read', 'finance:access', 'finance:manage', 'apps:read'],
    FINANCE_USER: ['auth:login', 'finance:access'],
  };

  for (const [roleCode, permCodes] of Object.entries(rolePermissionMap)) {
    const role = await prisma.role.findUnique({ where: { code: roleCode } });
    if (!role) continue;

    for (const code of permCodes) {
      const perm = await prisma.permission.findUnique({ where: { code } });
      if (!perm) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: perm.id,
        },
      });
    }
  }
  console.log('Role permissions mapped successfully.');

  // 6. Safe Initial Accounts (Argon2id)
  const defaultPasswordHash = await argon2.hash('TechM4Admin2026!', {
    type: argon2.argon2id,
  });

  const seedUsers = [
    {
      email: 'superadmin@techm4india.com',
      firstName: 'Super',
      lastName: 'Administrator',
      roles: ['SUPER_ADMIN'],
      apps: ['CENTRAL_DASHBOARD', 'HRMS', 'FINANCE'],
    },
    {
      email: 'hrms.admin@techm4india.com',
      firstName: 'Aarav',
      lastName: 'Patel',
      roles: ['HRMS_ADMIN'],
      apps: ['CENTRAL_DASHBOARD', 'HRMS'],
    },
    {
      email: 'finance.admin@techm4india.com',
      firstName: 'Neha',
      lastName: 'Kulkarni',
      roles: ['FINANCE_ADMIN'],
      apps: ['CENTRAL_DASHBOARD', 'FINANCE'],
    },
    {
      email: 'employee.hrms@techm4india.com',
      firstName: 'Rohan',
      lastName: 'Verma',
      roles: ['HRMS_USER'],
      apps: ['HRMS'],
    },
    {
      email: 'accountant.finance@techm4india.com',
      firstName: 'Ananya',
      lastName: 'Deshmukh',
      roles: ['FINANCE_USER'],
      apps: ['FINANCE'],
    },
  ];

  for (const su of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: su.email },
      update: {
        firstName: su.firstName,
        lastName: su.lastName,
        isActive: true,
      },
      create: {
        email: su.email,
        passwordHash: defaultPasswordHash,
        firstName: su.firstName,
        lastName: su.lastName,
        organizationId: org.id,
        isActive: true,
      },
    });

    // Assign roles
    for (const rCode of su.roles) {
      const role = await prisma.role.findUnique({ where: { code: rCode } });
      if (role) {
        await prisma.userRole.upsert({
          where: { userId_roleId: { userId: user.id, roleId: role.id } },
          update: {},
          create: { userId: user.id, roleId: role.id },
        });
      }
    }

    // Assign application grants
    for (const aCode of su.apps) {
      const app = await prisma.application.findUnique({ where: { code: aCode } });
      if (app) {
        await prisma.userApplicationAccess.upsert({
          where: {
            userId_applicationId: { userId: user.id, applicationId: app.id },
          },
          update: { isActive: true },
          create: { userId: user.id, applicationId: app.id, isActive: true },
        });
      }
    }

    console.log(`User provisioned: ${user.email} (Roles: ${su.roles.join(', ')})`);
  }

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
