/**
 * Landing page content.
 *
 * Everything here is static and edited by hand. Sources are noted beside each
 * block so a future editor can check a claim before changing it. Do not add an
 * event date, an opening, a deadline or a result that TechM4India has not
 * supplied.
 */

import { innovateBharath } from "./schools";

export type EcosystemDivision = {
  id: string;
  index: string;
  name: string;
  short: string;
  /** Where the division sits in the ecosystem, shown on its tab. */
  stage: string;
  /** Who the division works with. */
  serves: string;
  line: string;
  description: string;
  /** Programmes, products and labs inside the division. */
  inside: string[];
  /** Software, tools or hardware the division works with. */
  toolsLabel: string;
  tools: string[];
  image: string;
  imageAlt: string;
  imageCredit?: string;
  href: string;
  cta: string;
};

/**
 * Five divisions, each with its own page.
 * Sources: Schools: lib/content/schools.ts (labs, platforms, kits) and the
 * previous site's ecosystem page (Scratch, Python, Arduino). Engineering: this
 * site's /engineering page (disciplines and tool list). Solutions:
 * lib/content/solutions.ts. Space: this site's /space page (labs and kits).
 * Institutes: lib/content/institutes.ts.
 */
export const ecosystem: EcosystemDivision[] = [
  {
    id: "schools",
    index: "01",
    name: "TechM4Schools",
    short: "Schools",
    stage: "Where it starts",
    serves: "School students, teachers and school leadership",
    line: "Where a student builds the first thing that works.",
    description:
      "Innovation labs, structured programmes, learning kits and mentors that bring coding, robotics, AI and drones into the everyday life of a school, and a programme, Innovate Bharath, that funds students' own ideas.",
    inside: [
      "Composite Skill Lab: five labs in one room",
      "Innovate Bharath",
      "CareerBuddy career discovery",
      "SchoolOS for the school's programmes",
      "Innovation kits",
      "Six student programmes",
    ],
    toolsLabel: "What students work with",
    tools: ["Scratch", "Python", "JavaScript", "Arduino", "Robotics kits", "Drones", "3D printers", "AR/VR"],
    image: "/images/schools/pallavi-student-robotics.webp",
    imageAlt: "A school student in uniform smiling at a small robot he holds up, with a robotic arm on the desk",
    imageCredit: "Image: Pallavi International School, Gandipet",
    href: "/schools",
    cta: "Explore TechM4Schools",
  },
  {
    id: "engineering",
    index: "02",
    name: "TechM4Engineering",
    short: "Engineering",
    stage: "Where it deepens",
    serves: "Engineering students and colleges",
    line: "Academic foundations, practised on real equipment.",
    description:
      "Hands-on engineering programmes across seven disciplines that connect academic foundations with the industry software, labs and project work students will meet at their first job.",
    inside: [
      "Civil, mechanical and chemical",
      "Computer science",
      "Electrical, electronics and communication",
      "Semester programmes in industry software",
      "Institute-embedded labs",
      "Mentorship and project studios",
    ],
    toolsLabel: "Software students train on",
    tools: [
      "AutoCAD",
      "Revit",
      "STAAD Pro",
      "ETABS",
      "ANSYS",
      "HyperMesh",
      "SolidWorks",
      "MATLAB",
      "Simulink",
      "Civil 3D",
      "Aspen Plus",
      "Vivado",
      "Altium",
      "Python",
      "AWS",
      "Docker",
    ],
    image: "/images/home/hero-engineer.jpeg",
    imageAlt: "An engineering student wiring a test panel in an electrical laboratory",
    href: "/engineering",
    cta: "Explore TechM4Engineering",
  },
  {
    id: "solutions",
    index: "03",
    name: "TechM4Solutions",
    short: "Solutions",
    stage: "Where it ships",
    serves: "Companies, schools and institutions that need software built",
    line: "Software, apps and AI, designed and shipped.",
    description:
      "The software engineering division: products, web and mobile apps, AI systems, ERPs and custom software, plus pay-and-use labs with high-end computer systems you can book by the hour.",
    inside: [
      "Product design and development",
      "Web and mobile apps",
      "AI and agentic AI solutions",
      "ERP and enterprise systems",
      "Cloud and DevOps",
      "Pay-and-use computer labs",
    ],
    toolsLabel: "The stack it ships with",
    tools: ["React", "TypeScript", "NestJS", "PostgreSQL", "Prisma", "Python", "PyTorch", "FastAPI", "Android", "ESP32"],
    image: "/images/about/computer-lab.jpeg",
    imageAlt: "A TechM4India mentor speaking to students at rows of workstations in a computer lab",
    href: "/solutions",
    cta: "Explore TechM4Solutions",
  },
  {
    id: "space",
    index: "04",
    name: "TechM4Space",
    short: "Space",
    stage: "Where it reaches",
    serves: "Students and institutions drawn to aerospace",
    line: "Satellites, rockets and telemetry, taught as engineering.",
    description:
      "Aerospace learning built around real hardware and mission thinking: six labs, from CanSat and CubeSat to propulsion and space communication, with kits students build themselves.",
    inside: [
      "CanSat development lab",
      "CubeSat technology lab",
      "Rocket and propulsion lab",
      "Drone and aerial systems lab",
      "Space communication lab",
      "Advanced research lab",
    ],
    toolsLabel: "Kits students build",
    tools: ["CanSat kit", "CubeSat kit", "Rocket science kit", "Drone technology kit", "Space systems kit"],
    image: "/images/space/assembly.jpeg",
    imageAlt: "A crew module under assembly on a spacecraft integration floor",
    imageCredit: "Image: ISRO / Department of Space",
    href: "/space",
    cta: "Explore TechM4Space",
  },
  {
    id: "institutes",
    index: "05",
    name: "TechM4Institutes",
    short: "Institutes",
    stage: "Where it scales",
    serves: "Colleges, universities and training institutes",
    line: "A partner that stays for the whole degree.",
    description:
      "Long-term programmes for colleges and universities: credit-bearing courses, faculty development, lab set-up, campus bootcamps and a pathway from the first semester to placement.",
    inside: [
      "N-STEP: five 12-week tracks",
      "PDP and RBLP: seven credits",
      "LSEP: a six-month internship",
      "Faculty development",
      "Software lab set-up",
      "Campus bootcamps, including IGNITE AI",
    ],
    toolsLabel: "Semester software programmes",
    tools: ["AutoCAD", "Revit", "STAAD Pro", "ETABS", "ANSYS", "HyperMesh", "BIM 360"],
    image: "/images/editorial/workshop-crowd.jpeg",
    imageAlt: "College students seated in a lecture hall during a TechM4India session",
    href: "/institutes",
    cta: "Explore TechM4Institutes",
  },
];

export type Activity = {
  id: string;
  title: string;
  kind: "Programme" | "Challenge" | "Workshop" | "Bootcamp" | "Cohort";
  /**
   * ISO date (YYYY-MM-DD) when one has been confirmed. Dated items are sorted
   * into Upcoming or Past by the visitor's current date, so an event can never
   * stay under "Upcoming" after it has happened.
   */
  date?: string;
  endDate?: string;
  /** Used only when there is no confirmed date. */
  undated?: "past" | "ongoing";
  /** Shown in the date column for undated items. */
  when: string;
  place?: string;
  summary: string;
  /** Short facts shown as chips. */
  facts?: string[];
  image: string;
  imageAlt: string;
  /** Crop focus for the thumbnail, e.g. "center top" for a poster. */
  imagePosition?: string;
  href: string;
  cta: string;
};

/**
 * Sources:
 * - IGNITE AI: the programme poster (TechM4India x TGIIC, "IGNITE AI Campus
 *   Transformation Program") and the previous site's programs page
 *   ("Featured Immersive Bootcamp 2026", 2 days 1 night, offline, UG and PG).
 * - Innovate Bharath: the client's brief.
 * - N-STEP: the previous site's programs page.
 * - Sessions: photographs from TechM4India sessions in a university computer
 *   lab (previous site about page carousel). The slide on screen in each photo
 *   gives the topic.
 * No calendar dates were supplied for any of these, so none is listed as
 * upcoming. Add `date` to an entry to schedule it.
 */
export const activities: Activity[] = [
  {
    id: "ignite-ai",
    title: "IGNITE AI Campus Transformation Program",
    kind: "Bootcamp",
    undated: "ongoing",
    when: "2026 edition",
    place: "Partner campuses, Telangana and Andhra Pradesh",
    summary:
      "A collaborative programme from TechM4India and TGIIC: an immersive two-day, one-night offline AI bootcamp for undergraduate and postgraduate students in every stream, with hands-on sessions on current AI tools.",
    facts: ["2 days, 1 night", "Offline", "All UG and PG students", "Certificate included"],
    image: "/images/events/ignite-ai-poster.jpg",
    imageAlt: "The IGNITE AI Campus Transformation Program poster, TechM4India with TGIIC",
    imagePosition: "center 12%",
    href: "/institutes#bootcamps",
    cta: "Bring IGNITE AI to your campus",
  },
  {
    id: "n-step",
    title: "N-STEP cohorts",
    kind: "Cohort",
    undated: "ongoing",
    when: "Runs with partner institutions",
    summary:
      "A three-credit open elective in five twelve-week tracks: AI and machine learning, cybersecurity, FinTech, IoT and robotics, and space technology. Each track ends with a real project.",
    facts: ["3 credits", "12 weeks", "5 tracks"],
    image: "/images/editorial/workshop-lab.jpeg",
    imageAlt: "A TechM4India mentor addressing smiling students seated behind rows of monitors in a computer lab",
    href: "/institutes#n-step",
    cta: "See the N-STEP tracks",
  },
  {
    id: "innovate-bharath",
    title: "Innovate Bharath",
    kind: "Programme",
    undated: "past",
    when: "Earlier edition",
    summary: innovateBharath.figuresConfirmed
      ? "A TechM4Schools programme for students' own ideas. More than 1,200 students took part, and eight unique ideas were selected and funded."
      : "A TechM4Schools programme in which students put forward ideas of their own, and the strongest are selected and funded.",
    facts: innovateBharath.figuresConfirmed ? ["1,200+ students", "8 ideas funded"] : undefined,
    image: "/images/schools/pallavi-student-library.webp",
    imageAlt: "A school student in uniform writing in a notebook at a library table",
    href: "/schools#innovate-bharath",
    cta: "About Innovate Bharath",
  },
  {
    id: "cybersecurity-session",
    title: "Cybersecurity session for engineering students",
    kind: "Workshop",
    undated: "past",
    when: "Earlier session",
    place: "University computer lab, Hyderabad",
    summary:
      "From types of cyber threats and common attacks to security frameworks, network security, encryption and incident response, taught in a full computer lab.",
    facts: ["Cyber hygiene", "Network security", "Incident response"],
    image: "/images/events/cybersecurity-session.jpeg",
    imageAlt: "A TechM4India mentor presenting a cybersecurity agenda slide to students at computers",
    imagePosition: "center 40%",
    href: "/institutes#bootcamps",
    cta: "Host a session like this",
  },
  {
    id: "web-session",
    title: "Web fundamentals workshop",
    kind: "Workshop",
    undated: "past",
    when: "Earlier session",
    place: "University computer lab, Hyderabad",
    summary:
      "An introduction to HTML5 for engineering students: core components, tags, elements, attributes, tables and lists, built up live in class.",
    facts: ["HTML5", "Hands-on"],
    image: "/images/events/web-fundamentals-session.jpeg",
    imageAlt: "Students seated in a classroom facing a speaker and a projected list of HTML topics",
    href: "/institutes#bootcamps",
    cta: "Host a session like this",
  },
  {
    id: "ml-session",
    title: "Machine learning session",
    kind: "Workshop",
    undated: "past",
    when: "Earlier session",
    place: "Department of Information Technology, university campus",
    summary:
      "A working session on regression and data, with the model drawn live on screen while students follow along at their own workstations.",
    facts: ["Regression", "Data analysis"],
    image: "/images/about/computer-lab.jpeg",
    imageAlt: "A TechM4India mentor with a microphone in a computer lab, a scatter plot with a regression line on the screen",
    href: "/institutes#n-step",
    cta: "See the AI track",
  },
];

export type UpdateKind = "Internship" | "Fellowship" | "Role" | "Programme" | "Placement" | "Announcement";

export type Update = {
  id: string;
  kind: UpdateKind;
  title: string;
  division: string;
  /** Short facts: duration, place, eligibility. */
  meta: string[];
  summary: string;
  skills?: string[];
  /** ISO date the update was posted. Undated items sort after dated ones. */
  postedOn?: string;
  href: string;
  cta: string;
};

/**
 * Internship and placement updates.
 *
 * HOW TO POST AN UPDATE: add an entry at the top of `updates` with a
 * `postedOn` date (YYYY-MM-DD), then set `updatesReviewedOn` to today. For a
 * placement, use kind "Placement" and name a student only with their consent.
 *
 * Sources: roles as listed on techm4india.com/careers (checked 2026-10-10;
 * that page gives no posting dates or deadlines), LSEP from the previous
 * site's programs page, IGNITE AI from its poster. No placement result has
 * been supplied, so none is listed.
 */
export const updatesReviewedOn = "2026-10-10";

export const updates: Update[] = [
  {
    id: "ignite-ai-registrations",
    kind: "Announcement",
    title: "IGNITE AI 2026: campus registrations open",
    division: "TechM4India with TGIIC",
    meta: ["2 days, 1 night", "Offline", "UG and PG students"],
    summary: "Institutions can bring the IGNITE AI bootcamp to their campus for the 2026 edition.",
    href: "/institutes#bootcamps",
    cta: "Bring it to your campus",
  },
  {
    id: "lsep",
    kind: "Internship",
    title: "LSEP: Live Software Engineering Program",
    division: "TechM4Solutions",
    meta: ["6 months", "Through partner institutions"],
    summary: "A six-month internship writing and maintaining real code on TechM4Solutions product work.",
    skills: ["Production code", "Product teams", "Placement track"],
    href: "/institutes#programmes",
    cta: "About LSEP",
  },
  {
    id: "ai-ml-intern",
    kind: "Internship",
    title: "AI/ML Engineer Intern",
    division: "TechM4Solutions",
    meta: ["6 months", "Hyderabad"],
    summary: "Work on TechM4Solutions' AI products: write production Python and ship model updates.",
    skills: ["Python", "PyTorch", "FastAPI", "MLflow", "SQL"],
    href: "/contact#contact-form",
    cta: "Apply",
  },
  {
    id: "iot-hardware-intern",
    kind: "Internship",
    title: "IoT & Hardware Engineer Intern",
    division: "TechM4Solutions",
    meta: ["4 months", "Hyderabad"],
    summary: "Build sensor networks, program microcontrollers and deploy edge AI on Raspberry Pi.",
    skills: ["Arduino", "Raspberry Pi", "MQTT", "Edge AI", "PCB design"],
    href: "/contact#contact-form",
    cta: "Apply",
  },
  {
    id: "aerospace-intern",
    kind: "Internship",
    title: "Aerospace & Drone Engineering Intern",
    division: "TechM4Space",
    meta: ["6 months", "Hyderabad"],
    summary: "Design drone payloads, work on CanSat mission specifications and analyse propulsion tests.",
    skills: ["Aerodynamics", "CAD", "Flight control", "MATLAB"],
    href: "/contact#contact-form",
    cta: "Apply",
  },
  {
    id: "research-fellow",
    kind: "Fellowship",
    title: "Research Fellow, Deep-Tech Labs",
    division: "Research labs",
    meta: ["3 months", "Paid", "Hyderabad"],
    summary: "A paid fellowship inside one of TechM4India's research labs: define a question, build the prototype, present the result.",
    skills: ["Research design", "Prototyping", "Technical writing"],
    href: "/contact#contact-form",
    cta: "Apply",
  },
  {
    id: "programme-delivery-lead",
    kind: "Role",
    title: "Program Delivery Lead, N-STEP",
    division: "TechM4Institutes",
    meta: ["Full-time", "Hyderabad"],
    summary: "Lead the delivery of the N-STEP programme with partner institutions.",
    href: "/contact#contact-form",
    cta: "Apply",
  },
  {
    id: "cybersecurity-researcher",
    kind: "Role",
    title: "Cybersecurity Researcher",
    division: "Research labs",
    meta: ["Full-time", "Hyderabad"],
    summary: "A research role that ships to production.",
    href: "/contact#contact-form",
    cta: "Apply",
  },
  {
    id: "campus-ambassador",
    kind: "Programme",
    title: "Campus Ambassador Program",
    division: "TechM4India",
    meta: ["On campus", "Engineering colleges"],
    summary: "Represent TechM4India at your college, with a performance-based stipend for referrals and ambassador certification.",
    skills: ["Community", "Outreach"],
    href: "/contact#contact-form",
    cta: "Apply",
  },
];

export type Lead = {
  id: string;
  name: string;
  /** Exactly as published on the previous site's home page. */
  role: string;
  image: string;
  background: string;
  /** What the person does for TechM4India, per division, as published. */
  contributions: { division: string; text: string }[];
  focus: string[];
};

/**
 * Source: the four leads shown on the previous site's home page ("Meet the
 * Visionaries Driving Innovation", index.html) with roles as published there,
 * and the per-division bios from divisions/schools.html and
 * divisions/solutions.html, lightly edited for length. Portraits are the ones
 * already in this project.
 *
 * Not included until the client confirms: the founders listed on the About
 * page, and any link between "Mahi" (signed "Founder & CEO" on the Vision
 * page) and Thanniru Mahesh. Do not merge those identities here.
 */
export const leads: Lead[] = [
  {
    id: "sudheer-reddy",
    name: "Dr. K. Sudheer Reddy",
    role: "Dean – Academics & Planning, Anurag University",
    image: "/images/people/dr-sudheer-reddy.webp",
    background: "More than two decades in academics and technology.",
    contributions: [
      {
        division: "TechM4Schools",
        text: "Provides strategic direction so that innovation becomes part of everyday education, bridging theoretical learning and practical application.",
      },
      {
        division: "TechM4Solutions",
        text: "Guides strategic direction for enterprise and education platforms, so that each one connects research, scale and real-world use.",
      },
    ],
    focus: ["Academic strategy", "Programme planning", "Linking theory to practice"],
  },
  {
    id: "mahesh-mannuru",
    name: "Mahesh Mannuru",
    role: "Senior Technical Lead, TechM4Schools",
    image: "/images/people/mahesh-mannuru.webp",
    background:
      "Expertise in embedded systems, cybersecurity, AUTOSAR integration and software development.",
    contributions: [
      {
        division: "TechM4Schools",
        text: "Designs hands-on learning experiences that expose students to industry-relevant technologies and real-world engineering concepts.",
      },
      {
        division: "TechM4Solutions",
        text: "Architects secure, high-performance systems across embedded platforms, cybersecurity and AUTOSAR integration.",
      },
    ],
    focus: ["Embedded systems", "Cybersecurity", "AUTOSAR integration", "Software development"],
  },
  {
    id: "mettu-raja-reddy",
    name: "Mettu Raja Reddy",
    role: "Senior Technical Lead, TechM4Schools",
    image: "/images/people/mettu-raja-reddy.webp",
    background: "Experience across business analysis, product management and entrepreneurship.",
    contributions: [
      {
        division: "TechM4Schools",
        text: "Builds innovation ecosystems that encourage creativity, problem-solving and future readiness among students.",
      },
      {
        division: "TechM4Solutions",
        text: "Drives product strategy, translating business requirements into platforms that can scale.",
      },
    ],
    focus: ["Business analysis", "Product management", "Entrepreneurship"],
  },
  {
    id: "bharath-reddy",
    name: "Elavala Bharath Reddy",
    role: "Senior Technical Lead, TechM4Schools",
    image: "/images/people/elavala-bharath-reddy.webp",
    background: "Specialises in Salesforce technologies and digital transformation.",
    contributions: [
      {
        division: "TechM4Schools",
        text: "Supports the development of scalable educational platforms that improve learning experiences and help institutions work through technology.",
      },
      {
        division: "TechM4Solutions",
        text: "Designs cloud-native platforms for enterprise digital transformation.",
      },
    ],
    focus: ["Salesforce technologies", "Digital transformation", "Educational platforms"],
  },
];
