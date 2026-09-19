export type Employee = {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  location: string;
  status: string;
  initials: string;
  joinedAt: string;
};

export type Lead = {
  id: number;
  name: string;
  organization: string;
  source: string;
  stage: string;
  value: number;
  owner: string;
  lastContact: string;
  initials: string;
};

export type Institution = {
  id: number;
  name: string;
  type: string;
  location: string;
  health: number;
  healthLabel: string;
  activePrograms: number;
  learners: number;
  renewalDate: string;
  owner: string;
  initials: string;
};

export type Project = {
  id: number;
  name: string;
  client: string;
  status: string;
  progress: number;
  dueDate: string;
  team: string[];
  budget: number;
};

export type Task = {
  id: number;
  title: string;
  project: string;
  assignee: string;
  status: string;
  priority: string;
  dueDate: string;
  initials: string;
};

export type Activity = {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  accent: string;
};

export type ModuleRecord = {
  id: number;
  module: string;
  kind: string;
  name: string;
  reference: string;
  status: string;
  owner: string;
  amount: number;
  progress: number;
  dueDate: string;
  description: string;
  initials?: string;
};

export type ModuleRecordInput = {
  kind: string;
  name: string;
  reference: string;
  status: string;
  owner: string;
  amount: number;
  progress: number;
  dueDate: string;
  description: string;
};

export type DashboardSummary = {
  revenue: number;
  revenueChange: number;
  activeLearners: number;
  learnerChange: number;
  partnerInstitutions: number;
  institutionChange: number;
  openPositions: number;
  pipelineValue: number;
  pipelineChange: number;
  revenueByMonth: Array<{ label: string; value: number }>;
  pipelineByStage: Array<{ label: string; value: number; count: number }>;
};

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 1,
    name: "Kavita Sharma",
    email: "admin@techm4india.com",
    role: "Chief Technology & Systems Officer",
    department: "Leadership / IT Infrastructure",
    location: "Hyderabad",
    status: "Active",
    initials: "KS",
    joinedAt: "2023-01-10",
  },
  {
    id: 2,
    name: "Arjun Rao",
    email: "founder@techm4india.com",
    role: "Founder & Chief Executive Officer",
    department: "Executive Office",
    location: "Hyderabad",
    status: "Active",
    initials: "AR",
    joinedAt: "2023-01-01",
  },
  {
    id: 3,
    name: "Dr. Vikram Malhotra",
    email: "director@techm4india.com",
    role: "Executive Director of Operations",
    department: "Directorate",
    location: "Bengaluru",
    status: "Active",
    initials: "VM",
    joinedAt: "2023-03-15",
  },
  {
    id: 4,
    name: "Priya Nair",
    email: "divisionhead@techm4india.com",
    role: "Vice President & Space Division Head",
    department: "TechM4Space",
    location: "Bengaluru",
    status: "Active",
    initials: "PN",
    joinedAt: "2023-05-20",
  },
  {
    id: 5,
    name: "Ananya Deshmukh",
    email: "hrmanager@techm4india.com",
    role: "Lead Human Resources Manager",
    department: "People Operations",
    location: "Pune",
    status: "Active",
    initials: "AD",
    joinedAt: "2023-06-01",
  },
  {
    id: 6,
    name: "Rohan Gupta",
    email: "hrexecutive@techm4india.com",
    role: "HR Operations Executive",
    department: "People Operations",
    location: "Hyderabad",
    status: "Active",
    initials: "RG",
    joinedAt: "2024-02-15",
  },
  {
    id: 7,
    name: "Rajesh Kulkarni",
    email: "financemanager@techm4india.com",
    role: "Financial Controller & Manager",
    department: "Finance & Accounts",
    location: "Mumbai",
    status: "Active",
    initials: "RK",
    joinedAt: "2023-04-12",
  },
  {
    id: 8,
    name: "Sneha Patil",
    email: "financeexecutive@techm4india.com",
    role: "Senior Finance Executive",
    department: "Finance & Accounts",
    location: "Pune",
    status: "Active",
    initials: "SP",
    joinedAt: "2024-03-01",
  },
  {
    id: 9,
    name: "Amitabh Sen",
    email: "salesmanager@techm4india.com",
    role: "Head of Institutional Partnerships",
    department: "Business Development",
    location: "New Delhi",
    status: "Active",
    initials: "AS",
    joinedAt: "2023-07-15",
  },
  {
    id: 10,
    name: "Kavya Reddy",
    email: "salesexecutive@techm4india.com",
    role: "Institutional Outreach Specialist",
    department: "Institutional Sales",
    location: "Hyderabad",
    status: "Active",
    initials: "KR",
    joinedAt: "2024-04-10",
  },
  {
    id: 11,
    name: "Deepak Verma",
    email: "marketingmanager@techm4india.com",
    role: "Growth & Brand Marketing Lead",
    department: "Marketing & Growth",
    location: "Bengaluru",
    status: "Active",
    initials: "DV",
    joinedAt: "2023-09-01",
  },
  {
    id: 12,
    name: "Neha Sundaram",
    email: "projectmanager@techm4india.com",
    role: "Senior Technical Project Manager",
    department: "TechM4Engineering",
    location: "Chennai",
    status: "Active",
    initials: "NS",
    joinedAt: "2023-08-18",
  },
  {
    id: 13,
    name: "Prof. Suresh Iyer",
    email: "faculty@techm4india.com",
    role: "Lead Educator & Innovation Trainer",
    department: "TechM4Schools",
    location: "Coimbatore",
    status: "Active",
    initials: "SI",
    joinedAt: "2023-10-01",
  },
  {
    id: 14,
    name: "Aarav Patel",
    email: "student@techm4india.com",
    role: "Innovation Fellow & Scholar",
    department: "TechM4Schools Student Cohort",
    location: "Ahmedabad",
    status: "Active",
    initials: "AP",
    joinedAt: "2024-06-01",
  },
  {
    id: 15,
    name: "Dr. Sunita Kapoor",
    email: "institutionadmin@techm4india.com",
    role: "Dean of Partner Institution",
    department: "Partner Institutions",
    location: "New Delhi",
    status: "Active",
    initials: "SK",
    joinedAt: "2023-11-15",
  },
  {
    id: 16,
    name: "Tanvi Joshi",
    email: "contentmanager@techm4india.com",
    role: "Editorial & Content Strategist",
    department: "Media & Publications",
    location: "Mumbai",
    status: "Active",
    initials: "TJ",
    joinedAt: "2024-01-08",
  },
  {
    id: 17,
    name: "Karthik Raman",
    email: "itadmin@techm4india.com",
    role: "Principal Infrastructure Engineer",
    department: "IT Infrastructure",
    location: "Bengaluru",
    status: "Active",
    initials: "KR",
    joinedAt: "2023-02-14",
  },
  {
    id: 18,
    name: "Harish Mehta",
    email: "vendor@techm4india.com",
    role: "Certified Procurement Partner",
    department: "Supply Chain & Logistics",
    location: "Surat",
    status: "Active",
    initials: "HM",
    joinedAt: "2024-03-12",
  },
  {
    id: 19,
    name: "Aryan TechM4India",
    email: "employee@techm4india.com",
    role: "Full Stack Engineer",
    department: "TechM4Solutions",
    location: "Hyderabad",
    status: "Active",
    initials: "AT",
    joinedAt: "2023-12-01",
  },
  {
    id: 20,
    name: "Aditi Rao",
    email: "viewer@techm4india.com",
    role: "Governance & Advisory Observer",
    department: "Board & Advisory",
    location: "Hyderabad",
    status: "Active",
    initials: "AR",
    joinedAt: "2024-05-01",
  },
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 1,
    name: "Dr. Vikram Sethi",
    organization: "Kendriya Vidyalaya Sangathan",
    source: "Institution referral",
    stage: "Proposal",
    value: 1250000,
    owner: "Nandini Rao",
    lastContact: "2 hours ago",
    initials: "VS",
  },
  {
    id: 2,
    name: "Meera Iyer",
    organization: "Aurora International School",
    source: "Website",
    stage: "Qualified",
    value: 480000,
    owner: "Ishita Menon",
    lastContact: "Yesterday",
    initials: "MI",
  },
  {
    id: 3,
    name: "Arjun Bhat",
    organization: "Bharat Aerospace Labs",
    source: "Partner",
    stage: "Discovery",
    value: 820000,
    owner: "Rohan Kapoor",
    lastContact: "3 days ago",
    initials: "AB",
  },
  {
    id: 4,
    name: "Sana Qureshi",
    organization: "Telangana State Innovation Cell",
    source: "Event",
    stage: "New",
    value: 275000,
    owner: "Aarav Mehta",
    lastContact: "4 days ago",
    initials: "SQ",
  },
];

export const INITIAL_INSTITUTIONS: Institution[] = [
  {
    id: 1,
    name: "Indian Institute of Technology Hyderabad",
    type: "University",
    location: "Sangareddy, Telangana",
    health: 94,
    healthLabel: "Excellent",
    activePrograms: 7,
    learners: 2840,
    renewalDate: "2027-02-14",
    owner: "Nandini Rao",
    initials: "IH",
  },
  {
    id: 2,
    name: "Oakridge International School",
    type: "K–12 School",
    location: "Gachibowli, Hyderabad",
    health: 86,
    healthLabel: "Healthy",
    activePrograms: 4,
    learners: 1240,
    renewalDate: "2026-11-30",
    owner: "Ishita Menon",
    initials: "OI",
  },
  {
    id: 3,
    name: "DRDO Young Scientist Labs",
    type: "Government",
    location: "Bengaluru, Karnataka",
    health: 78,
    healthLabel: "Watch",
    activePrograms: 3,
    learners: 680,
    renewalDate: "2026-10-18",
    owner: "Rohan Kapoor",
    initials: "DY",
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 1,
    name: "National STEM Catalyst",
    client: "Department of School Education",
    status: "In progress",
    progress: 72,
    dueDate: "Sep 28, 2026",
    team: ["AM", "NR", "RK"],
    budget: 8400000,
  },
  {
    id: 2,
    name: "AeroLab Digital Twin",
    client: "Bharat Aerospace Labs",
    status: "In progress",
    progress: 48,
    dueDate: "Oct 14, 2026",
    team: ["RK", "IM"],
    budget: 3250000,
  },
  {
    id: 3,
    name: "Future Schools Platform",
    client: "Oakridge International",
    status: "At risk",
    progress: 31,
    dueDate: "Oct 02, 2026",
    team: ["NR", "IM", "AM"],
    budget: 1900000,
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 1,
    title: "Review KVS proposal revisions",
    project: "National STEM Catalyst",
    assignee: "Nandini Rao",
    status: "In progress",
    priority: "High",
    dueDate: "Today",
    initials: "NR",
  },
  {
    id: 2,
    title: "Approve AeroLab discovery notes",
    project: "AeroLab Digital Twin",
    assignee: "Rohan Kapoor",
    status: "Todo",
    priority: "Medium",
    dueDate: "Tomorrow",
    initials: "RK",
  },
  {
    id: 3,
    title: "Send renewal health report",
    project: "Future Schools Platform",
    assignee: "Ishita Menon",
    status: "Todo",
    priority: "High",
    dueDate: "Sep 20",
    initials: "IM",
  },
  {
    id: 4,
    title: "Publish robotics cohort certificates",
    project: "National STEM Catalyst",
    assignee: "Nandini Rao",
    status: "Completed",
    priority: "Low",
    dueDate: "Sep 14",
    initials: "NR",
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 1,
    type: "lead",
    title: "New enterprise lead qualified",
    description: "Kendriya Vidyalaya Sangathan moved to Proposal",
    timestamp: "2 hours ago",
    actor: "Nandini Rao",
    accent: "violet",
  },
  {
    id: 2,
    type: "project",
    title: "Project milestone completed",
    description: "National STEM Catalyst reached 70% delivery",
    timestamp: "5 hours ago",
    actor: "Rohan Kapoor",
    accent: "teal",
  },
  {
    id: 3,
    type: "institution",
    title: "Institution renewal approaching",
    description: "DRDO Young Scientist Labs renews in 32 days",
    timestamp: "Yesterday",
    actor: "Ishita Menon",
    accent: "amber",
  },
  {
    id: 4,
    type: "people",
    title: "New team member added",
    description: "Priya Deshmukh joined the Learning team",
    timestamp: "Yesterday",
    actor: "Aarav Mehta",
    accent: "blue",
  },
  {
    id: 5,
    type: "finance",
    title: "Invoice payment received",
    description: "₹4.8L received from Aurora International School",
    timestamp: "2 days ago",
    actor: "Finance team",
    accent: "green",
  },
];

export const INITIAL_MODULE_RECORDS: ModuleRecord[] = [
  {
    id: 1,
    module: "hr",
    kind: "Leave request",
    name: "Priya Deshmukh",
    reference: "LR-2026-041",
    status: "Pending approval",
    owner: "Aarav Mehta",
    amount: 0,
    progress: 0,
    dueDate: "Sep 19, 2026",
    description: "Annual leave · 3 working days",
    initials: "PD",
  },
  {
    id: 2,
    module: "hr",
    kind: "Payroll run",
    name: "September 2026 payroll",
    reference: "PAY-SEP-26",
    status: "Ready for review",
    owner: "People operations",
    amount: 3860000,
    progress: 92,
    dueDate: "Sep 30, 2026",
    description: "54 employees · statutory checks in progress",
    initials: "PO",
  },
  {
    id: 3,
    module: "learning",
    kind: "Program",
    name: "Applied AI for Engineers",
    reference: "PRG-AI-104",
    status: "Live",
    owner: "Nandini Rao",
    amount: 0,
    progress: 68,
    dueDate: "Nov 12, 2026",
    description: "12 modules · 486 active learners",
    initials: "AI",
  },
  {
    id: 4,
    module: "learning",
    kind: "Program",
    name: "Robotics in the Classroom",
    reference: "PRG-ROB-208",
    status: "Live",
    owner: "Nandini Rao",
    amount: 0,
    progress: 44,
    dueDate: "Dec 04, 2026",
    description: "School cohort · 19 partner institutions",
    initials: "RC",
  },
  {
    id: 5,
    module: "learning",
    kind: "Student",
    name: "Ananya Reddy",
    reference: "STU-24018",
    status: "Active",
    owner: "Learning team",
    amount: 0,
    progress: 76,
    dueDate: "Oct 18, 2026",
    description: "Applied AI for Engineers · Hyderabad",
    initials: "AR",
  },
  {
    id: 6,
    module: "finance",
    kind: "Invoice",
    name: "Aurora International School",
    reference: "INV-2026-089",
    status: "Paid",
    owner: "Finance team",
    amount: 480000,
    progress: 100,
    dueDate: "Sep 12, 2026",
    description: "Robotics curriculum delivery",
    initials: "AI",
  },
  {
    id: 7,
    module: "finance",
    kind: "Invoice",
    name: "Bharat Aerospace Labs",
    reference: "INV-2026-094",
    status: "Awaiting payment",
    owner: "Finance team",
    amount: 1250000,
    progress: 62,
    dueDate: "Sep 24, 2026",
    description: "AeroLab Digital Twin milestone 2",
    initials: "BA",
  },
  {
    id: 8,
    module: "finance",
    kind: "Expense",
    name: "Hyderabad innovation summit",
    reference: "EXP-2026-331",
    status: "Needs review",
    owner: "Ishita Menon",
    amount: 86400,
    progress: 0,
    dueDate: "Sep 18, 2026",
    description: "Travel and event operations",
    initials: "HI",
  },
  {
    id: 9,
    module: "assets",
    kind: "Asset",
    name: "Robotics lab kit · Hyderabad",
    reference: "AST-ROB-021",
    status: "In service",
    owner: "TechM4Schools",
    amount: 245000,
    progress: 78,
    dueDate: "Mar 08, 2028",
    description: "18 kits · assigned to Oakridge International",
    initials: "RL",
  },
  {
    id: 10,
    module: "assets",
    kind: "Procurement",
    name: "Edge AI compute nodes",
    reference: "PO-2026-117",
    status: "Ordered",
    owner: "Rohan Kapoor",
    amount: 620000,
    progress: 35,
    dueDate: "Oct 06, 2026",
    description: "Supplier: CloudNine Systems · 6 units",
    initials: "EA",
  },
  {
    id: 11,
    module: "cms",
    kind: "Content",
    name: "2026 National STEM report",
    reference: "CMS-REP-014",
    status: "In review",
    owner: "Marketing team",
    amount: 0,
    progress: 84,
    dueDate: "Sep 21, 2026",
    description: "Report · 12,400 words · SEO review pending",
    initials: "NS",
  },
  {
    id: 12,
    module: "cms",
    kind: "Campaign",
    name: "Future makers — admissions",
    reference: "CMP-2026-038",
    status: "Scheduled",
    owner: "Growth team",
    amount: 0,
    progress: 100,
    dueDate: "Sep 22, 2026",
    description: "Landing page, email, and WhatsApp sequence",
    initials: "FM",
  },
  {
    id: 13,
    module: "support",
    kind: "Ticket",
    name: "Certificate issue · STU-23817",
    reference: "TKT-2026-118",
    status: "Open",
    owner: "Student success",
    amount: 0,
    progress: 20,
    dueDate: "Today",
    description: "SLA due in 4 hours",
    initials: "CI",
  },
  {
    id: 14,
    module: "support",
    kind: "Ticket",
    name: "Institution portal access",
    reference: "TKT-2026-113",
    status: "In progress",
    owner: "Platform team",
    amount: 0,
    progress: 64,
    dueDate: "Tomorrow",
    description: "Oakridge coordinator cannot reset password",
    initials: "IP",
  },
  {
    id: 15,
    module: "vendors",
    kind: "Vendor",
    name: "CloudNine Systems",
    reference: "VND-0034",
    status: "Active",
    owner: "Procurement",
    amount: 0,
    progress: 88,
    dueDate: "Nov 30, 2026",
    description: "Hardware and cloud infrastructure",
    initials: "CS",
  },
  {
    id: 16,
    module: "vendors",
    kind: "Partner",
    name: "TCS iON",
    reference: "PRT-0018",
    status: "Strategic",
    owner: "Aarav Mehta",
    amount: 0,
    progress: 94,
    dueDate: "Jan 18, 2027",
    description: "Certification and employability partner",
    initials: "TI",
  },
  {
    id: 17,
    module: "compliance",
    kind: "Compliance item",
    name: "GST return · August 2026",
    reference: "GST-AUG-26",
    status: "Due soon",
    owner: "Finance team",
    amount: 0,
    progress: 72,
    dueDate: "Sep 20, 2026",
    description: "GSTR-1 and GSTR-3B filing",
    initials: "GS",
  },
  {
    id: 18,
    module: "compliance",
    kind: "Audit item",
    name: "Information security review",
    reference: "AUD-2026-009",
    status: "In progress",
    owner: "Platform team",
    amount: 0,
    progress: 48,
    dueDate: "Oct 11, 2026",
    description: "Access controls and vendor risk assessment",
    initials: "IS",
  },
];

export const INITIAL_SUMMARY: DashboardSummary = {
  revenue: 4580000,
  revenueChange: 18.4,
  activeLearners: 4760,
  learnerChange: 12.6,
  partnerInstitutions: 14,
  institutionChange: 8.3,
  openPositions: 8,
  pipelineValue: 2825000,
  pipelineChange: 24.1,
  revenueByMonth: [
    { label: "Apr", value: 2600000 },
    { label: "May", value: 2950000 },
    { label: "Jun", value: 3180000 },
    { label: "Jul", value: 3520000 },
    { label: "Aug", value: 4010000 },
    { label: "Sep", value: 4580000 },
  ],
  pipelineByStage: [
    { label: "New", value: 275000, count: 6 },
    { label: "Qualified", value: 960000, count: 9 },
    { label: "Proposal", value: 1250000, count: 4 },
    { label: "Discovery", value: 820000, count: 7 },
  ],
};
