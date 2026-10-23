/**
 * TechM4Engineering content.
 *
 * Sources:
 * - The previous TechM4India website (github.com/techm4india/riyaznew,
 *   divisions/engineering.html): disciplines, tools, the five-phase path, the
 *   lab vision, the semester programmes and the outcomes.
 * - TechM4India's own photographs of its 2026 campus recruitment drive at
 *   Vishwa Vishwani (shared by the client on Google Drive).
 * - Photographs from anurag.edu.in and gitam.edu, chosen by the client as
 *   image references for this division.
 *
 * Old-site figures that nothing else supports ("500+ engineers trained",
 * "50+ institute partners") are left out. Every count shown on the page is
 * derived from the catalogue in engineering-programmes.ts.
 */

import { programmes } from "./engineering-programmes";

export type TrackId = "civil" | "mech" | "cse" | "eee" | "ece" | "comm" | "chem";

export type Track = {
  id: TrackId;
  name: string;
  short: string;
  text: string;
  tools: string[];
  image: string;
  imageAlt: string;
  /** Focal point for object-position, so crops keep the subject. */
  focus?: string;
};

export const tracks: Track[] = [
  {
    id: "civil",
    name: "Civil Engineering",
    short: "Civil",
    text: "Structural design, BIM modelling and the digital construction workflows used by India's infrastructure firms.",
    tools: ["Revit", "STAAD Pro", "ETABS", "AutoCAD", "Civil 3D"],
    image: "/images/engineering/civil-site.webp",
    imageAlt: "Two engineers discussing plans at an active construction site",
    focus: "53% 50%",
  },
  {
    id: "mech",
    name: "Mechanical Engineering",
    short: "Mechanical",
    text: "FEA, simulation, product design and the manufacturing tools used across aerospace and automotive work.",
    tools: ["ANSYS", "HyperMesh", "SolidWorks", "HAANS Mech"],
    image: "/images/engineering/track-mechanical.webp",
    imageAlt: "Students examining a large axial fan rig in a mechanical engineering lab",
    focus: "62% 50%",
  },
  {
    id: "cse",
    name: "Computer Science",
    short: "CSE",
    text: "Full-stack development with DevOps, cloud architecture and modern AI and machine-learning pipelines.",
    tools: ["React", "Node.js", "AWS", "Docker", "Python"],
    image: "/images/engineering/software-engineer.webp",
    imageAlt: "Software engineer writing code at a workstation",
    focus: "58% 50%",
  },
  {
    id: "eee",
    name: "Electrical Engineering",
    short: "Electrical",
    text: "Electric-vehicle powertrains, battery management systems, smart grids and renewable energy.",
    tools: ["MATLAB", "Simulink", "Ansys Maxwell", "ETAP"],
    image: "/images/engineering/hero.jpeg",
    imageAlt: "An engineer adjusting industrial equipment in a laboratory",
    focus: "45% 40%",
  },
  {
    id: "ece",
    name: "Electronics Engineering",
    short: "Electronics",
    text: "VLSI digital design, FPGA architectures and microelectronic circuit modelling.",
    tools: ["Verilog", "Vivado", "Cadence", "Altium"],
    image: "/images/engineering/electronics-workbench.webp",
    imageAlt: "Engineer soldering electronic components at a workbench",
    focus: "50% 45%",
  },
  {
    id: "comm",
    name: "Communication Engineering",
    short: "Communication",
    text: "Embedded firmware, IoT networks and real-time communication systems.",
    tools: ["C/C++", "FreeRTOS", "RTOS", "IoT protocols"],
    image: "/images/engineering/electronics-board.webp",
    imageAlt: "Hands examining a printed circuit board",
    focus: "50% 50%",
  },
  {
    id: "chem",
    name: "Chemical Engineering",
    short: "Chemical",
    text: "Process simulation in Aspen HYSYS, piping layouts and industrial water-treatment design.",
    tools: ["Aspen Plus", "Aspen HYSYS", "Plant 3D", "GPS-X"],
    image: "/images/engineering/chemical-lab.webp",
    imageAlt: "Researcher testing materials in a laboratory",
    focus: "40% 40%",
  },
];

export const trackById = Object.fromEntries(tracks.map((track) => [track.id, track])) as Record<TrackId, Track>;

/** Programme totals per discipline. Kept here so server components never call a client module. */
export const programmeCounts = Object.fromEntries(
  tracks.map((track) => [track.id, programmes.filter((programme) => programme.track === track.id).length]),
) as Record<TrackId, number>;

export const hero = {
  eyebrow: "TechM4Engineering",
  title: "Engineering India's industrial future",
  titleAccent: "through hands-on innovation.",
  /** The same headline as lines, for the line-by-line reveal. Keep "industrial future" on one line. */
  titleLines: ["Engineering India's", "industrial future"],
  accentLines: ["through hands-on", "innovation."],
  lead: "Learn Revit, ANSYS, VLSI, EV powertrains, full-stack DevOps, Aspen Plus and more through real projects, structured mentorship and lab programmes that run inside your institution.",
  image: "/images/engineering/hero-workshop.webp",
  imageAlt: "A student grinding metal in an engineering workshop, sparks flying",
};

const durations = [...new Set(programmes.map((p) => p.duration))].sort((a, b) => parseInt(a) - parseInt(b));
const credits = programmes.map((p) => parseInt(p.credits));

/** Every figure here is counted from the catalogue, so it cannot drift from it. */
export const glance = {
  disciplines: tracks.length,
  programmes: programmes.length,
  durations,
  creditRange: [Math.min(...credits), Math.max(...credits)] as const,
  sessionsRange: [
    Math.min(...programmes.map((p) => parseInt(p.sessions))),
    Math.max(...programmes.map((p) => parseInt(p.sessions))),
  ] as const,
};

export const path = [
  {
    code: "P1",
    stage: "Foundation",
    name: "Learn",
    text: "Master the fundamentals: engineering theory, software basics, industry standards and good practice.",
    example: "Interfaces, drawing standards and BIS codes before the first project brief.",
    image: "/images/engineering/path-learn.webp",
    imageAlt: "A mentor presenting to a class of engineering students",
  },
  {
    code: "P2",
    stage: "Application",
    name: "Design",
    text: "Apply the tools to real-world work: architectural layouts, structural models, mechanical assemblies.",
    example: "A five-storey RC framed building modelled in Revit from architectural inputs.",
    image: "/images/engineering/civil-plan.webp",
    imageAlt: "Engineers reviewing a detailed construction plan",
  },
  {
    code: "P3",
    stage: "Simulation",
    name: "Analyze",
    text: "Run simulations, structural analysis and FEA workflows, and check each design against industry codes.",
    example: "Seismic analysis of a G+10 structure for IS 1893 compliance.",
    image: "/images/engineering/path-analyze.webp",
    imageAlt: "Students operating machines in an engineering innovation lab",
  },
  {
    code: "P4",
    stage: "Project lab",
    name: "Build",
    text: "Deliver a capstone: complete deliverables, documentation and portfolio-grade outputs.",
    example: "A full project package: model, analysis, drawings and report.",
    image: "/images/engineering/path-build.webp",
    imageAlt: "A mentor guiding students as they build an electronics and robotics project",
  },
  {
    code: "P5",
    stage: "Industry ready",
    name: "Implement",
    text: "Present to industry, prepare for placements and internships, and earn your certification.",
    example: "Portfolio presentation, interview preparation and referrals.",
    image: "/images/engineering/path-implement.webp",
    imageAlt: "Students in business suits standing together, ready for interviews",
  },
];

/** Tool groups from the previous site, plus Communication from that catalogue (FreeRTOS, ESP32, MQTT, NS-3). */
export const toolGroups: { id: TrackId | "shared"; label: string; tools: string[] }[] = [
  { id: "shared", label: "Civil and Mechanical", tools: ["Revit", "STAAD Pro", "MATLAB"] },
  { id: "civil", label: "Civil", tools: ["ETABS", "AutoCAD", "Civil 3D", "BIM 360"] },
  { id: "mech", label: "Mechanical", tools: ["ANSYS", "HyperMesh", "HAANS Mech", "SolidWorks", "ANSYS Fluent", "Mastercam"] },
  { id: "cse", label: "Computer Science", tools: ["React & Node", "AWS Cloud", "TensorFlow", "Kali Linux"] },
  { id: "eee", label: "Electrical", tools: ["Altium Designer", "Siemens TIA", "PVSyst"] },
  { id: "ece", label: "Electronics", tools: ["Xilinx Vivado", "Embedded C"] },
  { id: "comm", label: "Communication", tools: ["FreeRTOS", "ESP32", "MQTT", "NS-3"] },
  { id: "chem", label: "Chemical", tools: ["Aspen Plus", "Aspen HYSYS"] },
];

export const toolCount = toolGroups.reduce((sum, group) => sum + group.tools.length, 0);

export const labVision = {
  title: "Engineering labs inside every institution",
  text: "TechM4Engineering's vision is to build industry-standard engineering labs inside colleges and universities across India, so students use professional tools on their own campus.",
  items: [
    {
      title: "Institute-embedded labs",
      text: "Revit, STAAD Pro and ANSYS workstation labs set up inside engineering colleges, with daily access for students.",
      tag: "MoU partnership model",
    },
    {
      title: "Credit-based integration",
      text: "Programmes designed to be recognised as academic credit, bridging industry training and the university curriculum.",
      tag: "University credit ready",
    },
    {
      title: "Industry mentor faculty",
      text: "Practitioners join as guest faculty and bring current project experience and workflows into the classroom.",
      tag: "Expert-led training",
    },
    {
      title: "Live project studios",
      text: "Studios where students work on real engineering assignments and build portfolios with real deliverables.",
      tag: "Real projects",
    },
    {
      title: "Innovation and R&D cells",
      text: "Spaces for student-led research, prototyping and applied engineering, backed by TechM4India's technical team.",
      tag: "Research enabled",
    },
    {
      title: "Placement ecosystem",
      text: "Pipelines to consultancies, construction firms, manufacturers and infrastructure companies for internships and jobs.",
      tag: "Industry connected",
    },
  ],
  images: [
    { src: "/images/engineering/lab-computer.webp", alt: "A computer lab with rows of workstations" },
    { src: "/images/engineering/lab-mentor.webp", alt: "A faculty mentor talking with a group of students" },
    { src: "/images/engineering/lab-rnd.webp", alt: "Students and a mentor with rocket models built in a student project" },
    { src: "/images/engineering/lab-wet.webp", alt: "Students at work in a chemistry laboratory" },
  ],
};

export const semesterProgrammes = [
  {
    kicker: "Semester I",
    title: "Engineering foundations and digital tools",
    text: "An introduction to industry software: CAD basics, BIM fundamentals, drawing standards and engineering documentation.",
    items: [
      "AutoCAD 2D/3D: drafting and documentation",
      "Revit fundamentals: architectural modelling",
      "Engineering drawing standards and BIS codes",
      "Industry workflow introduction and project brief",
      "Capstone: a complete building layout drawing set",
    ],
  },
  {
    kicker: "Semester II",
    title: "Structural analysis and simulation",
    text: "From modelling to analysis to design verification with STAAD Pro, ETABS and ANSYS.",
    items: [
      "STAAD Pro: multi-storey structural modelling",
      "ETABS: seismic analysis and design",
      "ANSYS: FEA simulation fundamentals",
      "Load combinations and IS code compliance",
      "Capstone: a complete structural analysis report",
    ],
  },
  {
    kicker: "Advanced",
    title: "Advanced simulation and BIM workflows",
    text: "HyperMesh meshing, BIM coordination, clash detection and construction documentation.",
    items: [
      "HyperMesh: advanced FE mesh generation",
      "Revit advanced: MEP and structural coordination",
      "BIM 360: cloud collaboration workflows",
      "Clash detection and model coordination",
      "Capstone: full BIM project delivery",
    ],
  },
  {
    kicker: "Industry partnership",
    title: "MoU-based institute programmes",
    text: "Programmes built with a university, integrated into its curriculum with faculty co-training, lab setup and student certification.",
    items: [
      "Custom curriculum aligned to the university syllabus",
      "Faculty Development Programme (FDP) included",
      "Software lab setup support and licensing",
      "Certification for students",
      "Placement support for graduates",
    ],
  },
];

export const campusDrive = {
  title: "On campus with TechM4India",
  text: "TechM4India takes its hiring to campus. At Vishwa Vishwani the team introduced the company and the roles on offer, then held a written assessment in the hall.",
  photos: [
    {
      src: "/images/engineering/drive-team.webp",
      alt: "The TechM4India team with students beside a 'Launch your career' on-campus drive standee in a seminar hall",
      caption: "The TechM4India team at the drive",
    },
    {
      src: "/images/engineering/drive-speaker.webp",
      alt: "A TechM4India speaker addressing students from the Vishwa Vishwani podium",
      caption: "Opening address",
    },
    {
      src: "/images/engineering/drive-recruitment.webp",
      alt: "Students watching a 'Campus Recruitment Drive 2026' presentation",
      caption: "Campus Recruitment Drive 2026",
    },
    {
      src: "/images/engineering/drive-briefing.webp",
      alt: "Students in a seminar hall during an 'About TechM4India' presentation",
      caption: "About TechM4India",
    },
    {
      src: "/images/engineering/drive-assessment.webp",
      alt: "Students writing the assessment at long desks in an exam hall",
      caption: "The written assessment",
    },
    {
      src: "/images/engineering/drive-assessment-rows.webp",
      alt: "Invigilators walking the rows as students write the assessment",
      caption: "Assessment in progress",
    },
  ],
};

export const gains = {
  image: "/images/engineering/gain-interview.webp",
  imageAlt: "A student in a one-to-one interview with a faculty member",
  items: [
    {
      title: "An industry-standard portfolio",
      text: "Structural drawings, analysis reports, BIM models and simulation results that show what you can do.",
    },
    {
      title: "Multi-software proficiency",
      text: "Workflow-level skill across several industry tools, beyond a basic introduction.",
    },
    {
      title: "Professional certification",
      text: "A TechM4India certificate for every programme you complete.",
    },
    {
      title: "Placement readiness",
      text: "Resume building, interview preparation and referrals to engineering consultancies, EPC companies and manufacturers.",
    },
  ],
};

export const faqs = [
  {
    q: "How long is a programme?",
    a: `Programmes run for ${durations.join(", ").replace(/, ([^,]*)$/, " or $1").toLowerCase()}, between ${glance.sessionsRange[0]} and ${glance.sessionsRange[1]} sessions, and each ends with a capstone project.`,
  },
  {
    q: "Do the programmes carry academic credit?",
    a: `Each programme is designed for ${glance.creditRange[0]}–${glance.creditRange[1]} credits and to sit inside a university's academic calendar, so it can run alongside B.Tech and M.Tech curricula.`,
  },
  {
    q: "Can our college host a TechM4Engineering lab?",
    a: "Yes. Under an MoU we align the curriculum to your syllabus, support the software lab setup and licensing, co-train your faculty through an FDP and certify your students.",
  },
  {
    q: "Which disciplines do you cover?",
    a: `${tracks.length} disciplines: ${tracks.map((t) => t.short).join(", ")}. Each has its own programmes, tools and capstones.`,
  },
  {
    q: "Is the learning project-based?",
    a: "Every programme follows the same path: learn, design, analyze, build and implement. Students finish with real deliverables such as drawings, analysis reports, models and working code.",
  },
];

export const enquiryInterests = tracks.map((track) => track.name).concat(["Institute lab (MoU)", "Faculty development (FDP)"]);

export const cta = {
  image: "/images/engineering/cta-campus.webp",
  imageAlt: "An aerial view of a university campus surrounded by green fields",
};
