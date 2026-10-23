/**
 * TechM4Schools page content (/schools).
 *
 * Everything here is static and edited by hand. A source is noted above each
 * block so a future editor can check a claim before changing it.
 * "Previous site" means the earlier TechM4India website (divisions/schools.html).
 * "The client's brief" means Website Updation.docx, which supplied the
 * Innovate Bharath figures and the AU / NITs / NASSCOM validation published
 * below at the client's instruction.
 */

import { contact } from "../site-data";

/* Source: page brief (story and headline). The illustrative robotics photo
   is licensed from Pexels; see docs/image-sources-2026-10.json. */
export const hero = {
  kicker: "TechM4Schools",
  title: "From curiosity to capability",
  titleAccent: "one working build at a time.",
  lede: "TechM4Schools brings labs, structured programmes, learning kits and mentors into the school day, so a student who is curious about technology gets the chance to practise it, build with it and eventually lead with it.",
  primaryCta: { label: "Bring TechM4Schools to your school", href: "/contact" },
  secondaryCta: { label: "Follow the student journey", href: "#student-journey" },
  image: "/images/schools/school-robotics-hero.webp",
  imageAlt: "A student holding a robotics project in a classroom",
  imageCaption: "Curiosity, in hand",
  imageNote: "Illustrative school photograph",
};

export type SchoolFigure = { value: string; suffix?: string; label: string };

/* Source: Innovate Bharath figures from the client's brief; lab and
   programme counts are what this page itself describes. Each item links to
   its section. */
export const heroInside: {
  label: string;
  items: { value: string; suffix?: string; label: string; href: string }[];
} = {
  label: "TechM4Schools, in numbers",
  items: [
    { value: "1,200", suffix: "+", label: "students in Innovate Bharath", href: "#innovate-bharath" },
    { value: "8", label: "student ideas selected and funded", href: "#innovate-bharath" },
    { value: "5", label: "labs in the Composite Skill Lab", href: "#labs" },
    { value: "6", label: "student programmes", href: "#programmes" },
  ],
};

/**
 * Source: the client's brief ("Innovate Bharath: 1200+ Students. 8 Unique
 * ideas were selected and funded."), published at the client's instruction.
 * The previous site does not mention Innovate Bharath. Setting
 * `figuresConfirmed` to false hides the figures in this section and on the
 * landing page's events board (the hero strip lists them separately).
 * Use exactly these numbers. Do not add a date, place, amount, school or winner.
 */
export const innovateBharath = {
  figuresConfirmed: true,
  figures: [
    { value: "1,200", suffix: "+", label: "students took part in Innovate Bharath" },
    { value: "8", label: "unique ideas selected and funded" },
  ] satisfies SchoolFigure[],
  label: "Innovate Bharath",
  title: "A programme where a student's idea is",
  titleAccent: "taken seriously.",
  body: "Innovate Bharath is a TechM4Schools programme for ideas that come from students themselves. Students put their ideas forward, and the strongest are selected and funded.",
  steps: [
    { title: "Students propose", text: "The ideas come from the students themselves." },
    { title: "The strongest are selected", text: "From everything proposed, the strongest ideas are selected." },
    { title: "Selected ideas are funded", text: "Each selected idea receives funding." },
  ],
  noteTitle: "Details on request",
  note: "Dates, participating schools and the funded ideas themselves are shared by the team on request.",
  cta: { label: "Ask about Innovate Bharath", href: "/contact" },
};

export type Platform = {
  id: string;
  name: string;
  kind: string;
  description: string;
  featuresLabel: string;
  features: string[];
};

/* Source: previous site, divisions/schools.html, "School Innovation Products".
   Descriptions and feature names are as listed there, in plainer language. */
export const platformsIntro = {
  label: "Platforms",
  title: "Two platforms behind",
  titleAccent: "the practical work.",
  lede: "The labs are where students build. These two products keep the guidance and the administration around that work in one place.",
};

export const platforms: Platform[] = [
  {
    id: "careerbuddy",
    name: "CareerBuddy",
    kind: "Career discovery platform",
    description:
      "Helps a student identify strengths, interests and future aspirations through assessments and personalised guidance, then relates them to subjects and possible careers.",
    featuresLabel: "What it covers",
    features: [
      "AI-based assessments",
      "Career exploration",
      "Subject mapping",
      "Career roadmaps",
      "Future readiness programmes",
    ],
  },
  {
    id: "schoolos",
    name: "SchoolOS",
    kind: "Digital school innovation ecosystem",
    description:
      "The digital layer a school uses to manage and monitor its innovation initiatives: which programmes are running, who is taking part and what is planned next.",
    featuresLabel: "What it covers",
    features: [
      "Programme management",
      "Student profiles",
      "Data insights and analytics",
      "Event management",
      "Collaboration tools",
    ],
  },
];

export type Lab = {
  id: string;
  name: string;
  short: string;
  image: string;
  imageAlt: string;
  /** One-line summary already published on this site. */
  line: string;
  description: string;
  activities: string[];
};

/* Source: lab names and one-line summaries from this site's previous
   /schools page; descriptions and activity lists from the previous site,
   divisions/schools.html, "Innovation Infrastructure". */
export const labsIntro = {
  label: "Composite Skill Lab",
  title: "Five labs in",
  titleAccent: "one room.",
  lede: "The Composite Skill Lab is a single learning environment that gives students practical exposure to several technologies side by side. Choose a lab to see what students do there.",
  explorerLabel: "The five labs",
  activitiesLabel: "What students do here",
};

export const labs: Lab[] = [
  {
    id: "coding",
    name: "Coding & programming lab",
    short: "Coding",
    image: "/images/schools/coding-class.webp",
    imageAlt: "Pupils working together at desktop computers in a classroom",
    line: "Logic, software and the habit of asking a computer to do something useful.",
    description:
      "Students develop logical thinking and computational skills by learning coding fundamentals, working in Python and JavaScript, and creating simple applications and games.",
    activities: [
      "Practise logical thinking",
      "Learn coding fundamentals",
      "Write Python and JavaScript",
      "Build simple apps and games",
    ],
  },
  {
    id: "robotics",
    name: "Robotics & automation lab",
    short: "Robotics",
    image: "/images/schools/robotics-team.webp",
    imageAlt: "Pupils and a teacher assembling a small robot at a table",
    line: "Mechanisms, sensors and the joy of seeing a system respond.",
    description:
      "Students learn robotics basics through hands-on projects: sensors, motors, circuit building, robot programming, automation concepts and solving problems as a team.",
    activities: [
      "Work with sensors and motors",
      "Build circuits",
      "Program a robot",
      "Explore automation concepts",
    ],
  },
  {
    id: "drone",
    name: "Drone & aerial technology lab",
    short: "Drones",
    image: "/images/schools/drone-flight.webp",
    imageAlt: "A small camera drone in flight",
    line: "A new perspective on motion, mapping and the world from above.",
    description:
      "Students gain practical exposure to drone technology: flight principles, the components of a drone, safe flying practices and how aerial systems are used in industry.",
    activities: [
      "Understand flight principles",
      "Identify drone components",
      "Learn safe flying practices",
      "Study industry applications",
    ],
  },
  {
    id: "ai",
    name: "Artificial intelligence lab",
    short: "AI",
    image: "/images/schools/ai-learning.webp",
    imageAlt: "Pupils collaborating around laptops in a classroom",
    line: "A grounded introduction to the systems learning to recognise patterns.",
    description:
      "Students explore the fundamentals of AI, understand how intelligent systems work, build simple AI projects and consider real-world applications and the ethics around them.",
    activities: [
      "Learn AI fundamentals",
      "See how intelligent systems work",
      "Build simple AI projects",
      "Discuss applications and ethics",
    ],
  },
  {
    id: "maker",
    name: "Innovation & maker education lab",
    short: "Maker",
    image: "/images/schools/maker-printer.webp",
    imageAlt: "Pupils watching a 3D printer make a small object",
    line: "A place to sketch, prototype, question and try again.",
    description:
      "Students apply design thinking, identify real-world problems, create prototypes and develop their own solutions through project-based learning.",
    activities: [
      "Apply design thinking",
      "Identify a real problem",
      "Create a prototype",
      "Develop a solution as a project",
    ],
  },
];

/* Source: previous site, divisions/schools.html, Composite Skill Lab card.
   It lists these as lab resources; the final list is agreed per school, so
   it is presented as "can include", not as a fixed specification. */
export const labRoom = {
  title: "What the room can include",
  items: [
    "Tablets and workstations",
    "3D printers and interactive presentation platforms",
    "STEM walls and learning models",
    "AR/VR capabilities",
    "Robotics, science and maths concept kits",
  ],
  note: "The equipment for each lab is agreed with the school. A full list is shared on enquiry.",
  image: "/images/schools/robotics.jpeg",
  imageAlt: "Three teenagers assembling a small wired robot together at a table",
  imageCaption: "Building a robot as a team",
  imageNote: "Illustrative photograph",
};

export type Kit = { name: string; text: string; image: string; imageAlt: string };

/* Source: previous site, divisions/schools.html, "Hands-On Learning Kits"
   (kit names and what each is for; its project counts were left out), and
   this site's wording "tools that make it possible to continue the work
   beyond the lab". */
export const kitsIntro = {
  label: "Innovation kits",
  title: "The work continues",
  titleAccent: "beyond the lab.",
  body: "Students get access to hands-on kits: robotics kits, coding kits, electronics modules and drone technology kits. They make it possible to keep building after the lab session ends.",
  note: "Kit contents are tailored by grade and shared on request.",
  cta: { label: "Ask about kits for your grades", href: "/contact" },
  image: "/images/schools/drone-electronics.jpeg",
  imageAlt:
    "A young woman in safety glasses examining a small robotic assembly at an electronics bench, with a small drone in the foreground",
  imageCaption: "At the electronics bench",
  imageNote: "Illustrative photograph",
};

export const kits: Kit[] = [
  {
    name: "Robotics learning kit",
    text: "Build and program a robot using motors, sensors and a microcontroller.",
    image: "/images/schools/robotics-build.webp",
    imageAlt: "Pupils working together with robotics components",
  },
  {
    name: "Coding & electronics kit",
    text: "Work from a first LED to complete circuits, writing the code that drives them.",
    image: "/images/schools/computer-lab.webp",
    imageAlt: "Pupils using computers in a classroom",
  },
  {
    name: "Drone exploration kit",
    text: "Assemble, calibrate and fly a drone, and learn about aerodynamics, control and navigation.",
    image: "/images/schools/drone-flight.webp",
    imageAlt: "A small drone in flight",
  },
  {
    name: "Innovation project kit",
    text: "Electronics components and open-ended project challenges for a student's own idea.",
    image: "/images/schools/mentor-project.webp",
    imageAlt: "A mentor helps a pupil with a 3D printing project",
  },
];

export type JourneyStage = {
  id: string;
  title: string;
  /** What happens to the student at this stage. */
  happens: string;
  /** Real TechM4Schools elements that support the stage. */
  support: string[];
};

/* Source: the six stages and their order come from the page brief. Each
   "support" entry is an element that exists elsewhere on this page or in this
   site's published programme list (Technology exploration workshops, Future
   technology awareness, Innovation learning programs, Summer innovation camps,
   Student project development, National innovation challenges). */
export const journeyIntro = {
  label: "The student journey",
  title: "Six stages, from first spark to",
  titleAccent: "first responsibility.",
  lede: "No student moves through this at the same speed, and some stages are revisited many times. What stays constant is that each stage has something real behind it.",
  supportLabel: "Supported by",
  rolesLabel: "Where it can lead",
  rolesNote: "Directions a student can grow toward, not promised outcomes.",
};

export const journey: JourneyStage[] = [
  {
    id: "discover",
    title: "Discovering technology",
    happens:
      "A student meets a robot, a drone or a first line of code, and finds that technology is something they can work with, not only watch.",
    support: ["Technology exploration workshops", "Future technology awareness", "The five labs"],
  },
  {
    id: "learn",
    title: "Learning through structured programmes",
    happens:
      "Curiosity becomes routine. Modules run inside the school timetable, so skills are practised regularly instead of once.",
    support: ["Innovation learning programs", "Curriculum-integrated modules", "Coding and AI labs"],
  },
  {
    id: "build",
    title: "Building projects and practical skills",
    happens:
      "The student builds things that have to work: a circuit, a program, a robot. Mistakes become part of the method.",
    support: ["Student project development", "Robotics and drone labs", "Innovation kits", "Summer innovation camps"],
  },
  {
    id: "mentor",
    title: "Receiving mentorship",
    happens:
      "A mentor looks at the work, asks harder questions and helps the student connect what they enjoy to what they could study next.",
    support: ["TechM4India mentors", "CareerBuddy guidance"],
  },
  {
    id: "innovate",
    title: "Creating innovations",
    happens:
      "The student stops following instructions and starts with a problem of their own, then prototypes an answer and puts it in front of others.",
    support: ["Innovate Bharath", "National innovation challenges", "Innovation & maker education lab"],
  },
  {
    id: "progress",
    title: "Progressing toward a role",
    happens:
      "With skills, finished projects and a clearer sense of direction, a student can begin to see the kind of role they want to grow into.",
    support: ["CareerBuddy career roadmaps", "Subject mapping"],
  },
];

/* Source: page brief ("leader, innovator, entrepreneur, developer, etc.")
   and the previous site's "innovators, researchers, and founders". */
export const outcomeRoles: string[] = ["Innovator", "Developer", "Entrepreneur", "Leader", "Researcher"];

export type Pillar = { title: string; text: string };

/* Source: the four pillars as published on this site's previous /schools
   page, with detail from the previous site's "Four Pillars" section (its
   activity, module and tool counts were left out). */
export const partnershipIntro = {
  label: "Working with schools",
  title: "A partnership that stays after",
  titleAccent: "launch day.",
  lede: "TechM4Schools works with school leadership from the first conversation to the daily rhythm of the programme. Four pillars describe what a partner school receives.",
};

export const pillars: Pillar[] = [
  {
    title: "Skill-based curriculum",
    text: "Hands-on activities and STEM modules designed with an interdisciplinary approach, so students build a usable language for the technologies around them.",
  },
  {
    title: "Experiential learning",
    text: "Students learn by doing: practical activities, collaborative projects, innovation challenges and experiments. A brief, a kit, a team and a prototype.",
  },
  {
    title: "Composite skill laboratories",
    text: "A dedicated space where coding, robotics, drones, AI and making sit beside one another.",
  },
  {
    title: "End-to-end implementation",
    text: "A partner for school leadership from first conversation to daily programme rhythm, including the support listed alongside.",
  },
];

/* Source: previous site, "End-to-End Implementation Support". */
export const implementation = {
  title: "Implementation support",
  items: [
    "Learning management system",
    "Student workbooks",
    "Teacher resources",
    "A dedicated relationship manager",
    "Ongoing lab maintenance",
  ],
  image: "/images/editorial/workshop-pair.jpeg",
  imageAlt:
    "A TechM4India mentor in conversation with two students wearing ID lanyards, in front of a wall mural that reads Experiment",
  imageCaption: "Mentor and students, between sessions",
  imageNote: "TechM4India session",
};

/* Source: NEP 2020 wording already published on this site's home page. */
export const nep = {
  label: "NEP 2020 alignment",
  text: "Curriculum and credit pathways can meet institutions where they are.",
};

export type ValidationEntry = {
  /** Name as supplied by the client, with the abbreviation it used. */
  name: string;
  /** Client-approved wording for the relationship. Shown only when confirmed. */
  detail: string;
  /** Set to true only when TechM4India confirms the wording and its basis. */
  confirmed: boolean;
  /** Official logo, from the organisation's own website. */
  logo?: { src: string; alt: string; width: number; height: number; shape: "wide" | "emblem" };
};

/**
 * Source: the client's brief ("Validation by AU, NIT's, Nassam"), published
 * at the client's instruction. "AU" is read as Anurag University: the previous
 * site names it as TechM4Schools' "Primary Academic Approval & Lab Support
 * Partner", and its Dean of Academics is one of the four leads. "Nassam" is
 * read as NASSCOM. Logos are each organisation's own file (anurag.edu.in,
 * nitw.ac.in, nasscom.in), downloaded with the user's approval on 2026-10-11.
 * For "NITs" the user chose NIT Warangal's emblem. Set `confirmed` to false to
 * hide a row.
 */
export const validationLedger: ValidationEntry[] = [
  {
    name: "Anurag University (AU)",
    detail: "Academic approval and lab support for TechM4Schools",
    confirmed: true,
    logo: { src: "/images/partners/anurag-university.webp", alt: "Anurag University logo", width: 352, height: 76, shape: "wide" },
  },
  {
    name: "National Institutes of Technology (NITs)",
    detail: "Academic validation of the TechM4Schools programme",
    confirmed: true,
    logo: { src: "/images/partners/nit-warangal.webp", alt: "National Institute of Technology Warangal emblem", width: 170, height: 172, shape: "emblem" },
  },
  {
    name: "NASSCOM",
    detail: "Industry validation of the TechM4Schools programme",
    confirmed: true,
    logo: { src: "/images/partners/nasscom.svg", alt: "NASSCOM logo", width: 1000, height: 168, shape: "wide" },
  },
];

export const validation = {
  title: "Validated by",
  /** Shown above confirmed entries. */
  intro: "Academic institutions and an industry body that have validated TechM4Schools. Schools can ask for references before they commit.",
  /** Shown when no entry is confirmed yet: a process, not a claim. */
  pending:
    "Before committing, a school can ask for references and a walk-through of the programme with the team that would run it.",
  cta: { label: "Ask for references", href: "/contact#contact-form" },
};

/* Source: programme team published on this site (lib/content/home.ts, leads). */
export const teamIntro = {
  label: "Programme team",
  title: "The people attached to the programme",
};

export type AudiencePath = {
  audience: string;
  title: string;
  text: string;
  action: string;
  href: string;
};

/* Source: working routes on this site and contact details in
   lib/site-data.ts. No other destinations exist. */
export const closing = {
  label: "Next step",
  title: "Wherever you stand, there is",
  titleAccent: "a way in.",
  lede: "Five kinds of people read this page. Each has a direct route to the team.",
};

export const audiences: AudiencePath[] = [
  {
    audience: "Students",
    title: "Want this at your school?",
    text: "Show this page to a teacher or your principal, or write to us with your question.",
    action: "Contact the team",
    href: "/contact",
  },
  {
    audience: "Parents",
    title: "A quick question first",
    text: "Ask what a programme involves for your child's grade before raising it with the school.",
    action: "Message us on WhatsApp",
    href: contact.whatsapp,
  },
  {
    audience: "Schools",
    title: "Plan a programme for your campus",
    text: "Tell us about your school, your grades and the space you have, so the conversation starts from your context.",
    action: "Open the enquiry form",
    href: "/contact#contact-form",
  },
  {
    audience: "Educators",
    title: "Teach with the labs and kits",
    text: "Ask about teacher resources, workbooks and how the modules fit your timetable.",
    action: "Contact the team",
    href: "/contact",
  },
  {
    audience: "Institutional partners",
    title: "Work with TechM4Schools",
    text: "For institutions and organisations that want to support or extend school innovation.",
    action: contact.partnerships,
    href: contact.partnershipsHref,
  },
];

/* -------------------------------------------------------------------------- */
/* The transformation                                                         */
/* -------------------------------------------------------------------------- */

export type Shift = { aspect: string; before: string; after: string };

/**
 * Source: the previous site's "TechM4 Transformation" card (Traditional:
 * "Theory-focused. Passive." to Innovation-led: "Maker-focused. Creative."),
 * its problem statement ("primarily theoretical education ... reduced
 * problem-solving abilities, limited technical confidence, and uncertainty
 * about future career paths") and its four-step "TechM4 Effect". These are
 * the shifts the programme is designed to create, not measured results.
 */
export const transformation = {
  label: "The transformation",
  title: "The same student,",
  titleAccent: "a different way of learning.",
  lede: "TechM4Schools exists because many students meet technology only in a textbook. The programme is designed to move them from reading about it to building with it.",
  beforeLabel: "Before",
  afterLabel: "With TechM4Schools",
  shifts: [
    { aspect: "How they learn", before: "Theory-focused", after: "Maker-focused" },
    { aspect: "Their role in class", before: "Listening", after: "Building, testing and presenting" },
    { aspect: "Technology", before: "Something to read about", after: "Robots, code and drones they work with" },
    { aspect: "Mistakes", before: "Something to avoid", after: "Part of the method" },
    { aspect: "Confidence", before: "Unsure they can build anything", after: "\"I can do this\"" },
    { aspect: "Careers", before: "Uncertain", after: "Mapped with CareerBuddy" },
  ] satisfies Shift[],
  image: "/images/schools/school-library-learning.webp",
  imageAlt: "Three school students reading together at a library table",
  imageCaption: "From the textbook to the lab",
  imageNote: "Illustrative school photograph",
};

/* -------------------------------------------------------------------------- */
/* Programmes and outcomes                                                    */
/* -------------------------------------------------------------------------- */

export type Programme = { name: string; rhythm: string; text: string };

/* Source: previous site divisions/schools.html, the six student programmes
   and their tags. Unevidenced extras ("spots fill up instantly", "showcased
   at national expos", scholarships) were left out. */
export const programmesIntro = {
  label: "Student programmes",
  title: "Six programmes,",
  titleAccent: "one rhythm across the year.",
  lede: "Workshops, competitions, camps and projects designed to build creativity, collaboration and critical thinking in every student.",
};

export const programmes: Programme[] = [
  {
    name: "Innovation learning programmes",
    rhythm: "Year-round",
    text: "Students tackle real-world challenges with technology, from solving a local problem to pitching a startup idea.",
  },
  {
    name: "Technology exploration workshops",
    rhythm: "Monthly",
    text: "Hands-on workshops on a new technology each month: AR/VR one month, quantum computing basics the next, then blockchain.",
  },
  {
    name: "Future technology awareness",
    rhythm: "Awareness series",
    text: "What is coming in AI, space technology and bioengineering, and how a student can be part of it.",
  },
  {
    name: "Summer innovation camps",
    rhythm: "Seasonal, three weeks",
    text: "Daily challenges, team competitions, hackathons, drone racing and robot battles.",
  },
  {
    name: "Student project development",
    rhythm: "Project-based",
    text: "Every student builds something real: an app, a robot or a working prototype, mentored by industry professionals.",
  },
  {
    name: "National innovation challenges",
    rhythm: "Competition",
    text: "Students take their work to state and national innovation competitions.",
  },
];

export type Outcome = { title: string; text: string };

/* Source: the previous site's stated aims (critical thinking, creativity,
   problem-solving) and the gaps it set out to close (problem-solving,
   technical confidence, career clarity). */
export const outcomesIntro = {
  label: "Outcomes the programme builds",
  note: "What each programme is designed to develop in a student.",
};

export const outcomes: Outcome[] = [
  { title: "Problem-solving", text: "Breaking a real problem down and working it through to an answer that works." },
  { title: "Technical confidence", text: "The belief, earned at the bench, that they can build with technology." },
  { title: "Critical thinking", text: "Asking why a design works, testing it and improving it." },
  { title: "Creativity", text: "Turning their own ideas into prototypes other people can use." },
  { title: "Collaboration", text: "Building in teams, sharing roles and presenting together." },
  { title: "Career clarity", text: "A clearer view of strengths, subjects and possible careers through CareerBuddy." },
];

/* -------------------------------------------------------------------------- */
/* The mind map                                                               */
/* -------------------------------------------------------------------------- */

export type MapBranch = {
  id: string;
  image: string;
  imageAlt: string;
  /** What TechM4Schools gives the student on this branch. */
  branch: string;
  branchDetail: string;
  /** Who the student can grow into along it. */
  outcome: string;
  /** How a student travels this branch, in three short steps. */
  path: string[];
};

/**
 * Source: the page brief ("a normal student joins techm4india, he starts his
 * journey under the mentorship of techm4india, excels in his field, and turns
 * into a leader, innovator, entrepreneur, developer, etc."). Every step names
 * something that exists on this page. Directions, not promised outcomes.
 */
export const mindMap = {
  label: "Where it can lead",
  title: "One student.",
  titleAccent: "Five directions.",
  lede: "Every student starts in the same place. Choose a direction to see how TechM4Schools can take a student there.",
  center: "A student joins TechM4Schools",
  note: "Directions a student can grow toward, not promised outcomes.",
  cta: { label: "Start the journey at your school", href: "/contact#contact-form" },
  branches: [
    {
      id: "developer",
      image: "/images/schools/coding-class.webp",
      imageAlt: "Pupils collaborating at a computer",
      branch: "Labs and kits",
      branchDetail: "Coding, robotics and AI labs",
      outcome: "Developer",
      path: [
        "Writes a first program in the coding and programming lab.",
        "Builds apps and games in Python and JavaScript, and programs a robot.",
        "Ships a project of their own in student project development.",
      ],
    },
    {
      id: "innovator",
      image: "/images/schools/maker-printer.webp",
      imageAlt: "Pupils observing a 3D printer",
      branch: "Projects and challenges",
      branchDetail: "Maker lab and competitions",
      outcome: "Innovator",
      path: [
        "Spots a real problem in the innovation and maker education lab.",
        "Prototypes an answer with an innovation project kit.",
        "Takes it to national innovation challenges.",
      ],
    },
    {
      id: "entrepreneur",
      image: "/images/schools/student-presentation.webp",
      imageAlt: "Pupils presenting a project to their class",
      branch: "Ideas and funding",
      branchDetail: "Innovate Bharath",
      outcome: "Entrepreneur",
      path: [
        "Pitches a startup idea in the innovation learning programmes.",
        "Puts it forward to Innovate Bharath.",
        "The strongest ideas are selected and funded.",
      ],
    },
    {
      id: "leader",
      image: "/images/schools/mentor-project.webp",
      imageAlt: "An adult mentoring a pupil on a technology project",
      branch: "Mentorship",
      branchDetail: "TechM4India mentors and CareerBuddy",
      outcome: "Leader",
      path: [
        "Works with TechM4India mentors who ask harder questions.",
        "Leads a team through a summer innovation camp or a project.",
        "Maps the road ahead with CareerBuddy career roadmaps.",
      ],
    },
    {
      id: "researcher",
      image: "/images/schools/science-experiment.webp",
      imageAlt: "Pupils exploring an experiment in a classroom",
      branch: "Exploration",
      branchDetail: "Workshops and awareness series",
      outcome: "Researcher",
      path: [
        "Meets a new technology every month in exploration workshops.",
        "Follows AI, space and bioengineering in the awareness series.",
        "Carries the question on to college with TechM4Engineering and TechM4Institutes.",
      ],
    },
  ] satisfies MapBranch[],
};
