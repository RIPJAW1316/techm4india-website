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
    {
      code: 'CRM',
      name: 'TechM4 CRM & Sales',
      description: 'Institutional partnerships, lead scoring, deals pipeline and quotation management.',
      baseUrl: 'http://localhost:3003',
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
    {
      code: 'CRM_ADMIN',
      name: 'CRM Administrator',
      description: 'Administrative control over CRM, institutional sales and deals.',
      isSystemRole: false,
    },
    {
      code: 'CRM_USER',
      name: 'CRM Sales Executive',
      description: 'Standard access to leads, deals, contacts and quotations.',
      isSystemRole: false,
    },
    {
      code: 'INSTITUTION_COORDINATOR',
      name: 'Institutional Relations Coordinator',
      description: 'Manages campus partnership MoUs, batches, and lab setups.',
      isSystemRole: false,
    },
    {
      code: 'LMS_INSTRUCTOR',
      name: 'Academic Instructor & Faculty',
      description: 'Delivers courses, assessments, and curriculum modules.',
      isSystemRole: false,
    },
    {
      code: 'STUDENT',
      name: 'Enrolled Student',
      description: 'Access to learning materials, assignments, and certificates.',
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
    { code: 'crm:access', name: 'Access CRM Application', module: 'CRM' },
    { code: 'crm:manage', name: 'Manage CRM Pipeline & Deals', module: 'CRM' },
    { code: 'crm:leads:manage', name: 'Lead Scoring & Conversion', module: 'CRM' },
    { code: 'crm:quotes:push', name: 'Bridge Quotes to Finance ERP', module: 'CRM' },
    { code: 'institutions:manage', name: 'Manage Partner Institutions & MoUs', module: 'INSTITUTIONS' },
    { code: 'programs:manage', name: 'Manage Academic Programs & Batches', module: 'ACADEMIC' },
    { code: 'lms:manage', name: 'Manage LMS Courses & Certifications', module: 'LMS' },
    { code: 'projects:manage', name: 'Manage Engineering Projects & Tasks', module: 'PROJECTS' },
    { code: 'inventory:manage', name: 'Manage Lab Kits & BOMs', module: 'INVENTORY' },
    { code: 'assets:manage', name: 'Manage Fixed Assets & Depreciation', module: 'ASSETS' },
    { code: 'compliance:manage', name: 'Manage Statutory Compliance Calendar', module: 'COMPLIANCE' },
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
    CRM_ADMIN: ['auth:login', 'users:read', 'crm:access', 'crm:manage', 'crm:leads:manage', 'crm:quotes:push', 'institutions:manage', 'apps:read'],
    CRM_USER: ['auth:login', 'crm:access', 'crm:leads:manage'],
    INSTITUTION_COORDINATOR: ['auth:login', 'institutions:manage', 'programs:manage'],
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
      apps: ['CENTRAL_DASHBOARD', 'HRMS', 'FINANCE', 'CRM'],
    },
    {
      email: 'crm.lead@techm4india.com',
      firstName: 'Sneha',
      lastName: 'Roy',
      roles: ['CRM_ADMIN'],
      apps: ['CENTRAL_DASHBOARD', 'CRM'],
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

  // =========================================================================
  // 10. Institutional Partners Master (Domain 9)
  // =========================================================================
  console.log('Seeding institutional directory & MoUs...');
  const institutions = [
    {
      code: 'INST-OU-001',
      name: 'Osmania University College of Engineering',
      type: 'GOVERNMENT_UNIVERSITY' as const,
      naacRating: 'A_PLUS_PLUS' as const,
      aisheCode: 'U-0027',
      nirfRankTier: 'TOP_50',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500007',
      totalStudents: 4500,
      primaryContactName: 'Dr. Rajesh Varma',
      primaryContactPhone: '+91 94401 23456',
      primaryContactEmail: 'dean.engg@osmania.ac.in',
      healthScore: 94,
    },
    {
      code: 'INST-JNTUH-002',
      name: 'Jawaharlal Nehru Technological University Hyderabad',
      type: 'GOVERNMENT_UNIVERSITY' as const,
      naacRating: 'A_PLUS' as const,
      aisheCode: 'U-0017',
      nirfRankTier: 'TOP_100',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500085',
      totalStudents: 8500,
      primaryContactName: 'Dr. M. Sreenivasa Rao',
      primaryContactPhone: '+91 98480 34567',
      primaryContactEmail: 'rnd.director@jntuh.ac.in',
      healthScore: 91,
    },
    {
      code: 'INST-VNR-003',
      name: 'VNR Vignana Jyothi Institute of Engineering & Technology',
      type: 'AUTONOMOUS_COLLEGE' as const,
      naacRating: 'A_PLUS_PLUS' as const,
      aisheCode: 'C-19754',
      nirfRankTier: 'BAND_101_200',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500090',
      totalStudents: 5200,
      primaryContactName: 'Dr. C.D. Naidu',
      primaryContactPhone: '+91 98661 45678',
      primaryContactEmail: 'principal@vnrvjiet.ac.in',
      healthScore: 89,
    },
    {
      code: 'INST-CBIT-004',
      name: 'Chaitanya Bharathi Institute of Technology',
      type: 'AUTONOMOUS_COLLEGE' as const,
      naacRating: 'A_PLUS_PLUS' as const,
      aisheCode: 'C-19642',
      nirfRankTier: 'BAND_101_200',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500075',
      totalStudents: 4800,
      primaryContactName: 'Dr. P. Ravinder Reddy',
      primaryContactPhone: '+91 98492 56789',
      primaryContactEmail: 'principal@cbit.ac.in',
      healthScore: 88,
    },
    {
      code: 'INST-DPS-005',
      name: 'Delhi Public School Hyderabad',
      type: 'K12_SCHOOL' as const,
      naacRating: 'NOT_ACCREDITED' as const,
      aisheCode: 'SCH-DPS-01',
      nirfRankTier: 'PARTICIPATED',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
      totalStudents: 2200,
      primaryContactName: 'Geetha Swamy',
      primaryContactPhone: '+91 97011 67890',
      primaryContactEmail: 'principal@dpshyderabad.in',
      healthScore: 85,
    },
  ];

  const instMap = new Map<string, string>();
  for (const inst of institutions) {
    const record = await prisma.institution.upsert({
      where: { code: inst.code },
      update: { healthScore: inst.healthScore, primaryContactName: inst.primaryContactName },
      create: inst,
    });
    instMap.set(inst.code, record.id);
  }

  // Active MoUs
  const ouId = instMap.get('INST-OU-001');
  if (ouId) {
    await prisma.moU.upsert({
      where: { mouNumber: 'MOU-2026-001' },
      update: {},
      create: {
        mouNumber: 'MOU-2026-001',
        institutionId: ouId,
        title: 'Institutional Centre of Excellence in Edge AI & Autonomous Robotics',
        effectiveDate: new Date('2026-01-10'),
        expiryDate: new Date('2029-01-09'),
        scopeSummary: 'Establishment of 60-seat GPU-accelerated robotics laboratory, curriculum integration, faculty development, and student co-certification.',
        institutionSignatoryName: 'Prof. S. Ramachandram',
        institutionSignatoryRole: 'Vice Chancellor',
        status: 'ACTIVE',
      },
    });
  }

  // =========================================================================
  // 11. CRM Leads & 6-Stage Deals (Domain 8)
  // =========================================================================
  console.log('Seeding CRM 8-vertical leads and Kanban pipeline...');
  const crmLeads = [
    {
      leadNumber: 'TM4I-LD-2026-001',
      institutionName: 'Osmania University College of Engineering',
      vertical: 'ENGINEERING_COLLEGES' as const,
      contactPerson: 'Dr. Rajesh Varma',
      designation: 'Dean of Engineering',
      email: 'dean.engg@osmania.ac.in',
      phone: '+91 94401 23456',
      city: 'Hyderabad',
      state: 'Telangana',
      source: 'CAMPUS_OUTREACH',
      score: 88,
      status: 'QUALIFIED' as const,
      estimatedBudget: 1500000,
    },
    {
      leadNumber: 'TM4I-LD-2026-002',
      institutionName: 'GITAM Deemed University',
      vertical: 'UNIVERSITIES_AUTONOMOUS' as const,
      contactPerson: 'Prof. K. Venkatesh',
      designation: 'Director R&D',
      email: 'rnd.director@gitam.edu',
      phone: '+91 98481 12233',
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      source: 'TENDER',
      score: 92,
      status: 'PROPOSAL_SENT' as const,
      estimatedBudget: 3500000,
    },
    {
      leadNumber: 'TM4I-LD-2026-003',
      institutionName: 'Government Polytechnic Masab Tank',
      vertical: 'POLYTECHNICS' as const,
      contactPerson: 'K. Subba Rao',
      designation: 'Principal',
      email: 'principal@gptmasabtank.ac.in',
      phone: '+91 94411 99887',
      city: 'Hyderabad',
      state: 'Telangana',
      source: 'CAMPUS_OUTREACH',
      score: 74,
      status: 'CONTACTED' as const,
      estimatedBudget: 800000,
    },
    {
      leadNumber: 'TM4I-LD-2026-004',
      institutionName: 'Oakridge International School',
      vertical: 'K12_STEM_SCHOOLS' as const,
      contactPerson: 'Sarah Mathews',
      designation: 'STEM Coordinator',
      email: 'sarah.m@oakridge.in',
      phone: '+91 99899 44556',
      city: 'Hyderabad',
      state: 'Telangana',
      source: 'WEBSITE',
      score: 85,
      status: 'QUALIFIED' as const,
      estimatedBudget: 1200000,
    },
    {
      leadNumber: 'TM4I-LD-2026-005',
      institutionName: 'Bhavans Sri Ramakrishna Vidyalaya',
      vertical: 'ATL_LABS' as const,
      contactPerson: 'N. Radhika',
      designation: 'ATL Lab In-Charge',
      email: 'atl.incharge@bhavansrk.edu.in',
      phone: '+91 98765 43210',
      city: 'Secunderabad',
      state: 'Telangana',
      source: 'CAMPUS_OUTREACH',
      score: 78,
      status: 'NEW' as const,
      estimatedBudget: 600000,
    },
    {
      leadNumber: 'TM4I-LD-2026-006',
      institutionName: 'DRDO Defence Research and Development Lab (DRDL)',
      vertical: 'AEROSPACE_DEFENCE_LABS' as const,
      contactPerson: 'Dr. V.G. Sekaran',
      designation: 'Scientist G & Director',
      email: 'director@drdl.drdo.in',
      phone: '+91 94900 11223',
      city: 'Hyderabad',
      state: 'Telangana',
      source: 'REFERRAL',
      score: 95,
      status: 'PROPOSAL_SENT' as const,
      estimatedBudget: 6500000,
    },
    {
      leadNumber: 'TM4I-LD-2026-007',
      institutionName: 'NextGen Skills Academy India',
      vertical: 'EDTECH_PARTNERS' as const,
      contactPerson: 'Abhinav Saxena',
      designation: 'Co-Founder & COO',
      email: 'abhinav@nextgenskills.in',
      phone: '+91 98112 33445',
      city: 'Bengaluru',
      state: 'Karnataka',
      source: 'WEBSITE',
      score: 68,
      status: 'CONTACTED' as const,
      estimatedBudget: 1000000,
    },
    {
      leadNumber: 'TM4I-LD-2026-008',
      institutionName: 'Tata Trusts Rural Tech Initiative',
      vertical: 'CORPORATE_CSR' as const,
      contactPerson: 'Ritu Chhabra',
      designation: 'Head of CSR Partnerships',
      email: 'rchhabra@tatatrusts.org',
      phone: '+91 98200 55667',
      city: 'Mumbai',
      state: 'Maharashtra',
      source: 'REFERRAL',
      score: 90,
      status: 'QUALIFIED' as const,
      estimatedBudget: 5000000,
    },
  ];

  for (const ld of crmLeads) {
    await prisma.lead.upsert({
      where: { leadNumber: ld.leadNumber },
      update: { score: ld.score, status: ld.status },
      create: ld,
    });
  }

  // CRM Deals
  const deals = [
    {
      dealNumber: 'TM4I-DL-2026-001',
      title: 'Osmania Univ - Centre of Excellence in Robotics & Edge AI',
      institutionId: ouId,
      vertical: 'ENGINEERING_COLLEGES' as const,
      amount: 1500000,
      stage: 'PROPOSAL_QUOTE' as const,
      probabilityPct: 50,
      expectedCloseDate: new Date('2026-11-30'),
    },
    {
      dealNumber: 'TM4I-DL-2026-002',
      title: 'JNTUH - Satellite Ground Station & CanSat Lab Rig',
      institutionId: instMap.get('INST-JNTUH-002'),
      vertical: 'UNIVERSITIES_AUTONOMOUS' as const,
      amount: 2850000,
      stage: 'NEGOTIATION' as const,
      probabilityPct: 75,
      expectedCloseDate: new Date('2026-12-15'),
    },
    {
      dealNumber: 'TM4I-DL-2026-003',
      title: 'VNR VJIET - Drone Avionics & Autopilot Research Facility',
      institutionId: instMap.get('INST-VNR-003'),
      vertical: 'ENGINEERING_COLLEGES' as const,
      amount: 1200000,
      stage: 'CLOSED_WON' as const,
      probabilityPct: 100,
      expectedCloseDate: new Date('2026-10-15'),
      closedAt: new Date('2026-10-15'),
    },
  ];

  for (const dl of deals) {
    await prisma.deal.upsert({
      where: { dealNumber: dl.dealNumber },
      update: { stage: dl.stage, amount: dl.amount },
      create: dl,
    });
  }

  // =========================================================================
  // 12. Academic Programs, Batches & LMS Courses (Domains 10 & 11)
  // =========================================================================
  console.log('Seeding academic programs & LMS courses...');
  const programs = [
    {
      code: 'PRG-AI-ROB-01',
      title: 'Advanced Certificate in Autonomous Robotics & Edge AI',
      division: 'TECHM4_ENGINEERING' as const,
      summary: 'Comprehensive hands-on curriculum covering ROS2, LiDAR SLAM, NVIDIA Jetson edge inference, and mobile robotics kinematic control.',
      durationWeeks: 16,
      credits: 4,
      certificationType: 'TECHM4_INDUSTRY_CERTIFICATE' as const,
      targetAudience: 'ECE / CSE / Mechanical 3rd & 4th Year B.Tech',
    },
    {
      code: 'PRG-SAT-IOT-02',
      title: 'CanSat & Space Payloads Systems Engineering',
      division: 'TECHM4_SPACE' as const,
      summary: 'End-to-end design, telemetry link budgets, sensor integration, and atmospheric descent recovery for CanSat nano-satellite payloads.',
      durationWeeks: 12,
      credits: 4,
      certificationType: 'TECHM4_INDUSTRY_CERTIFICATE' as const,
      targetAudience: 'Aerospace / ECE / Mechatronics Undergraduates',
    },
    {
      code: 'PRG-STEM-K12-03',
      title: 'K-12 STEM & Atal Tinkering Labs Starter Curriculum',
      division: 'TECHM4_SCHOOLS' as const,
      summary: 'Project-based robotics, visual block coding, microcontrollers, and 3D printing design thinking for middle and high school students.',
      durationWeeks: 8,
      credits: 2,
      certificationType: 'AICTE_NEAT_APPROVED' as const,
      targetAudience: 'Grades 6 to 10 School Students',
    },
  ];

  for (const prg of programs) {
    await prisma.program.upsert({
      where: { code: prg.code },
      update: { title: prg.title, summary: prg.summary },
      create: prg,
    });
  }

  // =========================================================================
  // 13. Inventory Items & Lab Kit BOMs (Domain 17)
  // =========================================================================
  console.log('Seeding inventory items & lab kit BOMs...');
  const inventoryItems = [
    { sku: 'KIT-CANSAT-01', name: 'TechM4 CanSat Advanced Training Rig', category: 'FINISHED_KIT' as const, uom: 'KIT', hsnCode: '8802', reorderLevel: 5, unitCost: 18500 },
    { sku: 'PRT-SENS-BME280', name: 'BME280 Environmental Pressure & Temp Sensor', category: 'SENSORS' as const, uom: 'UNIT', hsnCode: '9031', reorderLevel: 25, unitCost: 450 },
    { sku: 'PRT-MCU-ESP32', name: 'ESP32-S3 Dual-Core SoC Development Board', category: 'MICROCONTROLLERS' as const, uom: 'UNIT', hsnCode: '8542', reorderLevel: 30, unitCost: 650 },
    { sku: 'PRT-RADIO-LORA', name: 'SX1276 LoRa 868MHz Transceiver Module', category: 'ROBOTICS_PARTS' as const, uom: 'UNIT', hsnCode: '8517', reorderLevel: 20, unitCost: 850 },
    { sku: 'KIT-DRONE-4X', name: 'TechM4 Quadcopter Autonomous Avionics Kit', category: 'FINISHED_KIT' as const, uom: 'KIT', hsnCode: '8806', reorderLevel: 5, unitCost: 24000 },
  ];

  const itemMap = new Map<string, string>();
  for (const it of inventoryItems) {
    const item = await prisma.inventoryItem.upsert({
      where: { sku: it.sku },
      update: { unitCost: it.unitCost, reorderLevel: it.reorderLevel },
      create: it,
    });
    itemMap.set(it.sku, item.id);
  }

  // Kit BOM Linkage
  const canSatRigId = itemMap.get('PRT-SENS-BME280');
  if (canSatRigId) {
    await prisma.kitBOM.upsert({
      where: { kitSku_componentItemId: { kitSku: 'KIT-CANSAT-01', componentItemId: canSatRigId } },
      update: {},
      create: { kitSku: 'KIT-CANSAT-01', componentItemId: canSatRigId, quantityRequired: 1 },
    });
  }

  // =========================================================================
  // 14. Fixed Assets Register (Domain 18)
  // =========================================================================
  console.log('Seeding fixed assets register...');
  const assets = [
    {
      assetTag: 'TM4I-AST-001',
      name: 'Creality Ender-3 V3 Plus High-Temp 3D Printer',
      category: 'THREE_D_PRINTERS' as const,
      purchaseDate: new Date('2025-08-15'),
      purchaseCost: 45000,
      serialNumber: 'CR3-2025-8819',
      depreciationMethod: 'SLM' as const,
      depreciationRatePct: 15.0,
      currentBookValue: 38250,
      branchId: branchMap.get('HYD-HQ'),
      status: 'IN_USE' as const,
    },
    {
      assetTag: 'TM4I-AST-002',
      name: 'Rigol DS1054Z 50MHz Digital Storage Oscilloscope',
      category: 'LAB_INSTRUMENTS' as const,
      purchaseDate: new Date('2025-09-01'),
      purchaseCost: 38000,
      serialNumber: 'RIG-50M-1029',
      depreciationMethod: 'SLM' as const,
      depreciationRatePct: 15.0,
      currentBookValue: 33500,
      branchId: branchMap.get('HYD-HQ'),
      status: 'IN_USE' as const,
    },
    {
      assetTag: 'TM4I-AST-003',
      name: 'Apple MacBook Pro M3 Max 36GB (Lead Architect Rig)',
      category: 'IT_LAPTOPS' as const,
      purchaseDate: new Date('2025-11-10'),
      purchaseCost: 249000,
      serialNumber: 'C02G9988MD6R',
      depreciationMethod: 'WDV' as const,
      depreciationRatePct: 40.0,
      currentBookValue: 198000,
      branchId: branchMap.get('HYD-HQ'),
      status: 'IN_USE' as const,
    },
  ];

  for (const ast of assets) {
    await prisma.asset.upsert({
      where: { assetTag: ast.assetTag },
      update: { currentBookValue: ast.currentBookValue, status: ast.status },
      create: ast,
    });
  }

  // =========================================================================
  // 15. Statutory Compliance Calendar (Domain 22)
  // =========================================================================
  console.log('Seeding Indian statutory compliance calendar obligations...');
  const obligations = [
    { title: 'GSTR-3B Monthly Tax Return Filing', authority: 'GSTN', frequency: 'MONTHLY' as const, dueDayOfMonth: 20, description: 'Monthly summary return of outward and inward supplies and payment of GST liability.' },
    { title: 'GSTR-1 Monthly Outward Supplies Statement', authority: 'GSTN', frequency: 'MONTHLY' as const, dueDayOfMonth: 11, description: 'Details of all B2B and B2C sales invoices and debit/credit notes.' },
    { title: 'TDS Payment & Quarterly 24Q/26Q Return', authority: 'CBDT', frequency: 'MONTHLY' as const, dueDayOfMonth: 7, description: 'Challan ITNS 281 deposit of salary and vendor TDS withheld under Sec 192, 194C, 194J.' },
    { title: 'EPFO Electronic Challan cum Return (ECR)', authority: 'EPFO', frequency: 'MONTHLY' as const, dueDayOfMonth: 15, description: 'Remittance of employee and employer Provident Fund contributions.' },
    { title: 'ESIC Monthly Contribution Deposit', authority: 'ESIC', frequency: 'MONTHLY' as const, dueDayOfMonth: 15, description: 'Deposit of employee state insurance statutory contribution for eligible employees.' },
    { title: 'MCA Annual Filing (MGT-7 & AOC-4)', authority: 'MCA', frequency: 'ANNUAL' as const, dueDayOfMonth: 30, description: 'Filing of annual financial accounts and return of company with the Registrar of Companies (ROC).' },
    { title: 'DPIIT Startup India Annual Compliance Review', authority: 'DPIIT', frequency: 'ANNUAL' as const, dueDayOfMonth: 31, description: 'Annual validation of innovation metrics and tax exemption status under Section 80-IAC.' },
  ];

  for (const ob of obligations) {
    const existing = await prisma.complianceObligation.findFirst({ where: { title: ob.title } });
    if (!existing) {
      await prisma.complianceObligation.create({ data: ob });
    }
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
