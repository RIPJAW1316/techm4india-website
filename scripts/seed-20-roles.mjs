import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, "../backend");
const require = createRequire(path.join(backendDir, "package.json"));

const RENDER_DATABASE_URL =
  "postgresql://techm4india:afIpu6rFsozv9N4ZdCs3OVaXNHznMtBH@dpg-dam2lflbedkc73aemnkg-a.singapore-postgres.render.com/techm4india_erp?sslmode=require";

process.env.DATABASE_URL = RENDER_DATABASE_URL;

const { PrismaClient } = require("@prisma/client");
const argon2 = require("argon2");

const DEMO_PASSWORD = "TechM4India!2026";

const prisma = new PrismaClient({
  datasources: {
    db: { url: RENDER_DATABASE_URL },
  },
});

const DEMO_PERSONAS = [
  {
    roleName: "SUPER_ADMIN",
    email: "admin@techm4india.com",
    firstName: "Kavita",
    lastName: "Sharma",
    designation: "Chief Technology & Systems Officer",
    employeeCode: "EMP-ADM-001",
    divisionSlug: "engineering",
    phone: "+91 98110 12001",
  },
  {
    roleName: "SUPER_ADMIN",
    email: "superadmin@techm4india.com",
    firstName: "Super",
    lastName: "Admin",
    designation: "Enterprise System Administrator",
    employeeCode: "EMP-ADM-002",
    divisionSlug: "engineering",
    phone: "+91 98110 12002",
  },
  {
    roleName: "FOUNDER_CEO",
    email: "founder@techm4india.com",
    firstName: "Arjun",
    lastName: "Rao",
    designation: "Founder & Chief Executive Officer",
    employeeCode: "EMP-CEO-001",
    divisionSlug: "engineering",
    phone: "+91 98220 22001",
  },
  {
    roleName: "FOUNDER_CEO",
    email: "founder.dev@techm4india.com",
    firstName: "Arjun",
    lastName: "Rao (Dev)",
    designation: "Founder & CEO (Dev Workspace)",
    employeeCode: "EMP-DEV-CEO",
    divisionSlug: "engineering",
    phone: "+91 98220 22002",
  },
  {
    roleName: "DIRECTOR",
    email: "director@techm4india.com",
    firstName: "Vikram",
    lastName: "Malhotra",
    designation: "Executive Director of Operations",
    employeeCode: "EMP-DIR-001",
    divisionSlug: "engineering",
    phone: "+91 98330 33001",
  },
  {
    roleName: "DIVISION_HEAD",
    email: "divisionhead@techm4india.com",
    firstName: "Priya",
    lastName: "Nair",
    designation: "Vice President & Division Head",
    employeeCode: "EMP-DIV-001",
    divisionSlug: "space",
    phone: "+91 98440 44001",
  },
  {
    roleName: "HR_MANAGER",
    email: "hrmanager@techm4india.com",
    firstName: "Ananya",
    lastName: "Deshmukh",
    designation: "Lead Human Resources Manager",
    employeeCode: "EMP-HR-001",
    divisionSlug: "solutions",
    phone: "+91 98550 55001",
  },
  {
    roleName: "HR_EXECUTIVE",
    email: "hrexecutive@techm4india.com",
    firstName: "Rohan",
    lastName: "Gupta",
    designation: "HR Operations Executive",
    employeeCode: "EMP-HRE-002",
    divisionSlug: "solutions",
    phone: "+91 98660 66001",
  },
  {
    roleName: "FINANCE_MANAGER",
    email: "financemanager@techm4india.com",
    firstName: "Rajesh",
    lastName: "Kulkarni",
    designation: "Financial Controller & Manager",
    employeeCode: "EMP-FIN-001",
    divisionSlug: "engineering",
    phone: "+91 98770 77001",
  },
  {
    roleName: "FINANCE_EXECUTIVE",
    email: "financeexecutive@techm4india.com",
    firstName: "Sneha",
    lastName: "Patil",
    designation: "Senior Finance Executive",
    employeeCode: "EMP-FINE-002",
    divisionSlug: "engineering",
    phone: "+91 98880 88001",
  },
  {
    roleName: "SALES_MANAGER",
    email: "salesmanager@techm4india.com",
    firstName: "Amitabh",
    lastName: "Sen",
    designation: "Head of Institutional Partnerships",
    employeeCode: "EMP-SLS-001",
    divisionSlug: "solutions",
    phone: "+91 98990 99001",
  },
  {
    roleName: "SALES_EXECUTIVE",
    email: "salesexecutive@techm4india.com",
    firstName: "Kavya",
    lastName: "Reddy",
    designation: "Institutional Outreach Specialist",
    employeeCode: "EMP-SLSE-002",
    divisionSlug: "schools",
    phone: "+91 98111 11001",
  },
  {
    roleName: "MARKETING_MANAGER",
    email: "marketingmanager@techm4india.com",
    firstName: "Deepak",
    lastName: "Verma",
    designation: "Growth & Brand Marketing Lead",
    employeeCode: "EMP-MKT-001",
    divisionSlug: "solutions",
    phone: "+91 98222 22001",
  },
  {
    roleName: "PROJECT_MANAGER",
    email: "projectmanager@techm4india.com",
    firstName: "Neha",
    lastName: "Sundaram",
    designation: "Senior Technical Project Manager",
    employeeCode: "EMP-PM-001",
    divisionSlug: "solutions",
    phone: "+91 98333 33001",
  },
  {
    roleName: "FACULTY_TRAINER",
    email: "faculty@techm4india.com",
    firstName: "Suresh",
    lastName: "Iyer",
    designation: "Lead Educator & Innovation Trainer",
    employeeCode: "EMP-FAC-001",
    divisionSlug: "schools",
    phone: "+91 98444 44001",
  },
  {
    roleName: "STUDENT",
    email: "student@techm4india.com",
    firstName: "Aarav",
    lastName: "Patel",
    designation: "Innovation Fellow & Scholar",
    employeeCode: "STU-2026-001",
    divisionSlug: "schools",
    phone: "+91 98555 55001",
  },
  {
    roleName: "INSTITUTION_ADMIN",
    email: "institutionadmin@techm4india.com",
    firstName: "Sunita",
    lastName: "Kapoor",
    designation: "Dean of Partner Institution",
    employeeCode: "INS-ADM-001",
    divisionSlug: "schools",
    phone: "+91 98666 66001",
  },
  {
    roleName: "CONTENT_MANAGER",
    email: "contentmanager@techm4india.com",
    firstName: "Tanvi",
    lastName: "Joshi",
    designation: "Editorial & Content Strategist",
    employeeCode: "EMP-CMS-001",
    divisionSlug: "solutions",
    phone: "+91 98777 77001",
  },
  {
    roleName: "IT_ADMIN",
    email: "itadmin@techm4india.com",
    firstName: "Karthik",
    lastName: "Raman",
    designation: "Principal Infrastructure Engineer",
    employeeCode: "EMP-IT-001",
    divisionSlug: "engineering",
    phone: "+91 98888 88001",
  },
  {
    roleName: "VENDOR",
    email: "vendor@techm4india.com",
    firstName: "Harish",
    lastName: "Mehta",
    designation: "Certified Procurement Partner",
    employeeCode: "VEN-001",
    divisionSlug: "engineering",
    phone: "+91 98999 99001",
  },
  {
    roleName: "EMPLOYEE",
    email: "employee@techm4india.com",
    firstName: "Aryan",
    lastName: "TechM4India",
    designation: "Full Stack Engineer",
    employeeCode: "EMP-001",
    divisionSlug: "engineering",
    phone: "+91 98112 23344",
  },
  {
    roleName: "VIEWER",
    email: "viewer@techm4india.com",
    firstName: "Aditi",
    lastName: "Rao",
    designation: "Governance & Advisory Observer",
    employeeCode: "VIE-001",
    divisionSlug: "engineering",
    phone: "+91 98223 34455",
  },
];

async function seed() {
  console.log("Connecting to PostgreSQL on Render...");
  const passwordHash = await argon2.hash(DEMO_PASSWORD, {
    memoryCost: 19456,
    parallelism: 1,
    timeCost: 2,
    type: argon2.argon2id,
  });

  const roles = await prisma.role.findMany();
  const roleMap = new Map(roles.map((r) => [r.name, r]));

  const divisions = await prisma.division.findMany({
    include: { departments: true },
  });
  const divisionMap = new Map(divisions.map((d) => [d.slug, d]));

  console.log(`Found ${roles.length} roles and ${divisions.length} divisions in database.`);

  for (const persona of DEMO_PERSONAS) {
    const role = roleMap.get(persona.roleName);
    if (!role) {
      console.warn(`Warning: Role ${persona.roleName} not found in database!`);
      continue;
    }

    const division = divisionMap.get(persona.divisionSlug) || divisions[0];
    const department = division?.departments?.[0] || null;

    // 1. Upsert User
    const user = await prisma.user.upsert({
      where: { email: persona.email },
      update: {
        status: "ACTIVE",
        passwordHash,
      },
      create: {
        email: persona.email,
        passwordHash,
        status: "ACTIVE",
      },
    });

    // 2. Link Role
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: role.id,
      },
    });

    // 3. Upsert Employee record
    const existingEmployee = await prisma.employee.findUnique({
      where: { userId: user.id },
    });
    if (existingEmployee) {
      await prisma.employee.update({
        where: { id: existingEmployee.id },
        data: {
          firstName: persona.firstName,
          lastName: persona.lastName,
          designation: persona.designation,
          personalEmail: persona.email,
          phone: persona.phone,
          divisionId: division?.id,
          departmentId: department?.id,
          employmentStatus: "ACTIVE",
        },
      });
    } else {
      // If employeeCode is already claimed, ensure unique code
      const existingByCode = await prisma.employee.findUnique({
        where: { employeeCode: persona.employeeCode },
      });
      const finalCode = existingByCode
        ? `${persona.employeeCode}-${Math.floor(Math.random() * 900 + 100)}`
        : persona.employeeCode;

      await prisma.employee.create({
        data: {
          userId: user.id,
          employeeCode: finalCode,
          firstName: persona.firstName,
          lastName: persona.lastName,
          designation: persona.designation,
          personalEmail: persona.email,
          phone: persona.phone,
          divisionId: division?.id,
          departmentId: department?.id,
          employmentStatus: "ACTIVE",
          joiningDate: new Date("2024-01-15"),
        },
      });
    }

    console.log(`✓ Provisioned [${persona.roleName}] ${persona.email} (${persona.firstName} ${persona.lastName})`);
  }

  console.log("\nAll 20 roles and demo personas successfully provisioned on Render PostgreSQL!");
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
