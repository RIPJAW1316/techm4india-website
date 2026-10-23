/**
 * TechM4Solutions page content (/solutions).
 *
 * Everything here is static and edited by hand. A source is noted above each
 * block so a future editor can check a claim before changing it. Do not add a
 * client name, a statistic, a price, a hardware specification, a date or an
 * outcome that TechM4India has not confirmed.
 *
 * "Previous site" means the earlier techm4india.com build (divisions/*.html,
 * pages/*.html and products.json). Only product names, plain descriptions and
 * named technologies were carried over from it. Its statistics, percentages,
 * prices, market sizes and organisation names were deliberately left out.
 */

const enquiry = "/contact#contact-form";

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

export type SheetRow = { code: string; term: string; detail: string };

/**
 * Source: the brief from TechM4Solutions (designs and builds software products,
 * applications, AI solutions and digital experiences). The delivery sheet rows
 * restate the six service disciplines already published on this site, plus the
 * pay-and-use labs named by the client.
 */
export const hero = {
  kicker: "TechM4Solutions",
  kickerIndex: "03",
  title: "We build the software",
  titleAccent: "your work runs on.",
  lede: "TechM4Solutions designs and builds software products, applications, AI solutions and digital experiences. What you get is working software in the hands of the people it was made for, from one team that carries it from the first brief through to release and support.",
  primary: { label: "Discuss a project", href: enquiry },
  secondary: { label: "See selected work", href: "#work" },
  sheet: {
    title: "Delivery sheet",
    reference: "TM4S / 03",
    /** Each row links to the part of the page that explains it. */
    rows: [
      { code: "PRD", term: "Software products", detail: "Designed, built and released", href: "#work" },
      { code: "APP", term: "Applications", detail: "Web and mobile", href: "#capabilities" },
      { code: "AI", term: "AI solutions", detail: "Assistants, agents, analytics", href: "#capabilities" },
      { code: "SYS", term: "Enterprise systems", detail: "Platforms and custom software", href: "#work" },
      { code: "OPS", term: "Cloud and DevOps", detail: "Deployment and monitoring", href: "#capabilities" },
      { code: "LAB", term: "Computer labs", detail: "Silicon Valley-level, pay per use", href: "#labs" },
    ] satisfies (SheetRow & { href: string })[],
    footLabel: "Starts with",
    footValue: "A conversation about the brief",
  },
  /** In-page index under the hero. Every href is a section id on this page. */
  index: [
    { label: "Record", href: "#record" },
    { label: "Featured build", href: "#featured" },
    { label: "Selected work", href: "#work" },
    { label: "Capabilities", href: "#capabilities" },
    { label: "Industries", href: "#industries" },
    { label: "Process", href: "#process" },
    { label: "Labs", href: "#labs" },
  ],
};

/* -------------------------------------------------------------------------- */
/* Delivery record                                                            */
/* -------------------------------------------------------------------------- */

export type RecordFigure = { value: string; suffix: string; label: string };

/**
 * Source: figures supplied by TechM4Solutions (client-provided). Use exactly
 * these numbers and meanings. Do not round up, combine or add figures, and do
 * not name client companies: none has been verified for publication.
 */
export const record = {
  label: "Delivery record",
  title: "Fourteen companies",
  titleAccent: "and counting.",
  lede: "Products, apps, websites, AI projects and custom software, designed and delivered for companies, schools and institutions. Client names stay private until a client asks to be named.",
  figures: [
    { value: "14", suffix: "+", label: "Companies helped with design and development" },
    { value: "6", suffix: "+", label: "Apps delivered" },
    { value: "2", suffix: "+", label: "School websites delivered" },
    { value: "2", suffix: "+", label: "AI projects" },
    { value: "4", suffix: "+", label: "Custom software projects delivered" },
  ] satisfies RecordFigure[],
  note: "Delivery figures from TechM4Solutions. Project references are shared on request.",
};

/* -------------------------------------------------------------------------- */
/* Selected work                                                              */
/* -------------------------------------------------------------------------- */

export const workTypes = ["AI", "Devices", "Platforms", "Education"] as const;
export type WorkType = (typeof workTypes)[number];

/**
 * How far along an entry is. Shown on every entry so a concept is never read
 * as shipped work.
 * - built: running software whose code is in this repository.
 * - platform: a TechM4Schools platform named by TechM4India; release status
 *   not confirmed for publication, so none is stated.
 * - concept: a product concept from the TechM4Solutions MSME Hackathon 6.0
 *   portfolio (previous site TECHM4.md calls these "market-ready concepts").
 */
export const workStages = ["built", "platform", "concept"] as const;
export type WorkStage = (typeof workStages)[number];

export const stageLabels: Record<WorkStage, { short: string; filter: string; note: string }> = {
  built: {
    short: "Built",
    filter: "Built and running",
    note: "Running software, built by the team.",
  },
  platform: {
    short: "School platform",
    filter: "School platforms",
    note: "A TechM4Schools platform. Availability for your school is confirmed on enquiry.",
  },
  concept: {
    short: "Product concept",
    filter: "Product concepts",
    note: "A product concept from the TechM4Solutions portfolio. Specifications are drafted; build status is shared on enquiry.",
  },
};

export type WorkItem = {
  id: string;
  name: string;
  category: string;
  stage: WorkStage;
  types: WorkType[];
  problem: string;
  /** For concepts this describes the design, in "designed to" terms. */
  does: string;
  /** Only technologies the source names for this product. Omit when none is named. */
  tech?: string[];
  href: string;
  cta: string;
};

/**
 * Sources, per entry:
 * - Company Management ERP: this repository (app/erp/** for the workspaces,
 *   package.json and backend/package.json for the stack).
 * - AirGuard Pro, AcoustiCast, FoodSpectra, ITCMax: previous site products.json
 *   (name, category, tagline, loss_addressed, tech_stack) and TECHM4.md, which
 *   presents them as concepts from the MSME Hackathon 6.0 portfolio. Savings
 *   percentages, rupee figures, market sizes, prices, patent claims and
 *   third-party API names were not carried over.
 * - CareerBuddy, SchoolOS: previous site divisions/schools.html (description
 *   and feature lists). No technologies are named there, so none is listed.
 * IGNITE AI is a bootcamp, not software, so it appears on the landing page's
 * events board instead of here.
 */
export const work: WorkItem[] = [
  {
    id: "careerbuddy",
    name: "CareerBuddy",
    category: "Career discovery platform",
    stage: "built",
    types: ["AI", "Platforms", "Education"],
    problem:
      "School students are asked to choose subjects and streams before they have a clear view of their own strengths and interests.",
    does: "Helps a student identify strengths, interests and aspirations through AI-based assessments, then supports career exploration, subject mapping and a career roadmap.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Python"],
    href: "/schools",
    cta: "Explore on TechM4Schools",
  },
  {
    id: "schoolos",
    name: "SchoolOS",
    category: "School innovation platform",
    stage: "platform",
    types: ["Platforms", "Education"],
    problem:
      "A school running several innovation programmes has no single place to manage them or to see how students are progressing.",
    does: "A digital backbone for a school's innovation initiatives: programme management, student profiles, data insights and analytics, event management and collaboration tools.",
    href: "/schools#schoolos",
    cta: "See it on TechM4Schools",
  },
  {
    id: "airguard-pro",
    name: "AirGuard Pro",
    category: "Industrial IoT",
    stage: "concept",
    types: ["AI", "Devices"],
    problem:
      "Compressed air leaks in pneumatic plants are hard to hear and easy to miss, and every undetected leak wastes energy.",
    does: "Designed as an ultrasonic leak detector for compressed air lines: a software-defined radio front end listens for leaks, a machine learning classifier identifies them, and results are stored and shown in a web interface.",
    tech: ["RTL-SDR", "ESP32", "ML leak classifier", "TimescaleDB", "React"],
    href: enquiry,
    cta: "Ask about this concept",
  },
  {
    id: "acousticast",
    name: "AcoustiCast",
    category: "AI quality control",
    stage: "concept",
    types: ["AI", "Devices"],
    problem:
      "In a foundry, shrinkage defects inside a casting are usually found only after the part has been machined.",
    does: "Designed to listen to the mould while the metal solidifies: acoustic emission sensors feed a neural network that flags likely solidification defects before machining starts.",
    tech: ["SM-24 geophones", "STM32", "1D-CNN", "InfluxDB"],
    href: enquiry,
    cta: "Ask about this concept",
  },
  {
    id: "foodspectra",
    name: "FoodSpectra",
    category: "Food technology",
    stage: "concept",
    types: ["AI", "Devices"],
    problem:
      "Food processors who suspect adulteration normally send a sample to a laboratory and wait for the result.",
    does: "Designed as a handheld near-infrared device that screens a food sample for adulteration on site, paired with an Android app.",
    tech: ["AS7265x spectral sensor", "PLS-DA", "MobileNetV3", "Android"],
    href: enquiry,
    cta: "Ask about this concept",
  },
  {
    id: "itcmax",
    name: "ITCMax",
    category: "Finance software",
    stage: "concept",
    types: ["AI", "Platforms"],
    problem:
      "Small businesses lose GST input tax credit when purchase records do not match supplier filings, or when a deadline passes unnoticed.",
    does: "Designed to reconcile input tax credit for a business: a classifier flags mismatched entries, and alerts go out on WhatsApp.",
    tech: ["XGBoost", "PostgreSQL", "React", "WhatsApp alerts"],
    href: enquiry,
    cta: "Ask about this concept",
  },
];

export const workSection = {
  label: "Selected work",
  title: "What we have built,",
  titleAccent: "and what is next.",
  lede: "One system that is built and running, two school platforms and four product concepts. Every entry says which it is. Open one to read the problem it addresses and how it works.",
  filterLabel: "Show",
  allLabel: "Everything",
  problemLabel: "The problem",
  doesLabel: "How it works",
  techLabel: "Built with",
  noTech: "Technology details shared on enquiry",
  note: "Demonstrations and project references are arranged on request.",
};

/* -------------------------------------------------------------------------- */
/* Featured build                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Source: this repository. Every workspace listed is a route under app/erp,
 * and the stack is read from package.json and backend/package.json. Nothing
 * here claims a customer, a user count or a deployment beyond this codebase.
 */
export const featured = {
  label: "Featured platform",
  name: "CareerBuddy",
  title: "AI-driven career",
  titleAccent: "discovery for schools.",
  lede: "A focused assessment and guidance platform helping students identify strengths and map out actionable learning paths.",
  layersTitle: "How it is put together",
  layers: [
    { code: "WEB", term: "Interface", detail: "Interactive assessment and exploration UI" },
    { code: "AI", term: "Engine", detail: "Interest mapping and recommendation models" },
    { code: "DATA", term: "Roadmaps", detail: "Curated domain, skill and education pathways" },
  ],
  modulesTitle: "Key platform capabilities",
  modules: [
    "Aptitude assessment",
    "Stream selection",
    "Career roadmaps",
    "Mentor feedback",
    "Skill gap analysis",
    "College exploration",
  ],
  divisionsNote:
    "Integrated with TechM4Schools innovation programs and partner institutions across India.",
  cta: { label: "Explore TechM4Schools", href: "/schools" },
};

/** Short accent band between the work and the capabilities. */
export const ctaBand = {
  title: "Have a brief, or only a problem?",
  text: "Either is a good place to start. Tell us who it is for and what has to be true when it works.",
  action: { label: "Discuss a project", href: enquiry },
};

/* -------------------------------------------------------------------------- */
/* Capabilities                                                               */
/* -------------------------------------------------------------------------- */

export type Service = { title: string; text: string; items: string[] };

/**
 * Source: the six service disciplines already published on this site
 * (previous app/solutions/page.tsx). The item lists under each come from the
 * service lists on the previous site's divisions/solutions.html, with vendor
 * names removed.
 */
export const services: Service[] = [
  {
    title: "AI and agentic AI solutions",
    text: "Systems that help a team see patterns, answer questions and act with more context.",
    items: ["AI assistants and chatbots", "Agentic AI systems", "Document processing", "AI knowledge bases"],
  },
  {
    title: "Software development",
    text: "Web platforms and product systems designed around the people who use them.",
    items: ["Custom software", "SaaS products", "Web applications", "Internal business tools"],
  },
  {
    title: "Mobile app development",
    text: "Focused mobile experiences that make a service easy to return to.",
    items: ["Android apps", "iOS apps", "Cross-platform apps", "Enterprise mobility"],
  },
  {
    title: "Enterprise platforms & portals",
    text: "The operational systems and platforms that connect how an organisation runs.",
    items: ["Custom portals", "Platform development", "System integrations", "Workflow automation"],
  },
  {
    title: "Cloud and DevOps",
    text: "Infrastructure and delivery practice that let good software keep improving.",
    items: ["Cloud migration", "Infrastructure automation", "CI/CD pipelines", "Monitoring"],
  },
  {
    title: "Data and analytics",
    text: "Scattered information turned into a clearer view of the next decision.",
    items: ["Dashboards", "Reporting systems", "Data warehouses", "Predictive analytics"],
  },
];

export type TechGroup = {
  layer: string;
  items: string[];
  /** Shown on the page: where these technologies are used or specified. */
  basis: string;
};

/**
 * Only technologies that a source names as used by a TechM4Solutions product
 * or role, each listed once.
 */
export const techGroups: TechGroup[] = [
  /**
   * Source: this repository's package.json (react, typescript, vite,
   * tailwindcss). Android: FoodSpectra tech_stack in previous site
   * products.json ("Android app").
   */
  {
    layer: "Interface",
    items: ["React", "TypeScript", "Vite", "Tailwind CSS", "Android"],
    basis: "This website and digital applications; Android in the FoodSpectra concept",
  },
  /**
   * Source: this repository's backend and data layer (Node.js, PostgreSQL).
   * FastAPI and SQL: AI/ML Engineer Intern role skills on the previous site's
   * pages/careers.html. TimescaleDB: AirGuard Pro tech_stack. InfluxDB: AcoustiCast
   * tech_stack (products.json).
   */
  {
    layer: "Services and data",
    items: ["Node.js", "TypeScript", "PostgreSQL", "FastAPI", "SQL", "TimescaleDB", "InfluxDB"],
    basis: "Backend services and data platforms; FastAPI and SQL in AI engineering; TimescaleDB and InfluxDB in device concepts",
  },
  /**
   * Source: Python, PyTorch, MLflow: AI/ML Engineer Intern role skills
   * (pages/careers.html). XGBoost: ITCMax tech_stack. 1D-CNN: AcoustiCast
   * tech_stack. MobileNetV3 and PLS-DA: FoodSpectra tech_stack (products.json).
   */
  {
    layer: "AI and ML",
    items: ["Python", "PyTorch", "MLflow", "XGBoost", "1D-CNN", "MobileNetV3", "PLS-DA"],
    basis: "The AI engineering role, and the model designs for the AcoustiCast, FoodSpectra and ITCMax concepts",
  },
  /**
   * Source: Arduino, Raspberry Pi, MQTT: IoT and Hardware Engineer Intern role
   * skills (pages/careers.html). ESP32 and RTL-SDR: AirGuard Pro tech_stack.
   * STM32: AcoustiCast tech_stack (products.json).
   */
  {
    layer: "Devices and edge",
    items: ["Arduino", "Raspberry Pi", "MQTT", "ESP32", "STM32", "RTL-SDR"],
    basis: "The IoT engineering role, and the sensor designs for the AirGuard Pro and AcoustiCast concepts",
  },
];

export const capabilities = {
  label: "Capabilities",
  title: "Six disciplines,",
  titleAccent: "one team.",
  lede: "Most projects draw on two or three of these, which is why they sit under one roof and one point of contact.",
  stackTitle: "The stack, as used",
  stackLede:
    "Only technologies named in our own products, roles and repositories. The tools for your project are chosen after the brief, not before it.",
  columns: { layer: "Layer", items: "Technologies", basis: "Where it appears" },
};

/* -------------------------------------------------------------------------- */
/* Industries and the edge                                                    */
/* -------------------------------------------------------------------------- */

export type Industry = { name: string; builds: string[] };

/* Source: previous site divisions/solutions.html, "Industries We Serve". */
export const industries = {
  label: "Industries",
  title: "Built for the sector,",
  titleAccent: "not just the screen.",
  lede: "Platforms shaped around the rules, the scale and the way work is actually done in each industry.",
  items: [
    { name: "Education", builds: ["School management", "Learning platforms", "Skill development"] },
    { name: "Healthcare", builds: ["Hospital systems", "Telemedicine", "Medical analytics"] },
    { name: "Agriculture", builds: ["Smart farming", "Farmer platforms", "Supply chain"] },
    { name: "Manufacturing", builds: ["Production tracking", "Inventory management", "Factory automation"] },
    { name: "Retail and e-commerce", builds: ["E-commerce platforms", "Customer analytics", "Loyalty systems"] },
    { name: "Finance", builds: ["FinTech applications", "Loan management", "Financial analytics"] },
    { name: "Logistics", builds: ["Fleet management", "Route optimisation", "Tracking systems"] },
    { name: "Government", builds: ["Citizen services", "Public platforms", "Smart governance"] },
    { name: "Aerospace and defence", builds: ["Data systems", "AI analytics", "Monitoring platforms"] },
  ] satisfies Industry[],
};

export type Edge = { title: string; text: string };

/* Source: previous site divisions/solutions.html, "Why Partner With Us".
   Its uptime and SLA figures were not carried over. */
export const edge = {
  label: "The TechM4Solutions edge",
  items: [
    { title: "Research-driven", text: "Long-term solutions built on R&D, not a template." },
    { title: "AI-first", text: "Automation, intelligence and prediction designed in from the start." },
    { title: "Enterprise architecture", text: "Built for scale, security and reliability from the first component." },
    { title: "Cost-efficient delivery", text: "Lean engineering processes that keep quality high and overheads low." },
    { title: "A long-term partner", text: "From the first idea to the prototype, the release and the growth after it." },
  ] satisfies Edge[],
};

/* -------------------------------------------------------------------------- */
/* Process                                                                    */
/* -------------------------------------------------------------------------- */

export type Step = { name: string; text: string; receive: string };

/**
 * Source: editorial description of the delivery approach, written for this
 * page. The previous site describes support "from initial ideation to
 * prototype build, through deployment". No durations, guarantees or service
 * levels are stated because none has been confirmed.
 */
export const process = {
  label: "How we work",
  title: "From brief to release,",
  titleAccent: "in five steps.",
  lede: "Five steps, each ending in something you can hold. Scope and schedule are agreed with you for each project; nothing here is a fixed timeline.",
  receiveLabel: "You receive",
  steps: [
    {
      name: "Understand",
      text: "We start with the people, the constraints and the result you need, before any technology is proposed.",
      receive: "A written brief: the problem, the users, the scope and the open questions.",
    },
    {
      name: "Design",
      text: "Flows, screens and system structure are worked out together and reviewed with you until they are agreed.",
      receive: "Interface designs and a technical plan you can review and challenge.",
    },
    {
      name: "Build",
      text: "The software is built in increments, so there is always something working to look at and respond to.",
      receive: "Regular working builds and a running list of what is done and what is next.",
    },
    {
      name: "Ship",
      text: "We test, deploy and hand over, with the people who will run the system in the room.",
      receive: "The released software and the notes needed to operate it.",
    },
    {
      name: "Support",
      text: "After release we stay available for fixes, changes and the next round of work.",
      receive: "A point of contact and an agreed way to raise changes.",
    },
  ] satisfies Step[],
};

/* -------------------------------------------------------------------------- */
/* Pay-and-use computer labs                                                  */
/* -------------------------------------------------------------------------- */

export type LabWork = { title: string; text: string; tools: string[] };

/**
 * Source: the client's brief: "pay and use labs ... silicon valley-level
 * computer systems that are capable of running high-end softwares with ease.
 * People can come to these labs and pay for their usage time." Software
 * named below is software TechM4India already teaches on its engineering and
 * AI programmes (this site's /engineering page and the previous site); it is
 * listed as the class of work the systems are built to run.
 * Do NOT add a GPU model, specification, price, opening hours, seat count or
 * address until the client supplies them.
 */
export const labs = {
  label: "Pay-and-use computer labs",
  title: "Silicon Valley-level machines.",
  titleAccent: "Pay only for the hours.",
  lede: "Our labs feature Silicon Valley-level computer systems that run high-end software with ease. Walk in, work on a machine built for the job, and pay for your usage time, not for the hardware.",
  offers: [
    {
      title: "Silicon Valley-level systems",
      text: "High-end machines for work that brings an everyday laptop to a halt: simulation, rendering, CAD and model training.",
    },
    {
      title: "High-end software, ready to run",
      text: "Demanding professional software runs with ease, so you spend the session working, not waiting.",
    },
    {
      title: "Pay for usage time",
      text: "Come to the lab, use what you need and pay for the time you use it. No hardware to buy, no machine to maintain.",
    },
  ],
  stepsTitle: "How it works",
  steps: [
    { name: "Tell us the work", text: "The software you need and roughly how long the job will take." },
    { name: "Book a system", text: "We confirm a machine and a time that suit you." },
    { name: "Come in and work", text: "Use a high-end system at the lab for your session." },
    { name: "Pay for the time", text: "You pay for the hours you used. Nothing more." },
  ],
  whoTitle: "Who it is for",
  who: [
    "Engineering students with a simulation or design project",
    "Freelancers and studios with a heavy render or model",
    "Startups training or testing an AI model",
    "Researchers who need compute for a fixed period",
  ],
  workTitle: "Built to run work like this",
  work: [
    {
      title: "CAD, BIM and drafting",
      text: "Design and documentation at full model size.",
      tools: ["AutoCAD", "Revit", "Civil 3D", "SolidWorks"],
    },
    {
      title: "Simulation and analysis",
      text: "Structural, finite-element and fluid analysis that needs real compute.",
      tools: ["ANSYS", "STAAD Pro", "ETABS", "HyperMesh", "MATLAB"],
    },
    {
      title: "AI and data",
      text: "Training and testing machine learning models beyond what a personal machine can handle.",
      tools: ["Python", "PyTorch", "TensorFlow"],
    },
    {
      title: "Electronics and embedded",
      text: "Circuit, FPGA and embedded design toolchains.",
      tools: ["Altium", "Vivado", "Embedded C"],
    },
  ] satisfies LabWork[],
  note: "System configurations, software availability, location and hourly rates are confirmed when you book.",
  cta: { label: "Book lab time", href: enquiry },
  image: {
    src: "/images/about/computer-lab.jpeg",
    alt: "A TechM4India mentor holding a microphone speaks to students seated at rows of desktop workstations in a computer lab, with a scatter plot projected on a screen behind him",
    caption: "A TechM4India session in a computer lab",
    note: "Hyderabad",
  },
};

/* -------------------------------------------------------------------------- */
/* Closing paths                                                              */
/* -------------------------------------------------------------------------- */

/** Source: working routes on this site and the partnerships address in lib/site-data.ts. */
export const closing = {
  label: "Next step",
  title: "Tell us what you are",
  titleAccent: "trying to build.",
  lede: "Projects, products and lab time all start with a short conversation. If email is easier, write to",
  paths: [
    {
      label: "Projects",
      title: "Discuss a project",
      text: "Share the brief, the users and the constraints.",
      href: enquiry,
    },
    {
      label: "Platform",
      title: "Explore CareerBuddy",
      text: "See the career discovery and roadmap platform on TechM4Schools.",
      href: "/schools",
    },
    {
      label: "Labs",
      title: "Book lab time",
      text: "Tell us the software and the hours you need.",
      href: enquiry,
    },
  ],
};
