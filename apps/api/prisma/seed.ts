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
      baseUrl: 'http://localhost:3002',
    },
    {
      code: 'FINANCE',
      name: 'TechM4 Finance ERP',
      description: 'Financial Management and Accounting application.',
      baseUrl: 'http://localhost:3001',
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
    { code: 'hrms:employees:read', name: 'View Employee Records', module: 'HRMS' },
    { code: 'hrms:employees:manage', name: 'Manage Employee Directory', module: 'HRMS' },
    { code: 'hrms:leave:apply', name: 'Apply For Leave', module: 'HRMS' },
    { code: 'hrms:leave:approve', name: 'Approve Leave Applications', module: 'HRMS' },
    { code: 'hrms:attendance:clock', name: 'Clock In and Out', module: 'HRMS' },
    { code: 'hrms:attendance:manage', name: 'Manage Attendance & Shifts', module: 'HRMS' },
    { code: 'hrms:claims:submit', name: 'Submit Expense Claims', module: 'HRMS' },
    { code: 'hrms:claims:approve', name: 'Approve Expense Claims', module: 'HRMS' },
    { code: 'hrms:payroll:read', name: 'View Payslips', module: 'HRMS' },
    { code: 'hrms:payroll:manage', name: 'Process Payroll & Revisions', module: 'HRMS' },
    { code: 'hrms:documents:manage', name: 'Manage Corporate Documents', module: 'HRMS' },
    { code: 'hrms:incidents:manage', name: 'Manage Incident Reports', module: 'HRMS' },
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
    HRMS_ADMIN: [
      'auth:login',
      'users:read',
      'apps:read',
      'hrms:access',
      'hrms:manage',
      'hrms:employees:read',
      'hrms:employees:manage',
      'hrms:leave:apply',
      'hrms:leave:approve',
      'hrms:attendance:clock',
      'hrms:attendance:manage',
      'hrms:claims:submit',
      'hrms:claims:approve',
      'hrms:payroll:read',
      'hrms:payroll:manage',
      'hrms:documents:manage',
      'hrms:incidents:manage',
    ],
    HRMS_USER: [
      'auth:login',
      'hrms:access',
      'hrms:employees:read',
      'hrms:leave:apply',
      'hrms:attendance:clock',
      'hrms:claims:submit',
      'hrms:payroll:read',
    ],
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

  // 7. HRMS Organizational Foundation (Phase 4)
  console.log('Seeding HRMS organizational master data...');

  // Branches
  const branches = [
    {
      code: 'HYD-HQ',
      name: 'Hyderabad Headquarters',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      address: 'Plot 42, Hitec City, Madhapur, Hyderabad - 500081',
      isHeadquarters: true,
    },
    {
      code: 'BLR-RD',
      name: 'Bengaluru R&D Center',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      address: 'Phase 2, Electronic City, Bengaluru - 560100',
      isHeadquarters: false,
    },
    {
      code: 'MUM-OPS',
      name: 'Mumbai Operations Office',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      address: 'Bandra Kurla Complex (BKC), Mumbai - 400051',
      isHeadquarters: false,
    },
  ];

  const branchMap = new Map<string, string>();
  for (const b of branches) {
    const branch = await prisma.branch.upsert({
      where: { code: b.code },
      update: { name: b.name, city: b.city, state: b.state, address: b.address },
      create: { ...b, organizationId: org.id },
    });
    branchMap.set(b.code, branch.id);
  }

  // Departments
  const departments = [
    { code: 'ENG', name: 'Engineering & Technology', description: 'Core software, cloud, and embedded systems engineering.' },
    { code: 'AI-SOL', name: 'AI & Enterprise Solutions', description: 'Artificial intelligence and customized digital solutions.' },
    { code: 'SPACE', name: 'Space & Aerospace Systems', description: 'Satellite design, telemetry, and payload development.' },
    { code: 'SCHOOLS', name: 'Schools & Academic Programs', description: 'K-12 STEM, ATL innovation labs, and educator training.' },
    { code: 'HR-OPS', name: 'People & Operations', description: 'Human resources, talent acquisition, payroll, and workplace operations.' },
    { code: 'FIN', name: 'Finance & Accounts', description: 'Corporate accounting, treasury, audits, and statutory compliance.' },
  ];

  const deptMap = new Map<string, string>();
  for (const d of departments) {
    const dept = await prisma.department.upsert({
      where: { code: d.code },
      update: { name: d.name, description: d.description },
      create: { ...d, organizationId: org.id },
    });
    deptMap.set(d.code, dept.id);
  }

  // Designations
  const designations = [
    { code: 'LEAD-ARCH', name: 'Principal Systems Architect', departmentCode: 'ENG', level: 5 },
    { code: 'SR-SWE', name: 'Senior Full Stack Engineer', departmentCode: 'ENG', level: 3 },
    { code: 'SWE', name: 'Software Engineer', departmentCode: 'ENG', level: 2 },
    { code: 'TECH-LEAD', name: 'Senior Technical Lead', departmentCode: 'SCHOOLS', level: 4 },
    { code: 'HR-MGR', name: 'HR Operations Manager', departmentCode: 'HR-OPS', level: 4 },
    { code: 'HR-EXEC', name: 'People Operations Specialist', departmentCode: 'HR-OPS', level: 2 },
    { code: 'FIN-MGR', name: 'Finance & Accounts Manager', departmentCode: 'FIN', level: 4 },
  ];

  const desigMap = new Map<string, string>();
  for (const des of designations) {
    const desig = await prisma.designation.upsert({
      where: { code: des.code },
      update: { name: des.name, level: des.level },
      create: {
        code: des.code,
        name: des.name,
        level: des.level,
        departmentId: deptMap.get(des.departmentCode),
      },
    });
    desigMap.set(des.code, desig.id);
  }

  // Leave Types
  const leaveTypes = [
    { code: 'ANNUAL', name: 'Annual Privilege Leave', defaultDaysPerYear: 15, isPaid: true, requiresDocument: false, carryForwardMax: 10 },
    { code: 'SICK', name: 'Sick / Medical Leave', defaultDaysPerYear: 10, isPaid: true, requiresDocument: true, carryForwardMax: 0 },
    { code: 'CASUAL', name: 'Casual Leave', defaultDaysPerYear: 7, isPaid: true, requiresDocument: false, carryForwardMax: 0 },
    { code: 'MATERNITY', name: 'Maternity Leave', defaultDaysPerYear: 180, isPaid: true, requiresDocument: true, carryForwardMax: 0 },
    { code: 'PATERNITY', name: 'Paternity Leave', defaultDaysPerYear: 15, isPaid: true, requiresDocument: false, carryForwardMax: 0 },
    { code: 'UNPAID', name: 'Leave Without Pay (LWP)', defaultDaysPerYear: 0, isPaid: false, requiresDocument: false, carryForwardMax: 0 },
  ];

  const leaveTypeMap = new Map<string, string>();
  for (const lt of leaveTypes) {
    const leaveType = await prisma.leaveType.upsert({
      where: { code: lt.code },
      update: { name: lt.name, defaultDaysPerYear: lt.defaultDaysPerYear },
      create: { ...lt, organizationId: org.id },
    });
    leaveTypeMap.set(lt.code, leaveType.id);
  }

  // Claim Categories
  const claimCategories = [
    { code: 'TRAVEL', name: 'Travel & Local Conveyance', maxAmountLimit: 15000, requiresReceipt: true },
    { code: 'MEALS', name: 'Client Entertainment & Food', maxAmountLimit: 5000, requiresReceipt: true },
    { code: 'COMM', name: 'Internet & Mobile Reimbursement', maxAmountLimit: 2500, requiresReceipt: true },
    { code: 'OFFICE', name: 'Office Equipment & Books', maxAmountLimit: 10000, requiresReceipt: true },
    { code: 'TRAINING', name: 'Certifications & Skill Training', maxAmountLimit: 25000, requiresReceipt: true },
  ];

  for (const cc of claimCategories) {
    await prisma.claimCategory.upsert({
      where: { code: cc.code },
      update: { name: cc.name, maxAmountLimit: cc.maxAmountLimit },
      create: cc,
    });
  }

  // 8. Seed Employee Profiles & Associations
  const hrUser = await prisma.user.findUnique({ where: { email: 'hrms.admin@techm4india.com' } });
  const engUser = await prisma.user.findUnique({ where: { email: 'employee.hrms@techm4india.com' } });

  let hrEmployeeId = '';
  if (hrUser) {
    const hrEmp = await prisma.employee.upsert({
      where: { employeeNumber: 'TM-001' },
      update: { email: hrUser.email },
      create: {
        userId: hrUser.id,
        organizationId: org.id,
        employeeNumber: 'TM-001',
        firstName: hrUser.firstName,
        lastName: hrUser.lastName,
        email: hrUser.email,
        phone: '+91 98765 43210',
        dateOfJoining: new Date('2024-01-15'),
        employmentType: 'FULL_TIME',
        employmentStatus: 'ACTIVE',
        departmentId: deptMap.get('HR-OPS'),
        designationId: desigMap.get('HR-MGR'),
        branchId: branchMap.get('HYD-HQ'),
        panNumber: 'ABCDE1234F',
        bankAccountNumber: '918273645544',
        bankIfsc: 'HDFC0001234',
        bankName: 'HDFC Bank',
      },
    });
    hrEmployeeId = hrEmp.id;
  }

  if (engUser) {
    const engEmp = await prisma.employee.upsert({
      where: { employeeNumber: 'TM-002' },
      update: { email: engUser.email },
      create: {
        userId: engUser.id,
        organizationId: org.id,
        employeeNumber: 'TM-002',
        firstName: engUser.firstName,
        lastName: engUser.lastName,
        email: engUser.email,
        phone: '+91 91234 56789',
        dateOfJoining: new Date('2024-03-01'),
        employmentType: 'FULL_TIME',
        employmentStatus: 'ACTIVE',
        departmentId: deptMap.get('ENG'),
        designationId: desigMap.get('SR-SWE'),
        branchId: branchMap.get('HYD-HQ'),
        managerId: hrEmployeeId || undefined,
        panNumber: 'FGHIJ5678K',
        bankAccountNumber: '123456789012',
        bankIfsc: 'ICIC0000456',
        bankName: 'ICICI Bank',
      },
    });

    // Salary Structure for Rohan Verma (₹12 LPA CTC, ₹1,00,000/month)
    await prisma.salaryStructure.upsert({
      where: { employeeId: engEmp.id },
      update: {},
      create: {
        employeeId: engEmp.id,
        monthlyCtc: 100000,
        basicSalary: 50000,
        hra: 25000,
        specialAllowance: 18000,
        conveyanceAllowance: 3200,
        medicalAllowance: 3800,
        providentFundEmployee: 1800,
        providentFundEmployer: 1800,
        professionalTax: 200,
        esiEmployee: 0,
        esiEmployer: 0,
        tdsEstimate: 5000,
        netSalary: 93000,
        isActive: true,
      },
    });

    // Leave Balances for 2026
    const annualTypeId = leaveTypeMap.get('ANNUAL');
    const sickTypeId = leaveTypeMap.get('SICK');
    const casualTypeId = leaveTypeMap.get('CASUAL');

    if (annualTypeId) {
      await prisma.leaveBalance.upsert({
        where: { employeeId_leaveTypeId_year: { employeeId: engEmp.id, leaveTypeId: annualTypeId, year: 2026 } },
        update: {},
        create: { employeeId: engEmp.id, leaveTypeId: annualTypeId, year: 2026, entitledDays: 15, takenDays: 3, pendingDays: 0 },
      });
    }
    if (sickTypeId) {
      await prisma.leaveBalance.upsert({
        where: { employeeId_leaveTypeId_year: { employeeId: engEmp.id, leaveTypeId: sickTypeId, year: 2026 } },
        update: {},
        create: { employeeId: engEmp.id, leaveTypeId: sickTypeId, year: 2026, entitledDays: 10, takenDays: 1, pendingDays: 0 },
      });
    }
    if (casualTypeId) {
      await prisma.leaveBalance.upsert({
        where: { employeeId_leaveTypeId_year: { employeeId: engEmp.id, leaveTypeId: casualTypeId, year: 2026 } },
        update: {},
        create: { employeeId: engEmp.id, leaveTypeId: casualTypeId, year: 2026, entitledDays: 7, takenDays: 2, pendingDays: 0 },
      });
    }
  }

  // Additional Leadership Employees
  const additionalStaff = [
    {
      empNo: 'TM-003',
      first: 'Dr. K. Sudheer',
      last: 'Reddy',
      email: 'dr.sudheer@techm4india.com',
      dept: 'SCHOOLS',
      desig: 'LEAD-ARCH',
      branch: 'HYD-HQ',
      phone: '+91 63018 14246',
      joining: new Date('2023-06-01'),
    },
    {
      empNo: 'TM-004',
      first: 'Mahesh',
      last: 'Mannuru',
      email: 'mahesh.m@techm4india.com',
      dept: 'SCHOOLS',
      desig: 'TECH-LEAD',
      branch: 'HYD-HQ',
      phone: '+91 98855 12345',
      joining: new Date('2023-08-15'),
    },
    {
      empNo: 'TM-005',
      first: 'Mettu Raja',
      last: 'Reddy',
      email: 'raja.m@techm4india.com',
      dept: 'AI-SOL',
      desig: 'TECH-LEAD',
      branch: 'HYD-HQ',
      phone: '+91 97744 54321',
      joining: new Date('2023-10-01'),
    },
  ];

  for (const s of additionalStaff) {
    await prisma.employee.upsert({
      where: { employeeNumber: s.empNo },
      update: {},
      create: {
        organizationId: org.id,
        employeeNumber: s.empNo,
        firstName: s.first,
        lastName: s.last,
        email: s.email,
        phone: s.phone,
        dateOfJoining: s.joining,
        employmentType: 'FULL_TIME',
        employmentStatus: 'ACTIVE',
        departmentId: deptMap.get(s.dept),
        designationId: desigMap.get(s.desig),
        branchId: branchMap.get(s.branch),
      },
    });
  }

  // 9. Indian Statutory & Corporate Holidays
  const holidays = [
    { name: 'Republic Day', date: new Date('2026-01-26'), isOptional: false },
    { name: 'Maha Shivaratri', date: new Date('2026-02-15'), isOptional: true },
    { name: 'Ugadi / Telugu New Year', date: new Date('2026-03-20'), isOptional: false },
    { name: 'Eid-ul-Fitr', date: new Date('2026-03-21'), isOptional: false },
    { name: 'May Day / Labour Day', date: new Date('2026-05-01'), isOptional: false },
    { name: 'Independence Day', date: new Date('2026-08-15'), isOptional: false },
    { name: 'Ganesh Chaturthi', date: new Date('2026-09-14'), isOptional: false },
    { name: 'Mahatma Gandhi Jayanti', date: new Date('2026-10-02'), isOptional: false },
    { name: 'Vijaya Dashami (Dussehra)', date: new Date('2026-10-20'), isOptional: false },
    { name: 'Diwali (Deepavali)', date: new Date('2026-11-08'), isOptional: false },
    { name: 'Christmas Day', date: new Date('2026-12-25'), isOptional: false },
  ];

  for (const h of holidays) {
    await prisma.holiday.upsert({
      where: {
        organizationId_date_branchId: {
          organizationId: org.id,
          date: h.date,
          branchId: branchMap.get('HYD-HQ') || '',
        },
      },
      update: { name: h.name, isOptional: h.isOptional },
      create: {
        organizationId: org.id,
        name: h.name,
        date: h.date,
        isOptional: h.isOptional,
        branchId: branchMap.get('HYD-HQ'),
      },
    });
  }

  console.log('HRMS foundation data seeded successfully.');

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
