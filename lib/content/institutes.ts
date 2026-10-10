/**
 * TechM4Institutes page content (/institutes).
 *
 * TechM4Institutes is the division that works with colleges and universities.
 * The previous site had no page for it, so this page gathers the
 * institution-facing programmes TechM4India already published elsewhere:
 * - previous site pages/programs.html (N-STEP, PDP, RBLP, LSEP, bootcamps,
 *   the four-year pathway)
 * - previous site divisions/engineering.html ("Credit-Based Semester Programs"
 *   and "MoU-Based Institute Programs")
 * - this site's /engineering page (institute-embedded labs, credit-aware
 *   pathways, mentorship studios)
 *
 * Left out on purpose, because the brief does not ask for them and no
 * document supports them: named corporate MoU partners, "IIT mentors",
 * "government-recognised" certificates, incubation promises, prices, and any
 * enrolment or placement number. Add them only with the client's evidence.
 */

const enquiry = "/contact#contact-form";

export const hero = {
  kicker: "TechM4Institutes",
  kickerIndex: "05",
  title: "A partner that stays for",
  titleAccent: "the whole degree.",
  lede: "TechM4Institutes works with colleges and universities to build industry practice into the academic calendar: credit-bearing programmes, faculty development, lab set-up and a pathway that runs from a student's first semester to placement.",
  primary: { label: "Partner with us", href: enquiry },
  secondary: { label: "See the programmes", href: "#programmes" },
  image: "/images/editorial/workshop-crowd.jpeg",
  imageAlt: "College students seated in a lecture hall during a TechM4India session",
  imageCaption: "A TechM4India session on a university campus",
  imageNote: "Hyderabad",
  /** Each item links to its section on this page. */
  index: [
    { label: "What you receive", href: "#offer" },
    { label: "Credit programmes", href: "#programmes" },
    { label: "N-STEP tracks", href: "#n-step" },
    { label: "Four-year pathway", href: "#pathway" },
    { label: "Bootcamps", href: "#bootcamps" },
  ],
};

/* Source: previous site divisions/engineering.html "MoU-Based Institute
   Programs" and this site's /engineering page. */
export const offer = {
  label: "What an institution receives",
  title: "Built into the institution,",
  titleAccent: "not bolted on.",
  lede: "Every partnership is tailored to the university's syllabus and calendar, so the programmes sit alongside existing courses instead of competing with them.",
  items: [
    {
      title: "Curriculum aligned to your syllabus",
      text: "Programmes are mapped to the university's syllabus and semester calendar, so they fit B.Tech and M.Tech structures.",
    },
    {
      title: "Faculty development",
      text: "A Faculty Development Programme is part of the partnership, so the people who run the labs keep running them after launch.",
    },
    {
      title: "Lab set-up and software",
      text: "Support for setting up software labs and licensing inside the campus, so students practise on the tools industry uses every day.",
    },
    {
      title: "Credit-aware pathways",
      text: "Credit-bearing programmes that slot into the academic structure: open electives, research credits and a long internship.",
    },
    {
      title: "Mentorship and project studios",
      text: "Guidance that moves a student from a first question to a defensible result, with a project to show for it.",
    },
    {
      title: "Certification and placement support",
      text: "Certification for students who complete a programme, and placement support for graduates.",
    },
  ],
};

export type CreditProgramme = {
  code: string;
  name: string;
  credits: string;
  text: string;
  covers: string[];
};

/* Source: previous site pages/programs.html, "Academic Credit Programs". */
export const creditIntro = {
  label: "Academic credit programmes",
  title: "Three programmes.",
  titleAccent: "Seven credits and a real internship.",
  lede: "PDP and RBLP together carry seven academic credits per student. LSEP adds a six-month internship on live product work.",
};

export const creditProgrammes: CreditProgramme[] = [
  {
    code: "PDP",
    name: "Professional Development Program",
    credits: "2 credits",
    text: "A structured course in the professional habits companies look for in freshers.",
    covers: ["Industry communication", "Project management", "Technical presentation", "Professional ethics"],
  },
  {
    code: "RBLP",
    name: "Research-Based Learning Program",
    credits: "5 credits",
    text: "Students work in guided teams on real deep-tech problems, from research question to prototype.",
    covers: ["Research methodology", "Team-based problem solving", "Lab-based prototyping", "A real industry problem"],
  },
  {
    code: "LSEP",
    name: "Live Software Engineering Program",
    credits: "6-month internship",
    text: "Students work on TechM4Solutions product work, writing and maintaining real code. Institutions receive an assessment rubric.",
    covers: ["Live product work", "Production code", "Assessment rubric", "Placement track"],
  },
];

export type Track = { name: string; text: string };

/* Source: previous site pages/programs.html, N-STEP. */
export const nstep = {
  label: "N-STEP",
  title: "Five tracks, one",
  titleAccent: "twelve-week cohort.",
  lede: "N-STEP runs as a three-credit open elective that a student from any branch can join. Each track lasts twelve weeks, is mentored by industry practitioners and closes with a real project.",
  facts: [
    { value: "3", label: "Open elective credits" },
    { value: "12", label: "Weeks per track" },
    { value: "5", label: "Tracks to choose from" },
  ],
  tracks: [
    { name: "AI & machine learning", text: "Supervised learning, neural networks and deploying a model on real product work." },
    { name: "Cybersecurity", text: "Threat modelling, ethical hacking and security operations." },
    { name: "FinTech", text: "Payments infrastructure, credit scoring and regulatory technology." },
    { name: "IoT & robotics", text: "Embedded systems, sensor networks, automation and smart-campus hardware projects." },
    { name: "Space technology", text: "CanSat mission design, orbital mechanics, space data analytics and drone payloads." },
  ] satisfies Track[],
};

export type Year = { year: string; semesters: string; title: string; items: string[] };

/* Source: previous site pages/programs.html, "The 4-Year Journey", with
   partner-company names and incubation promises removed. */
export const pathway = {
  label: "The four-year pathway",
  title: "From the first semester",
  titleAccent: "to placement day.",
  lede: "Every year has a purpose. The pathway maps a student's growth from first-year foundations to a final-year portfolio of real work.",
  years: [
    {
      year: "Year 1",
      semesters: "Semesters 1–2",
      title: "Foundation and exposure",
      items: ["Deep-tech lab onboarding", "AI and coding basics", "Industry awareness sessions", "PDP begins"],
    },
    {
      year: "Year 2",
      semesters: "Semesters 3–4",
      title: "N-STEP enrolment",
      items: ["Choose an N-STEP track", "An industry project brief", "Twelve-week mentored cohort", "RBLP research teams form"],
    },
    {
      year: "Year 3",
      semesters: "Semesters 5–6",
      title: "Deep specialisation",
      items: ["RBLP research deep-dive", "Lab-based prototype development", "Guest lectures from industry", "A second N-STEP track"],
    },
    {
      year: "Year 4",
      semesters: "Semesters 7–8",
      title: "LSEP and launch",
      items: ["Six months on live product work", "A portfolio of real work", "Placement support"],
    },
  ] satisfies Year[],
};

export type SemesterTrack = { stage: string; title: string; text: string; tools: string[] };

/* Source: previous site divisions/engineering.html, "Credit-Based Semester
   Programs". */
export const semesterTracks = {
  label: "Industry software, semester by semester",
  lede: "Semester-length programmes aligned with university calendars, so engineering students learn industry software as part of the degree.",
  items: [
    {
      stage: "Semester I",
      title: "Engineering foundations and digital tools",
      text: "CAD basics, BIM fundamentals, drawing standards and engineering documentation.",
      tools: ["AutoCAD 2D/3D", "Revit", "Drawing standards and BIS codes"],
    },
    {
      stage: "Semester II",
      title: "Structural analysis and simulation",
      text: "From modelling to analysis to design verification.",
      tools: ["STAAD Pro", "ETABS", "ANSYS"],
    },
    {
      stage: "Advanced",
      title: "Advanced simulation and BIM workflows",
      text: "Meshing, BIM coordination, clash detection and construction documentation.",
      tools: ["HyperMesh", "Revit MEP", "BIM 360"],
    },
  ] satisfies SemesterTrack[],
  cta: { label: "See TechM4Engineering", href: "/engineering" },
};

export type Bootcamp = {
  name: string;
  length: string;
  text: string;
  tags: string[];
  /** Only the featured bootcamp carries its poster. */
  image?: { src: string; alt: string };
};

/* Source: previous site pages/programs.html, "Innovation Bootcamps", and the
   IGNITE AI poster (TechM4India x TGIIC). Fees, certificate bodies and
   prize promises were not carried over. */
export const bootcamps = {
  label: "Bootcamps for your campus",
  title: "Short, intense,",
  titleAccent: "and built around making.",
  lede: "Bootcamps run at partner institutions. They are not lectures: every team leaves with something it built.",
  items: [
    {
      name: "IGNITE AI Campus Transformation Program",
      length: "2 days, 1 night",
      text: "An offline, immersive AI bootcamp for undergraduate and postgraduate students in every stream, run by TechM4India with TGIIC.",
      tags: ["All UG and PG students", "Offline", "Certificate included"],
      image: {
        src: "/images/events/ignite-ai-poster.jpg",
        alt: "The IGNITE AI Campus Transformation Program poster, TechM4India with TGIIC",
      },
    },
    {
      name: "AI Builders Bootcamp",
      length: "48 hours",
      text: "Build and deploy a machine learning model, mentored by engineers from TechM4Solutions.",
      tags: ["Team-based", "Deploy a model"],
    },
    {
      name: "Cybersecurity Hackathon",
      length: "72 hours",
      text: "A capture-the-flag security competition on real vulnerabilities and real systems.",
      tags: ["CTF format", "Internship pipeline"],
    },
    {
      name: "Drone Engineering Sprint",
      length: "3 days",
      text: "Design, build, program and fly a drone payload mission.",
      tags: ["Hardware build", "Links to TechM4Space"],
    },
    {
      name: "AgriTech Innovation Camp",
      length: "5 days",
      text: "Solve real problems from Telangana's farming communities with IoT, data and automation.",
      tags: ["Rural impact", "IoT and AI"],
    },
    {
      name: "Startup Launchpad",
      length: "3 days",
      text: "Zero to pitch: take a problem statement, build an MVP and pitch it to a panel.",
      tags: ["MVP", "Pitch"],
    },
    {
      name: "BioTech Frontier Camp",
      length: "4 days",
      text: "Bioinformatics, genetic data analysis and biosensor prototyping for students crossing biology and computing.",
      tags: ["Lab-based", "Cross-disciplinary"],
    },
  ] satisfies Bootcamp[],
};

export type Step = { name: string; text: string };

/* Source: editorial summary of how a partnership is set up, drawn from the
   items above. No timelines are promised. */
export const start = {
  label: "How a partnership starts",
  steps: [
    { name: "Conversation", text: "We meet the leadership and faculty and learn the syllabus, the calendar and the goals." },
    { name: "Programme design", text: "We map programmes and credits to the university's structure." },
    { name: "Faculty and labs", text: "Faculty development runs and the labs are set up on campus." },
    { name: "Cohorts run", text: "Students move through programmes, projects and bootcamps." },
    { name: "Review", text: "We review each semester with the institution and adjust what comes next." },
  ] satisfies Step[],
};

export const closing = {
  label: "Next step",
  title: "Bring the programmes",
  titleAccent: "to your campus.",
  lede: "Tell us about your institution, your branches and your calendar, and we will propose a programme that fits.",
  paths: [
    { label: "Institutions", title: "Start a partnership", text: "Open the enquiry form.", href: enquiry },
    { label: "Bootcamps", title: "Host IGNITE AI", text: "Bring the AI bootcamp to your campus.", href: enquiry },
    { label: "Engineering", title: "See the software programmes", text: "Visit TechM4Engineering.", href: "/engineering" },
  ],
};
