/**
 * TechM4Engineering programme catalogue.
 *
 * Source: the previous TechM4India website (github.com/techm4india/riyaznew,
 * divisions/engineering.html, the `programs` array). Titles, durations,
 * sessions, credits, curricula, projects, outcomes and career paths are
 * carried over as published there; only "Program" was dropped from the badge
 * labels. Generated once from that file, then maintained by hand.
 */

import type { TrackId } from "./engineering";

export type ProgrammeBadge = "Core" | "Advanced" | "Foundation" | "Industry" | "Specialist";

export type Programme = {
  id: string;
  track: TrackId;
  title: string;
  badge: ProgrammeBadge;
  description: string;
  tools: string[];
  duration: string;
  sessions: string;
  credits: string;
  /** The programme's own five-step flow, e.g. Model → Analyze → Design → Verify → Deliver. */
  flow: string[];
  phases: { label: string; name: string; topics: string[]; projects: string[] }[];
  outcomes: { title: string; text: string }[];
  careers: string[];
};

export const programmes: Programme[] = [
  {
    id: "c1",
    track: "civil",
    title: "Structural Design with Revit & STAAD Pro",
    badge: "Core",
    description:
      "Master the complete structural design workflow — from architectural modeling in Revit to structural analysis in STAAD Pro — as used by India's top structural engineering firms.",
    tools: ["Revit", "STAAD Pro", "AutoCAD"],
    duration: "4 Months",
    sessions: "48 Sessions",
    credits: "4 Credits",
    flow: ["Model", "Analyze", "Design", "Verify", "Deliver"],
    phases: [
      {
        label: "Months 1–2 · Foundation",
        name: "Revit Structural Modeling",
        topics: [
          "Revit interface, families, and project setup",
          "Architectural to structural model coordination",
          "Grids, levels, and column/beam placement",
          "Foundation modeling — isolated, combined, mat",
          "Structural slab and staircase modeling",
          "Drawing sheets, schedules and annotation",
        ],
        projects: [
          "5-storey RC framed building model in Revit",
          "Foundation layout and structural drawing set",
        ],
      },
      {
        label: "Months 3–4 · Analysis",
        name: "STAAD Pro Structural Analysis",
        topics: [
          "STAAD Pro geometry input and member properties",
          "Load definition — dead, live, wind, seismic (IS 875/1893)",
          "Load combinations as per IS 456 / IS 800",
          "Analysis run and result interpretation",
          "Member design — beams, columns, slabs",
          "Footing design and design brief generation",
        ],
        projects: [
          "Complete structural analysis of G+4 building",
          "Structural design report with IS code compliance",
        ],
      },
      {
        label: "Capstone · Integration",
        name: "Integrated Project Delivery",
        topics: [
          "Revit to STAAD Pro link and data exchange",
          "Structural documentation package preparation",
          "Quantity take-off and BOQ generation",
          "Industry review and submission format",
          "Portfolio presentation and documentation",
        ],
        projects: ["Full structural project package — model + analysis + drawings + report"],
      },
    ],
    outcomes: [
      {
        title: "BIM Proficiency",
        text: "Create industry-standard Revit structural models from architectural inputs.",
      },
      {
        title: "Structural Analysis",
        text: "Run complete STAAD Pro analysis with IS code load combinations and design outputs.",
      },
      {
        title: "Complete Documentation",
        text: "Produce full structural drawing sets, schedules, and technical reports.",
      },
    ],
    careers: [
      "Structural Engineer",
      "BIM Coordinator",
      "Design Engineer",
      "Revit Modeler",
      "Structural Drafter",
      "Site Engineer",
    ],
  },
  {
    id: "c2",
    track: "civil",
    title: "BIM & Digital Construction with ETABS",
    badge: "Advanced",
    description:
      "Advanced BIM workflows and high-rise structural analysis using ETABS — the industry standard for multi-storey building and seismic analysis in India.",
    tools: ["ETABS", "Revit", "BIM 360"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Plan", "Model", "Analyze", "Coordinate", "Deliver"],
    phases: [
      {
        label: "Month 1 · ETABS Foundation",
        name: "ETABS Modeling & Setup",
        topics: [
          "ETABS interface and project configuration",
          "Grid and story level definition",
          "Column, beam, wall, and slab modeling",
          "Material and section property assignment",
          "Diaphragm assignment and rigid zone definition",
          "Static load case definition",
        ],
        projects: ["G+10 RC framed structure model in ETABS"],
      },
      {
        label: "Month 2 · Seismic Analysis",
        name: "Dynamic & Seismic Analysis",
        topics: [
          "IS 1893 seismic zone and soil type parameters",
          "Response spectrum analysis setup",
          "Time history analysis fundamentals",
          "Lateral force distribution and drift checks",
          "P-delta and geometric nonlinearity",
          "Story shear, overturning moment and displacement",
        ],
        projects: ["Seismic analysis report for G+10 structure with IS 1893 compliance"],
      },
      {
        label: "Month 3 · BIM Coordination",
        name: "BIM Coordination & Documentation",
        topics: [
          "Revit-ETABS interoperability workflows",
          "Model coordination and clash detection",
          "BIM 360 cloud collaboration basics",
          "Construction documentation from BIM",
          "Project handover documentation standards",
        ],
        projects: ["Fully coordinated BIM model with analysis-backed structural design"],
      },
    ],
    outcomes: [
      {
        title: "High-Rise Analysis",
        text: "Model and analyze multi-storey buildings with ETABS to IS 1893 seismic standards.",
      },
      {
        title: "BIM Integration",
        text: "Coordinate Revit models with ETABS analysis in a real BIM workflow pipeline.",
      },
      {
        title: "Seismic Compliance",
        text: "Produce complete seismic analysis reports meeting IS code requirements.",
      },
    ],
    careers: [
      "Structural Analyst",
      "ETABS Engineer",
      "BIM Engineer",
      "High-Rise Designer",
      "Seismic Analyst",
      "Structural Design Engineer",
    ],
  },
  {
    id: "c3",
    track: "civil",
    title: "AutoCAD & Civil 3D — Site & Infrastructure",
    badge: "Foundation",
    description:
      "Complete AutoCAD and Civil 3D training for site planning, road design, drainage networks and infrastructure layout — essential skills for every civil engineering professional.",
    tools: ["AutoCAD", "Civil 3D", "HAANS Civil"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Draft", "Survey", "Design", "Plan", "Document"],
    phases: [
      {
        label: "Month 1 · AutoCAD Mastery",
        name: "AutoCAD 2D & 3D Drafting",
        topics: [
          "AutoCAD interface, workspaces, and shortcuts",
          "Precision drafting — lines, arcs, polygons",
          "Layers, linetypes, dimensions, and text",
          "Blocks, attributes and external references",
          "Layout tabs, viewports and print setup",
          "3D modeling basics for civil applications",
        ],
        projects: ["Complete building site plan with dimensions, levels and legend"],
      },
      {
        label: "Months 2–3 · Civil 3D",
        name: "Civil 3D Infrastructure Design",
        topics: [
          "Civil 3D data model — surfaces, alignments, profiles",
          "Survey data import and surface creation",
          "Horizontal and vertical road alignment design",
          "Cross-section generation and earthwork volumes",
          "Stormwater drainage network design",
          "HAANS Civil — plan and profile workflows",
        ],
        projects: [
          "1 km road design with alignments, profile, cross-sections and drainage network",
        ],
      },
    ],
    outcomes: [
      {
        title: "AutoCAD Mastery",
        text: "Professional-level 2D and 3D drafting for architectural and civil engineering drawings.",
      },
      {
        title: "Infrastructure Design",
        text: "Design road alignments, drainage systems, and site infrastructure with Civil 3D.",
      },
      {
        title: "Professional Output",
        text: "Produce complete drawing packages meeting industry and municipal submission standards.",
      },
    ],
    careers: [
      "Civil CAD Draftsman",
      "Site Engineer",
      "Infrastructure Designer",
      "Survey Engineer",
      "Road Design Engineer",
      "Municipal Engineer",
    ],
  },
  {
    id: "c4",
    track: "civil",
    title: "Construction Project Management with MSP & Primavera",
    badge: "Industry",
    description:
      "Master project scheduling, resource allocation, cost estimation, and earned value management (EVM) for large-scale infrastructure projects.",
    tools: ["Primavera P6", "MS Project", "Excel"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Estimate", "Schedule", "Budget", "Monitor", "Control"],
    phases: [
      {
        label: "Month 1 · Estimating",
        name: "Quantity Surveying & Rate Analysis",
        topics: [
          "Reading structural blueprints and drawings",
          "Standard methods of measurement (IS 1200)",
          "Quantity estimation for excavation, concrete, reinforcement",
          "Rate analysis of materials, labor, and machinery",
          "Bill of Quantities (BOQ) preparation in Excel",
        ],
        projects: ["Complete BOQ and cost estimation for G+2 residential villa"],
      },
      {
        label: "Months 2–3 · Scheduling",
        name: "Primavera P6 & MSP Workflows",
        topics: [
          "Work Breakdown Structure (WBS) design",
          "Activity definitions, relationships, and lags",
          "Resource loading and leveling techniques",
          "Baseline creation and progress tracking",
          "Earned Value Management (EVM) reporting",
        ],
        projects: ["Project schedule for a commercial high-rise building on Primavera P6"],
      },
    ],
    outcomes: [
      {
        title: "Scheduling Mastery",
        text: "Build and manage complex resource-loaded project schedules in Primavera P6.",
      },
      {
        title: "Cost Control",
        text: "Determine precise construction cost estimates and monitor variances using EVM.",
      },
      {
        title: "Resource Optimization",
        text: "Level project resources to avoid overallocation and balance workloads.",
      },
    ],
    careers: [
      "Planning Engineer",
      "Project Scheduler",
      "Quantity Surveyor",
      "Cost Estimator",
      "Billing Engineer",
    ],
  },
  {
    id: "c5",
    track: "civil",
    title: "Geotechnical & Foundation Engineering",
    badge: "Specialist",
    description:
      "Learn soil mechanics, slope stability analysis, shallow and deep foundation design, and soil-structure interaction modeling using industry tools.",
    tools: ["PLAXIS 2D", "GeoStudio", "Excel"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Investigate", "Analyze", "Design", "Model", "Verify"],
    phases: [
      {
        label: "Month 1 · Soil Mechanics",
        name: "Soil Investigation & Bearing Capacity",
        topics: [
          "Soil classifications and phase relationships",
          "Shear strength parameters — cohesive & cohesionless",
          "Standard Penetration Test (SPT) result evaluation",
          "Bearing capacity calculations for shallow footings",
          "Settlement analysis — immediate and consolidation",
        ],
        projects: ["Foundation bearing capacity calculation report based on borehole log data"],
      },
      {
        label: "Months 2–3 · PLAXIS modeling",
        name: "PLAXIS 2D Foundation Design & Stability",
        topics: [
          "PLAXIS 2D boundary setups and material models",
          "Deep foundation design — piles under axial and lateral loads",
          "Retaining wall modeling and lateral earth pressures",
          "Slope stability analysis using GeoStudio SLOPE/W",
          "Ground water seepage modeling basics",
        ],
        projects: [
          "Slope stability design for an embankment",
          "PLAXIS 2D FE analysis of a pile foundation group",
        ],
      },
    ],
    outcomes: [
      {
        title: "Soil Characterization",
        text: "Interpret site investigation reports and derive shear strength values for designs.",
      },
      {
        title: "Foundation Design",
        text: "Design shallow footings, raft foundations, and pile groups to Indian Standard codes.",
      },
      {
        title: "Numerical Modeling",
        text: "Simulate soil settlement and earth-retaining structure behaviors in PLAXIS 2D.",
      },
    ],
    careers: [
      "Geotechnical Engineer",
      "Foundation Designer",
      "Site Geologist",
      "FE Modeler",
      "Civil Designer",
    ],
  },
  {
    id: "m1",
    track: "mech",
    title: "FEA Simulation with ANSYS Workbench",
    badge: "Core",
    description:
      "Master Finite Element Analysis (FEA) using ANSYS Workbench — the world's leading simulation platform used by aerospace, automotive, and mechanical engineering industries globally.",
    tools: ["ANSYS", "HyperMesh", "FEA"],
    duration: "4 Months",
    sessions: "48 Sessions",
    credits: "4 Credits",
    flow: ["Geometry", "Mesh", "Setup", "Solve", "Post-process"],
    phases: [
      {
        label: "Months 1–2 · FEA Fundamentals",
        name: "ANSYS Structural Analysis",
        topics: [
          "FEA theory — elements, nodes, DOF, stiffness matrix",
          "ANSYS Workbench interface and project workflow",
          "Geometry import from CAD and DesignModeler",
          "Material definition and assignment",
          "Boundary conditions — supports, forces, pressure",
          "Static structural analysis and result evaluation",
        ],
        projects: ["Structural analysis of machine bracket under multi-directional loading"],
      },
      {
        label: "Months 3–4 · Advanced Simulation",
        name: "Thermal & Modal Analysis",
        topics: [
          "Steady-state and transient thermal analysis",
          "Coupled thermal-structural analysis",
          "Modal analysis — natural frequencies and mode shapes",
          "Harmonic response analysis",
          "Fatigue analysis basics",
          "Convergence study and mesh sensitivity",
        ],
        projects: ["Engine bracket thermal analysis + modal analysis with frequency report"],
      },
      {
        label: "Capstone · Industrial Project",
        name: "Industry Simulation Project",
        topics: [
          "Real component selection and CAD import",
          "Complete pre-processing workflow",
          "Analysis setup, solve, and result extraction",
          "Technical report writing and presentation",
          "Industry standard documentation format",
        ],
        projects: [
          "Complete FEA project on an automotive or aerospace component with full technical report",
        ],
      },
    ],
    outcomes: [
      {
        title: "FEA Expertise",
        text: "Run complete structural, thermal, and modal analyses using ANSYS Workbench at industry level.",
      },
      {
        title: "Result Interpretation",
        text: "Interpret stress, deformation, temperature, and frequency results to drive design decisions.",
      },
      {
        title: "Technical Reports",
        text: "Produce industry-standard FEA reports meeting aerospace and automotive documentation standards.",
      },
    ],
    careers: [
      "FEA Engineer",
      "Simulation Engineer",
      "Structural Analyst",
      "Design Validation Engineer",
      "Product Engineer",
      "CAE Analyst",
    ],
  },
  {
    id: "m2",
    track: "mech",
    title: "HyperMesh — Advanced FE Pre-Processing",
    badge: "Advanced",
    description:
      "Altair HyperMesh is the industry benchmark for FE model preparation in automotive and aerospace. This program gives you deep, workflow-level mastery of the world's meshing software.",
    tools: ["HyperMesh", "ANSYS", "HyperView"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Import", "Clean", "Mesh", "Validate", "Export"],
    phases: [
      {
        label: "Month 1 · HyperMesh Foundations",
        name: "Geometry & 2D Meshing",
        topics: [
          "HyperMesh interface, panels, and workflow",
          "CAD geometry import and cleanup",
          "Surface midsurfacing for shell elements",
          "2D mesh generation — mapped, automesh, free",
          "Mesh quality criteria — aspect ratio, skewness, warping",
          "Component and material assignment",
        ],
        projects: ["Shell mesh of automotive body panel with quality report"],
      },
      {
        label: "Months 2–3 · 3D Meshing & Advanced",
        name: "3D Solid Meshing & Export",
        topics: [
          "3D solid meshing — hex, tet, and hybrid meshing",
          "Connector elements — welds, bolts, adhesives",
          "Contact surface definition and penetration check",
          "Boundary condition application",
          "HyperView post-processing fundamentals",
          "Solver export — ANSYS, Abaqus, Nastran formats",
        ],
        projects: ["Complete 3D FE model of mechanical assembly ready for ANSYS analysis"],
      },
    ],
    outcomes: [
      {
        title: "HyperMesh Proficiency",
        text: "Generate industry-quality 2D and 3D FE meshes meeting automotive and aerospace standards.",
      },
      {
        title: "Pre-Processing Workflow",
        text: "Complete end-to-end FE model preparation from CAD import to solver-ready output.",
      },
      {
        title: "Quality Verification",
        text: "Run mesh quality checks against industry criteria and produce quality index reports.",
      },
    ],
    careers: [
      "CAE Analyst",
      "FE Modeler",
      "Pre-Process Engineer",
      "Meshing Engineer",
      "Simulation Analyst",
      "Automotive CAE Engineer",
    ],
  },
  {
    id: "m3",
    track: "mech",
    title: "Product Design & Manufacturing Engineering",
    badge: "Industry",
    description:
      "End-to-end product engineering — from concept design in SolidWorks to manufacturing process planning with HAANS Mechanical, bridging design and production.",
    tools: ["SolidWorks", "HAANS Mech", "STAAD Pro"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Concept", "Model", "Prototype", "Validate", "Manufacture"],
    phases: [
      {
        label: "Months 1–2 · Product Design",
        name: "SolidWorks 3D Design",
        topics: [
          "SolidWorks parametric part modeling",
          "Assembly modeling — mates, motion, interference",
          "Engineering drawings and GD&T",
          "Sheet metal design and flat pattern development",
          "Design for manufacturing principles",
          "Design intent and parametric design strategies",
        ],
        projects: [
          "Mechanical assembly design — gearbox or pump housing with full drawing package",
        ],
      },
      {
        label: "Month 3 · Manufacturing",
        name: "Manufacturing Process Engineering",
        topics: [
          "HAANS Mechanical — process planning workflows",
          "Manufacturing process selection and planning",
          "Bill of materials and work instructions",
          "Quality control documentation",
          "Cost estimation and material selection",
          "Industry handover documentation standards",
        ],
        projects: ["Complete product engineering package — design + drawings + process plan + BOM"],
      },
    ],
    outcomes: [
      {
        title: "Product Design Skills",
        text: "Create parametric 3D models and engineering drawings using SolidWorks at professional level.",
      },
      {
        title: "Manufacturing Knowledge",
        text: "Develop manufacturing process plans, BOMs, and production documentation using HAANS.",
      },
      {
        title: "Complete Engineering Package",
        text: "Deliver a full product engineering package from concept to production-ready documentation.",
      },
    ],
    careers: [
      "Product Design Engineer",
      "Manufacturing Engineer",
      "Design Draftsman",
      "Process Planner",
      "R&D Engineer",
      "Mechanical Designer",
    ],
  },
  {
    id: "m4",
    track: "mech",
    title: "Computational Fluid Dynamics (CFD) with ANSYS Fluent",
    badge: "Specialist",
    description:
      "Master fluid flow, heat transfer, turbulence modeling, and aerodynamics simulation for automotive, aerospace, and HVAC components.",
    tools: ["ANSYS Fluent", "SpaceClaim", "CFD-Post"],
    duration: "4 Months",
    sessions: "48 Sessions",
    credits: "4 Credits",
    flow: ["Pre-process", "Mesh", "Setup", "Solve", "Visualize"],
    phases: [
      {
        label: "Months 1–2 · CFD Basics",
        name: "Fluid Dynamics & Mesh Generation",
        topics: [
          "Navier-Stokes equations & CFD fundamentals",
          "SpaceClaim geometry preparation and fluid domain extraction",
          "ANSYS Meshing — inflation layers, structured, unstructured mesh",
          "Mesh quality evaluation (orthogonal quality, aspect ratio)",
          "Boundary conditions definition",
        ],
        projects: ["Fluid flow mesh and setup for a pipe junction with manifold"],
      },
      {
        label: "Months 3–4 · Fluent solver",
        name: "Fluent Solvers & Turbulence",
        topics: [
          "Turbulence models (k-epsilon, k-omega, SST)",
          "Heat transfer, convection, and radiation setups",
          "Multiphase flow and transient simulations",
          "Solver settings, convergence monitors, residuals",
          "CFD-Post visualization — streamlines, contours, vectors",
        ],
        projects: [
          "Aerodynamic lift and drag simulation of an airfoil",
          "Thermal-CFD analysis of an electronics cooling block",
        ],
      },
    ],
    outcomes: [
      {
        title: "Fluid Simulation",
        text: "Solve internal and external flow scenarios using Fluent solver setups.",
      },
      {
        title: "Thermal Management",
        text: "Model heat sinks, conduction, and forced convection cooling components.",
      },
      {
        title: "CFD Post-Processing",
        text: "Extract drag/lift coefficients, pressure drops, and plot flow contours.",
      },
    ],
    careers: [
      "CFD Engineer",
      "Thermal Engineer",
      "Aerodynamicist",
      "Analysis Engineer",
      "CAE Analyst",
    ],
  },
  {
    id: "m5",
    track: "mech",
    title: "CNC Programming & CAM Technology",
    badge: "Foundation",
    description:
      "Learn 2-axis and 3-axis milling/turning toolpath generation, G-Code programming, and machine operation workflows.",
    tools: ["Mastercam", "CNC G-Code", "SolidWorks CAM"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["CAD", "CAM", "Post-process", "Setup", "Machining"],
    phases: [
      {
        label: "Month 1 · Manual G-Code",
        name: "Manual G-Code & CNC Setup",
        topics: [
          "Introduction to CNC milling & turning centers",
          "G-codes and M-codes manual programming",
          "Work coordinate systems (G54-G59) & tool offsets",
          "Speeds, feeds, and cutting depth calculations",
          "Machine control panel setup and test runs",
        ],
        projects: ["Manual G-code program for step turning and pocket milling profiles"],
      },
      {
        label: "Months 2–3 · Mastercam",
        name: "Mastercam 2D & 3D CAM Programming",
        topics: [
          "Mastercam CAD interface and geometry import",
          "2D toolpaths — contouring, pocketing, drilling",
          "3D high-speed toolpaths — roughing, semi-finishing, finishing",
          "Toolpath simulation, verification, and collision check",
          "Post-processing and CNC code export for FANUC/Siemens",
        ],
        projects: ["CAM toolpaths and G-code generation for a molded engine bracket block"],
      },
    ],
    outcomes: [
      {
        title: "CNC Operations",
        text: "Write manual G-Code and set tool/work offsets on industrial CNC centers.",
      },
      {
        title: "CAM Toolpaths",
        text: "Generate complex 2D and 3D milling toolpaths using Mastercam.",
      },
      {
        title: "Virtual Verification",
        text: "Simulate cutting processes to verify tolerances and prevent tool crashes.",
      },
    ],
    careers: [
      "CAM Engineer",
      "CNC Programmer",
      "Production Engineer",
      "Tool Room Engineer",
      "CAD/CAM Designer",
    ],
  },
  {
    id: "cse1",
    track: "cse",
    title: "Full-Stack Web Development & DevOps",
    badge: "Core",
    description:
      "Become an industry-ready full-stack software engineer. Master Frontend (React, Next.js), Backend (Node.js, Express), Databases (PostgreSQL, MongoDB), and cloud deployment using AWS and Docker.",
    tools: ["React", "Node.js", "AWS", "Docker", "Git"],
    duration: "6 Months",
    sessions: "72 Sessions",
    credits: "6 Credits",
    flow: ["Design", "Develop", "Test", "Deploy", "Scale"],
    phases: [
      {
        label: "Months 1–2 · Frontend",
        name: "Responsive Web UI with React",
        topics: [
          "HTML5 semantic markup, CSS3 layout (Flexbox/Grid)",
          "JavaScript ES6+ fundamentals, DOM manipulation",
          "React component model, state, and hooks",
          "Tailwind CSS & modern design systems integration",
          "API fetching, routing, and asynchronous state",
          "Responsive design principles and mobile testing",
        ],
        projects: [
          "Fully responsive multi-page dashboard application",
          "Real-time collaborative task manager",
        ],
      },
      {
        label: "Months 3–4 · Backend",
        name: "Secure API Engineering & DBs",
        topics: [
          "Node.js runtime environment and Express framework",
          "Database design — PostgreSQL (SQL) & MongoDB (NoSQL)",
          "RESTful API architecture and custom JSON endpoints",
          "User authentication (JWT, OAuth) & security best practices",
          "Redis caching layer and performance optimization",
          "Unit testing with Jest and Supertest",
        ],
        projects: [
          "Secure REST API backend with user roles and payments",
          "High-throughput chat server using WebSockets",
        ],
      },
      {
        label: "Months 5–6 · DevOps & Cloud",
        name: "CI/CD Pipelines & Cloud Scale",
        topics: [
          "Docker containerization and compose setups",
          "AWS core services — EC2, S3, RDS, IAM",
          "Continuous Integration & Deployment (GitHub Actions)",
          "Serverless deployment with Vercel & AWS Lambda",
          "Nginx reverse proxy, SSL certification setup",
          "System monitoring, logging, and load balancing",
        ],
        projects: ["Dockerized full-stack app deployed on AWS EC2 via CI/CD"],
      },
    ],
    outcomes: [
      {
        title: "Full-Stack Proficiency",
        text: "Build and deploy fully functional web applications from database schemas to client-side UI.",
      },
      {
        title: "DevOps & Scaling",
        text: "Package services inside Docker containers and configure automated cloud deployments on AWS.",
      },
      {
        title: "Database Design",
        text: "Model structured and unstructured data using modern Postgres and MongoDB standards.",
      },
    ],
    careers: [
      "Full-Stack Developer",
      "Backend Engineer",
      "DevOps Engineer",
      "Cloud Software Developer",
      "React Developer",
    ],
  },
  {
    id: "cse2",
    track: "cse",
    title: "Artificial Intelligence & Data Engineering",
    badge: "Specialist",
    description:
      "Master the state-of-the-art in AI and ML. Learn data preprocessing, statistical modeling, supervised/unsupervised machine learning, deep learning with TensorFlow, and modern generative AI/LLMs.",
    tools: ["Python", "TensorFlow", "PyTorch", "SQL", "Pandas"],
    duration: "4 Months",
    sessions: "48 Sessions",
    credits: "4 Credits",
    flow: ["Wrangle", "Analyze", "Model", "Validate", "Deploy"],
    phases: [
      {
        label: "Month 1 · Foundations",
        name: "Python for Data Analysis",
        topics: [
          "Python programming basics, functions, and OOP",
          "Data wrangling with NumPy and Pandas libraries",
          "Data visualization with Matplotlib and Seaborn",
          "Relational database querying and advanced SQL joins",
          "Exploratory Data Analysis (EDA) methodologies",
          "Statistical distributions and hypothesis testing",
        ],
        projects: [
          "Complete sales intelligence EDA dataset analysis",
          "SQL database schema design and KPI extraction",
        ],
      },
      {
        label: "Months 2–3 · Modeling",
        name: "Machine Learning & Deep Learning",
        topics: [
          "Supervised learning — linear/logistic regression, trees",
          "Unsupervised learning — clustering, dimensional reduction",
          "Model evaluation metrics, cross-validation, hyperparameter tuning",
          "Neural network architectures with Keras & TensorFlow",
          "Convolutional Neural Networks (CNN) for computer vision",
          "Recurrent Neural Networks (RNN) for sequence modeling",
        ],
        projects: [
          "Predictive customer churn model with scikit-learn",
          "Chest X-ray disease classification model with CNNs",
        ],
      },
      {
        label: "Month 4 · GenAI & MLOps",
        name: "Generative AI & LLMs in Production",
        topics: [
          "Transformer architectures and self-attention mechanisms",
          "LLM prompt engineering and Retrieval-Augmented Generation (RAG)",
          "LangChain framework and vector database indexing",
          "HuggingFace spaces and API integrations",
          "Model optimization, quantization, and edge deployment",
          "MLOps pipelines for serving predictions",
        ],
        projects: ["Enterprise PDF document QA bot using LangChain & RAG"],
      },
    ],
    outcomes: [
      {
        title: "AI Engineering",
        text: "Train, evaluate, and fine-tune supervised, unsupervised, and deep learning neural models.",
      },
      {
        title: "Data Analytics",
        text: "Clean, normalize, and query complex datasets to extract predictive insights.",
      },
      {
        title: "GenAI Integration",
        text: "Build intelligent chatbots and RAG agents leveraging large language models.",
      },
    ],
    careers: [
      "AI Engineer",
      "Machine Learning Engineer",
      "Data Scientist",
      "NLP Specialist",
      "Data Analyst",
    ],
  },
  {
    id: "cse3",
    track: "cse",
    title: "Cybersecurity & Ethical Hacking",
    badge: "Advanced",
    description:
      "Master network security, vulnerability assessment, web application penetration testing, system hardening, and incident response under industry guidelines.",
    tools: ["Kali Linux", "Wireshark", "Nmap", "Metasploit", "Burp Suite"],
    duration: "4 Months",
    sessions: "48 Sessions",
    credits: "4 Credits",
    flow: ["Recon", "Scan", "Exploit", "Escalate", "Harden"],
    phases: [
      {
        label: "Months 1–2 · Recon & Scanning",
        name: "Network Reconnaissance & Vulnerabilities",
        topics: [
          "Linux foundations and security administration",
          "TCP/IP networking model and port scanning with Nmap",
          "Network sniffing and traffic analysis with Wireshark",
          "Vulnerability scanning with Nessus and OpenVAS",
          "Social engineering methodologies and security awareness",
        ],
        projects: ["Vulnerability assessment report of a sandbox enterprise network"],
      },
      {
        label: "Months 3–4 · Pen Testing",
        name: "Exploitation & Web App Pentesting",
        topics: [
          "Metasploit framework and payloads delivery",
          "Web security vulnerabilities — OWASP Top 10",
          "SQL injection, XSS, CSRF, and broken authentication",
          "Burp Suite proxy manipulation and API testing",
          "Privilege escalation techniques (Windows/Linux)",
          "Firewalls, IDS/IPS, and system defense hardening",
        ],
        projects: ["Complete penetration testing report on an OWASP vulnerable server"],
      },
    ],
    outcomes: [
      {
        title: "Ethical Hacking",
        text: "Identify and safely exploit network and web application security gaps.",
      },
      {
        title: "Traffic Auditing",
        text: "Intercept and analyze packet streams with Wireshark to locate indicators of compromise (IoC).",
      },
      {
        title: "System Hardening",
        text: "Configure firewalls, policies, and secure endpoints to mitigate cyber threats.",
      },
    ],
    careers: [
      "Security Analyst",
      "Penetration Tester",
      "SOC Engineer",
      "Information Security Consultant",
    ],
  },
  {
    id: "cse4",
    track: "cse",
    title: "Cloud Computing & AWS Solutions Architecture",
    badge: "Industry",
    description:
      "Design highly available, fault-tolerant, secure, and scalable cloud architectures on Amazon Web Services using Infrastructure as Code (IaC).",
    tools: ["AWS", "Terraform", "Docker", "Kubernetes", "Linux"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Architect", "Provision", "Containerize", "Orchestrate", "Monitor"],
    phases: [
      {
        label: "Month 1 · AWS Core",
        name: "AWS Core Services & Infrastructure",
        topics: [
          "Cloud computing models (IaaS, PaaS, SaaS)",
          "VPCs, subnets, route tables, security groups",
          "EC2 instances, load balancers, auto-scaling groups",
          "S3 buckets, IAM user roles and policies",
          "Relational (RDS) and NoSQL (DynamoDB) databases",
        ],
        projects: ["Multi-tier VPC hosting a high-availability auto-scaled website"],
      },
      {
        label: "Months 2–3 · Automation",
        name: "IaC, Containers & Kubernetes",
        topics: [
          "Infrastructure as Code with Terraform syntax",
          "Containerization with Docker and multi-stage builds",
          "Kubernetes cluster architecture and pod controllers",
          "Deploying applications on Amazon EKS",
          "Cloud monitoring with CloudWatch and Prometheus",
        ],
        projects: ["Automated Kubernetes application deployment on AWS using Terraform"],
      },
    ],
    outcomes: [
      {
        title: "AWS Architecture",
        text: "Design reliable and secure multi-tier infrastructure configurations on AWS.",
      },
      {
        title: "Infrastructure as Code",
        text: "Define and manage cloud resources programmatically with Terraform.",
      },
      {
        title: "Container Orchestration",
        text: "Package web apps inside Docker containers and run them in Kubernetes clusters.",
      },
    ],
    careers: [
      "Cloud Engineer",
      "AWS Solutions Architect",
      "DevOps Engineer",
      "System Administrator",
    ],
  },
  {
    id: "cse5",
    track: "cse",
    title: "Blockchain & Smart Contract Engineering",
    badge: "Specialist",
    description:
      "Learn decentralized application (DApp) development, Solidity smart contracts scripting, token design, and consensus protocols.",
    tools: ["Solidity", "Hardhat", "Ethereum", "Web3.js", "Cryptography"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Understand", "Code", "Test", "Deploy", "Integrate"],
    phases: [
      {
        label: "Month 1 · Blockchain Core",
        name: "Solidity Smart Contract Design",
        topics: [
          "Blockchain structures, hashing, asymmetric cryptography",
          "Ethereum Virtual Machine (EVM) and gas optimization",
          "Solidity variables, control flows, structures, mappings",
          "Inheritance, modifiers, and custom events",
          "Security best practices — avoiding reentrancy attacks",
        ],
        projects: ["Secure custom ERC-20 token contract with burning mechanism"],
      },
      {
        label: "Months 2–3 · Hardhat & DApps",
        name: "Hardhat Testing & Frontend Link",
        topics: [
          "Hardhat project setup, compiling, and network configs",
          "Writing smart contract unit tests in Mocha & Chai",
          "Deploying smart contracts to Sepolia/Polygon testnets",
          "Connecting frontends with Ethers.js or Web3.js",
          "Integrating MetaMask wallets and state triggers",
        ],
        projects: ["Decentralized crowdfunding platform (DApp) with React frontend"],
      },
    ],
    outcomes: [
      {
        title: "Smart Contracts",
        text: "Write smart contracts using Solidity.",
      },
      {
        title: "Security Audits",
        text: "Recognize and resolve common vulnerability patterns in blockchain contracts.",
      },
      {
        title: "DApp Integration",
        text: "Build client interfaces that authenticate users and interact with the Ethereum network.",
      },
    ],
    careers: [
      "Solidity Developer",
      "Blockchain Engineer",
      "DApp Developer",
      "Smart Contract Auditor",
    ],
  },
  {
    id: "eee1",
    track: "eee",
    title: "Electric Vehicle Powertrain & BMS Engineering",
    badge: "Core",
    description:
      "Master the engineering of modern electric mobility. Learn EV battery modeling, thermal management, cell balancing, motor control theory (FOC), and power electronic converter design.",
    tools: ["MATLAB", "Simulink", "Ansys Maxwell", "Altium Designer"],
    duration: "4 Months",
    sessions: "48 Sessions",
    credits: "4 Credits",
    flow: ["Model", "Analyze", "Design", "Prototype", "Validate"],
    phases: [
      {
        label: "Months 1–2 · Batteries & BMS",
        name: "EV Batteries & BMS Design",
        topics: [
          "Lithium-ion cell chemistry, specs, and charge/discharge curves",
          "Battery pack assembly configuration (series/parallel matching)",
          "BMS architectures — master/slave topologies",
          "State of Charge (SoC) and State of Health (SoH) estimation",
          "Passive and active cell balancing circuitry",
          "Over-voltage, under-voltage, over-temperature protection",
        ],
        projects: [
          "Simulink model of a 10-cell series lithium-ion pack",
          "Altium design of a 4S active cell balancer board",
        ],
      },
      {
        label: "Month 3 · Motor & Power Electronics",
        name: "EV Powertrain & Motor Control",
        topics: [
          "EV powertrain configurations (HEV, PHEV, BEV)",
          "Electric motors — BLDC, PMSM, Induction motor operations",
          "Power electronic converters — buck, boost, bidir, inverter",
          "Field Oriented Control (FOC) motor control theory",
          "PWM generation and gate driver circuit layout",
          "Thermal management systems for motors and packs",
        ],
        projects: ["Simulation of PMSM motor closed-loop FOC in Simulink"],
      },
      {
        label: "Month 4 · Systems Integration",
        name: "Simulation & Safety Compliance",
        topics: [
          "Hardware-in-the-loop (HIL) testing for EV systems",
          "EV safety standards — ISO 26262 functional safety, ASIL ratings",
          "Regenerative braking modeling and strategy optimization",
          "Vehicle dynamics, traction force, and torque profiling",
          "Design documentation, certification formats and test protocols",
        ],
        projects: [
          "Complete EV simulation package — pack model + motor controller + vehicle dynamics",
        ],
      },
    ],
    outcomes: [
      {
        title: "BMS Architecture",
        text: "Design protective BMS firmware and balancing circuits to maximize battery life.",
      },
      {
        title: "EV Dynamics Modeling",
        text: "Simulate EV powertrain drivetrains under dynamic driving cycles in MATLAB.",
      },
      {
        title: "Power Electronics",
        text: "Model and design efficient DC-DC converters and 3-phase inverters for motor drives.",
      },
    ],
    careers: [
      "EV Systems Engineer",
      "BMS Hardware Engineer",
      "Power Electronics Engineer",
      "Battery Analyst",
      "Motor Control Engineer",
    ],
  },
  {
    id: "eee2",
    track: "eee",
    title: "Smart Grid & Renewable Energy Technology",
    badge: "Advanced",
    description:
      "Learn to design and model modern power systems. Master solar PV system design, wind turbine integration, power quality management, grid-tie converters, and smart substation SCADA systems.",
    tools: ["MATLAB", "ETAP", "PVSyst", "SCADA"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Plan", "Model", "Connect", "Control", "Monitor"],
    phases: [
      {
        label: "Month 1 · Solar & Renewable Design",
        name: "Solar PV Systems & PVSyst Modeling",
        topics: [
          "Solar PV cell physics, parameters, and mismatch losses",
          "Solar array sizing, string configuration, and inverter matching",
          "Off-grid, on-grid, and hybrid solar PV system designs",
          "PVSyst software interface, meteorological data import",
          "System loss analysis — shading, IAM, wiring, temperature",
          "Financial analysis, LCOE calculation and yield reports",
        ],
        projects: ["Feasibility study and PVSyst model of a 500kW rooftop PV array"],
      },
      {
        label: "Month 2 · Power Systems & Grid Link",
        name: "Grid Integration & Power Electronics",
        topics: [
          "Grid-tie inverter topologies and control loop designs",
          "Synchronization techniques — Phase Locked Loops (PLL)",
          "Power quality issues — harmonics, voltage sags, power factor",
          "Active power filters and static compensators (STATCOM)",
          "Microgrid control strategies and energy storage link",
          "Net metering concepts and grid compliance standards",
        ],
        projects: ["Simulation of grid-tie solar inverter with active control in Simulink"],
      },
      {
        label: "Month 3 · Substation & Analysis",
        name: "ETAP Power System & Substation Design",
        topics: [
          "Introduction to ETAP — one line diagram construction",
          "Load flow analysis and short circuit calculations",
          "Protection coordination — relay settings, breaker sizing",
          "Smart substation automation — SCADA systems, IEC 61850",
          "Substation grounding grid designs (IEEE 80 standards)",
          "Smart meter integration and advanced metering infrastructure",
        ],
        projects: ["Industrial distribution grid load flow & protection coordination in ETAP"],
      },
    ],
    outcomes: [
      {
        title: "PV Yield Analysis",
        text: "Design PV systems and run detailed loss-yield reports using PVSyst.",
      },
      {
        title: "Grid Control Loop",
        text: "Design synchronization PLL control loops for grid-tied power electronics.",
      },
      {
        title: "Power System Modeling",
        text: "Perform short-circuit, load-flow, and grounding grid designs using ETAP.",
      },
    ],
    careers: [
      "Smart Grid Engineer",
      "Solar PV Designer",
      "Substation Engineer",
      "Power Systems Analyst",
      "SCADA Integrator",
    ],
  },
  {
    id: "eee3",
    track: "eee",
    title: "Industrial Automation, PLC & SCADA Systems",
    badge: "Industry",
    description:
      "Master industrial automation workflows. Learn PLC programming (Ladder, FBD), HMI design, SCADA systems configuration, and industrial networking.",
    tools: ["Siemens TIA Portal", "Wonderware SCADA", "PLC", "HMI"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Input", "Logic", "Visualize", "Network", "Automate"],
    phases: [
      {
        label: "Month 1 · PLC Architecture",
        name: "PLC Wiring & Ladder Logic",
        topics: [
          "PLC hardware components, memory layouts, I/O modules",
          "Wiring sensor inputs and actuator outputs to PLC",
          "Ladder Diagram (LD) and Function Block Diagram (FBD) rules",
          "Timers, counters, comparators, and math instructions",
          "Analog input scaling and temperature controller loops",
        ],
        projects: ["Pick and place robotic pneumatic arm control sequence on TIA Portal"],
      },
      {
        label: "Months 2–3 · SCADA & HMI",
        name: "HMI Interfacing & SCADA Networking",
        topics: [
          "HMI screen development — buttons, bars, alarms, trends",
          "Linking HMI variables to PLC data blocks",
          "SCADA server setup and database integration",
          "Industrial networking — Modbus, Profinet, OPC-UA",
          "System troubleshooting and alarm logs handling",
        ],
        projects: ["Substation monitoring SCADA system layout with alarm limits database"],
      },
    ],
    outcomes: [
      {
        title: "PLC Development",
        text: "Write PLC programs using TIA Portal for industrial systems.",
      },
      {
        title: "SCADA Engineering",
        text: "Design HMI panels and configure real-time SCADA servers.",
      },
      {
        title: "Network Protocols",
        text: "Implement Modbus/Profinet communication links between controllers.",
      },
    ],
    careers: [
      "Automation Engineer",
      "PLC Programmer",
      "SCADA Integrator",
      "Control System Technician",
    ],
  },
  {
    id: "eee4",
    track: "eee",
    title: "Power Electronics & Motor Control Drives",
    badge: "Specialist",
    description:
      "Design power converters, high-frequency switching circuits, and closed-loop motor control drives (FOC/DTC) for industrial applications.",
    tools: ["MATLAB", "Simulink", "Altium", "DSP Controllers"],
    duration: "4 Months",
    sessions: "48 Sessions",
    credits: "4 Credits",
    flow: ["Simulate", "Verify", "Schematic", "PCB", "Drive"],
    phases: [
      {
        label: "Months 1–2 · Converters",
        name: "DC-DC & AC-DC Converter Designs",
        topics: [
          "Semiconductor switching components (MOSFETs, IGBTs, SiC)",
          "Buck, Boost, Buck-Boost, and isolated Flyback converters",
          "Single-phase and three-phase inverter topologies",
          "Gate driver circuits and isolation design configurations",
          "Magnetics design — inductors, transformers sizing",
        ],
        projects: ["Simulink model and board design of 100W buck-boost converter"],
      },
      {
        label: "Months 3–4 · Motors",
        name: "AC Motor Drive Control Loops",
        topics: [
          "V/f control of three-phase induction motors",
          "Field Oriented Control (FOC) for PMSM/BLDC motors",
          "Space Vector PWM (SVPWM) generation logic",
          "Programming motor drive algorithms on DSP chips",
          "Hardware-in-the-loop test benches",
        ],
        projects: ["Real-time speed control of BLDC motor using DSP board controller"],
      },
    ],
    outcomes: [
      {
        title: "Converter Design",
        text: "Model and design power converters.",
      },
      {
        title: "Motor Dynamics",
        text: "Implement advanced vector control structures for PMSM motors.",
      },
      {
        title: "PCB Layout",
        text: "Route gate driver layouts and high-power tracks maintaining isolation standards.",
      },
    ],
    careers: [
      "Power Electronics Engineer",
      "Motor Drive Developer",
      "Analog Hardware Specialist",
      "Hardware Designer",
    ],
  },
  {
    id: "eee5",
    track: "eee",
    title: "Electrical Machine Design & CAD Modeling",
    badge: "Foundation",
    description:
      "Learn magnetic circuit design, slot-pole configuration, thermal profiling, and CAD modeling for transformers, induction motors, and alternators.",
    tools: ["Ansys Maxwell", "AutoCAD Electrical", "Simulink"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Sizing", "Drafting", "FEM", "Thermal", "Optimize"],
    phases: [
      {
        label: "Month 1 · CAD Drafting",
        name: "AutoCAD Electrical Schematic Design",
        topics: [
          "AutoCAD Electrical interface and symbol libraries",
          "Drafting single line diagrams and power schematics",
          "Panel layout drafting and terminal block configs",
          "Transformer rating parameters and core sizing",
          "Stator and rotor core slot sizing basics",
        ],
        projects: ["Electrical control panel layout for a water treatment pump station"],
      },
      {
        label: "Months 2–3 · Maxwell FEM",
        name: "Ansys Maxwell Electromagnetic Analysis",
        topics: [
          "2D/3D modeling of motors and magnets in Maxwell",
          "Defining transient and static magnetic boundary inputs",
          "Evaluating magnetic flux density and core saturation",
          "Calculating stator winding copper losses & core losses",
          "Transient torque and speed profiling calculations",
        ],
        projects: ["Electromagnetic design and efficiency optimization of 5kW Induction Motor"],
      },
    ],
    outcomes: [
      {
        title: "CAD Schematics",
        text: "Produce electrical power distribution drawings to standards.",
      },
      {
        title: "Maxwell FEM Analysis",
        text: "Solve electromagnetic fields to verify flux saturation points.",
      },
      {
        title: "Efficiency Rating",
        text: "Quantify stator/rotor losses and compute motor performance curves.",
      },
    ],
    careers: [
      "Machine Design Engineer",
      "Electrical CAD Draftsman",
      "FEM Analysis Specialist",
      "Development Engineer",
    ],
  },
  {
    id: "ece1",
    track: "ece",
    title: "VLSI Design & Digital System Verification",
    badge: "Core",
    description:
      "Deep dive into modern chip design, FPGA architecture, and digital system verification. Master Verilog/VHDL description, ASIC design flow, synthesis, and physical layout concepts.",
    tools: ["Verilog", "Vivado", "Cadence", "FPGA", "ASIC"],
    duration: "4 Months",
    sessions: "48 Sessions",
    credits: "4 Credits",
    flow: ["Design", "Simulate", "Verify", "Synthesize", "Implement"],
    phases: [
      {
        label: "Months 1–2 · Digital & RTL",
        name: "Digital System & Verilog Design",
        topics: [
          "Boolean algebra, logic gates, and combinational circuits",
          "Sequential circuits — flip-flops, registers, counters",
          "Verilog HDL syntax — structural, dataflow, behavioral",
          "Writing testbenches and simulation waveforms",
          "Finite State Machine (FSM) design patterns",
          "Memory architectures — RAM, ROM, FIFO buffers",
        ],
        projects: [
          "Verilog design of an 8-bit Arithmetic Logic Unit (ALU)",
          "Synchronous FIFO memory controller with testbench",
        ],
      },
      {
        label: "Month 3 · Synthesis & FPGA",
        name: "FPGA Prototyping & Vivado Flow",
        topics: [
          "FPGA architecture — LUTs, CLBs, interconnects, DSP blocks",
          "Xilinx Vivado design suite workflow",
          "Logic synthesis and physical placement constraints",
          "Static Timing Analysis (STA) and clock domain crossings",
          "Hardware validation on Xilinx Basys3/Nexys boards",
          "debugging IP cores and logic analyzers",
        ],
        projects: ["FPGA implementation of a digital clock and frequency divider"],
      },
      {
        label: "Month 4 · Verification & ASIC",
        name: "SystemVerilog & Verification Basics",
        topics: [
          "Introduction to SystemVerilog verification constructs",
          "ASIC design flow — RTL to GDSII layout steps",
          "Timing optimization and power reduction techniques",
          "DFT (Design for Test) concepts and boundary scans",
          "Industry case study — RISC-V processor architecture",
          "Physical design, routing, and DRC/LVS checks",
        ],
        projects: ["ASIC synthesis report and physical layout design of ALU"],
      },
    ],
    outcomes: [
      {
        title: "ASIC/FPGA Design",
        text: "Implement digital circuits in Verilog and synthesize them onto FPGAs.",
      },
      {
        title: "Timing & Constraints",
        text: "Resolve timing violations and define timing constraints for complex clock domains.",
      },
      {
        title: "RTL Verification",
        text: "Construct testbenches to validate hardware components prior to manufacturing.",
      },
    ],
    careers: [
      "VLSI Design Engineer",
      "RTL Design Engineer",
      "FPGA Prototyping Engineer",
      "ASIC Verification Engineer",
    ],
  },
  {
    id: "ece2",
    track: "comm",
    title: "Embedded Systems & IoT Solutions Architecture",
    badge: "Industry",
    description:
      "Bridge the physical and digital worlds. Learn microcontroller architectures (ARM Cortex, ESP32), sensor interfacing, RTOS concepts, wireless protocols (BLE, Wi-Fi, LoRa), and cloud IoT integrations.",
    tools: ["C/C++", "ESP32", "FreeRTOS", "MQTT", "Embedded C"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Wire", "Code", "Interface", "Connect", "Deploy"],
    phases: [
      {
        label: "Month 1 · Embedded Firmware",
        name: "Embedded C & Microcontrollers",
        topics: [
          "C/C++ for embedded applications, pointer arrays, bitwise",
          "ESP32 microcontroller architecture and GPIO pinout",
          "Serial communication protocols — I2C, SPI, UART",
          "ADC/DAC configuration and analog sensor interfacing",
          "Interrupt handling and hardware timers",
          "Power management, sleep modes, and flash storage",
        ],
        projects: ["Multi-sensor data logger with ESP32 and microSD interface"],
      },
      {
        label: "Month 2 · RTOS & Protocols",
        name: "FreeRTOS & Wireless Systems",
        topics: [
          "Multitasking concepts and RTOS schedulers",
          "FreeRTOS task creation, priority, and states",
          "Task synchronization — semaphores, queues, and mutexes",
          "Wi-Fi and BLE stack configuration on ESP32",
          "MQTT protocol for secure, low-overhead IoT telemetry",
          "HTTP REST endpoints integration for device firmware",
        ],
        projects: ["Real-time industrial sensor hub with FreeRTOS and MQTT"],
      },
      {
        label: "Month 3 · Cloud IoT Integration",
        name: "End-to-End IoT Solutions",
        topics: [
          "Connecting ESP32 to AWS IoT Core / ThingSpeak cloud",
          "Secure TLS socket connection and certificate provisioning",
          "Over-The-Air (OTA) firmware update architecture",
          "IoT web/mobile dashboard design with Node-RED",
          "Hardware-in-the-loop (HIL) testing workflows",
          "Troubleshooting and power profiling IoT hardware",
        ],
        projects: ["Deployable IoT home automation hub with OTA and dashboard"],
      },
    ],
    outcomes: [
      {
        title: "Firmware Engineering",
        text: "Write efficient C/C++ drivers for sensors, displays, and communication chips.",
      },
      {
        title: "RTOS Scheduling",
        text: "Deploy FreeRTOS to manage concurrent tasks, interrupt callbacks, and shared resources.",
      },
      {
        title: "IoT Integrations",
        text: "Connect embedded nodes to cloud servers via secure MQTT and design control panels.",
      },
    ],
    careers: [
      "Embedded Firmware Engineer",
      "IoT Systems Architect",
      "Microcontroller Programmer",
      "Hardware Validation Specialist",
    ],
  },
  {
    id: "ece3",
    track: "ece",
    title: "Digital Signal & Image Processing with MATLAB",
    badge: "Foundation",
    description:
      "Understand frequency analysis, filter design (FIR/IIR), speech synthesis, computer vision filters, and real-time signal processing algorithms.",
    tools: ["MATLAB", "Simulink", "Python", "OpenCV"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Sample", "Filter", "Transform", "Feature", "Output"],
    phases: [
      {
        label: "Month 1 · Signal Basics",
        name: "Signal Transforms & Filter Designs",
        topics: [
          "Discrete-time signals, sampling theorem, quantization",
          "Z-transform and Discrete Fourier Transform (DFT)",
          "Fast Fourier Transform (FFT) analysis",
          "Design of FIR and IIR digital filters in MATLAB",
          "Filter realization structures and quantization effects",
        ],
        projects: ["Real-time audio noise filtering module in MATLAB"],
      },
      {
        label: "Months 2–3 · Image & CV",
        name: "Image Enhancement & Computer Vision",
        topics: [
          "Digital image representation, colorspaces, pixel operations",
          "Image enhancement — histogram equalization, spatial filtering",
          "Edge detection algorithms (Sobel, Canny, Laplacian)",
          "Morphological operations and object segmentation",
          "Computer vision libraries — Python OpenCV integration",
        ],
        projects: ["Automated license plate region extractor using OpenCV edge filters"],
      },
    ],
    outcomes: [
      {
        title: "DSP Implementations",
        text: "Design and simulate digital filters (FIR/IIR) in MATLAB.",
      },
      {
        title: "Image Processing",
        text: "Deploy OpenCV operators for edge detection and thresholding.",
      },
      {
        title: "Computer Vision",
        text: "Extract geometric and texture features to build object identification workflows.",
      },
    ],
    careers: [
      "DSP Engineer",
      "Computer Vision Specialist",
      "Algorithm Developer",
      "Validation Engineer",
    ],
  },
  {
    id: "ece4",
    track: "comm",
    title: "Wireless Communication & 5G Network Technology",
    badge: "Specialist",
    description:
      "Study wireless propagation, MIMO systems, beamforming, OFDMA modulation, 5G NR physical layer, and network architecture.",
    tools: ["MATLAB", "NS-3", "SDR (Software Defined Radio)"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Propagate", "Modulate", "Transmit", "Receive", "Analyze"],
    phases: [
      {
        label: "Month 1 · Telecom Basics",
        name: "Wireless Channels & Modulations",
        topics: [
          "Fading channel models — Rayleigh, Rician, path loss",
          "Digital modulations — QAM, PSK, and BER analysis",
          "Orthogonal Frequency Division Multiplexing (OFDM) logic",
          "Error control coding — Reed-Solomon, Turbo, LDPC codes",
          "Simulating transceiver links in MATLAB",
        ],
        projects: ["MATLAB simulation of an OFDM transceiver under Rayleigh fading"],
      },
      {
        label: "Months 2–3 · 5G NR Flow",
        name: "MIMO, 5G Architecture & NS-3",
        topics: [
          "Multi-Antenna systems (MIMO) & spatial multiplexing",
          "Beamforming concepts and channel estimation",
          "5G NR physical channels, numerology, and frame structure",
          "5G network architecture — gNodeB, UPF, AMF core elements",
          "Network simulator (NS-3) packet routing simulation",
        ],
        projects: ["NS-3 simulation of packet throughput in 5G micro-cell network"],
      },
    ],
    outcomes: [
      {
        title: "OFDM System Design",
        text: "Model OFDM transceivers and calculate Bit Error Rate (BER) curves in MATLAB.",
      },
      {
        title: "5G Architecture",
        text: "Analyze the physical layer parameters of 5G networks.",
      },
      {
        title: "Network Simulation",
        text: "Model packet latency, drop-rate, and traffic routing in NS-3 clusters.",
      },
    ],
    careers: [
      "Telecom Engineer",
      "5G Systems Specialist",
      "RF Engineer",
      "Network Analyst",
      "Wireless Systems Developer",
    ],
  },
  {
    id: "ece5",
    track: "ece",
    title: "PCB Design & Hardware Prototyping",
    badge: "Foundation",
    description:
      "Master schematic capture, multi-layer PCB layout routing, signal integrity check, thermal relief, and manufacturing Gerber file exports.",
    tools: ["Altium Designer", "KiCad", "Multisim"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Schematic", "Layout", "Route", "Verify", "Export"],
    phases: [
      {
        label: "Month 1 · Schematic",
        name: "Schematic Capture & Simulation",
        topics: [
          "Altium Designer interface and library setup",
          "Creating schematic symbols and linking footprints",
          "Drawing schematics, placing ports, and wire connections",
          "SPICE simulation basics in Multisim",
          "Design Rule Check (DRC) on schematics",
        ],
        projects: ["Schematic design of an adjustable switching power supply unit"],
      },
      {
        label: "Months 2–3 · Layout",
        name: "PCB Layout Routing & Gerber generation",
        topics: [
          "Transferring schematic to board layout layout",
          "Component placement strategies for signal flow",
          "Multi-layer board configurations & ground planes",
          "Routing trace width guidelines for high currents",
          "Gerber files, NC drill logs, and BOM generation",
        ],
        projects: ["Double-layer PCB layout routing for an STM32 development board"],
      },
    ],
    outcomes: [
      {
        title: "Schematic Capture",
        text: "Convert paper circuits into footprints-linked Altium schematics.",
      },
      {
        title: "PCB Layout Routing",
        text: "Route multi-layer PCBs satisfying mechanical boundaries and clearance guidelines.",
      },
      {
        title: "Gerber Exporting",
        text: "Compile Gerber files and drilling tables ready for manufacture.",
      },
    ],
    careers: ["PCB Layout Engineer", "Hardware Developer", "EDA Draftsman", "Hardware Prototyper"],
  },
  {
    id: "chem1",
    track: "chem",
    title: "Process Simulation & Piping Engineering",
    badge: "Core",
    description:
      "Master process design and simulation using industry-standard Aspen Plus and HYSYS. Learn to model thermodynamic states, heat exchangers, distillation columns, piping layouts, and plant utilities.",
    tools: ["Aspen Plus", "Aspen HYSYS", "AutoCAD Plant 3D", "P&ID"],
    duration: "4 Months",
    sessions: "48 Sessions",
    credits: "4 Credits",
    flow: ["Model", "Simulate", "Design", "Draft", "Verify"],
    phases: [
      {
        label: "Months 1–2 · Simulation",
        name: "Aspen Plus & HYSYS Modeling",
        topics: [
          "Thermodynamic property packages selection (Peng-Robinson, NRTL)",
          "Pure component definition and hypothetical compounds",
          "Material and energy balances in Aspen Plus",
          "Modeling unit operations — mixers, splitters, flash drums",
          "Distillation column modeling (DSTWU vs RadFrac)",
          "Reactor modeling — stoichiometric, yield, equilibrium",
        ],
        projects: [
          "Thermodynamic phase envelope model for natural gas",
          "RadFrac column simulation for ethanol-water separation",
        ],
      },
      {
        label: "Month 3 · Heat Exchangers & Piping",
        name: "Heat Integration & Piping Design",
        topics: [
          "Shell and tube heat exchanger rating in Aspen EDR",
          "Process flow diagram (PFD) and P&ID drafting standards",
          "Control valve sizing and pressure drop calculations",
          "Piping design fundamentals — ASME B31.3 codes",
          "Pipe sizing, schedule calculation, and pressure drop",
          "Piping materials spec sheet generation",
        ],
        projects: ["Thermal design of shell-and-tube heat exchanger in Aspen EDR"],
      },
      {
        label: "Month 4 · Plant Layout & AutoCAD",
        name: "Plant 3D Drafting & Isometric Layouts",
        topics: [
          "AutoCAD Plant 3D workspace and project setup",
          "Equipment modeling — pumps, vessels, structures in 3D",
          "Routing pipes, inserting inline valves, fittings, instruments",
          "Generating piping isometric drawings and BOMs",
          "Clash check in 3D layouts, structural clearance checks",
          "Technical project package formatting",
        ],
        projects: ["Complete 3D model of a distillation plant section with ISO drawings"],
      },
    ],
    outcomes: [
      {
        title: "Process Engineering",
        text: "Simulate complex multi-stage distillation column systems and chemical reactors in Aspen.",
      },
      {
        title: "Piping & Instrument Layout",
        text: "Draft comprehensive P&IDs and build 3D piping routing layouts in AutoCAD Plant 3D.",
      },
      {
        title: "Thermal Equipment Sizing",
        text: "Design and rate heat exchangers according to standard ASME codes and process specs.",
      },
    ],
    careers: [
      "Process Simulation Engineer",
      "Chemical Design Engineer",
      "Plant Piping Designer",
      "ASME Sizing Analyst",
    ],
  },
  {
    id: "chem2",
    track: "chem",
    title: "Industrial Effluent Treatment & Green Process Design",
    badge: "Industry",
    description:
      "Understand the design of industrial wastewater treatment plants, zero-liquid discharge (ZLD) systems, air pollution control, and sustainable green chemical processes that meet environmental standards.",
    tools: ["GPS-X", "Aspen Plus", "AutoCAD", "EHS Compliance"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Analyze", "Design", "Model", "Scale", "Comply"],
    phases: [
      {
        label: "Month 1 · ETP Foundations",
        name: "Effluent Characterization & Physical Processes",
        topics: [
          "Industrial wastewater parameters — COD, BOD, TSS, TDS, pH",
          "ETP process flowsheet design — physical & chemical steps",
          "Design of screen chambers, grit channels, oil traps",
          "Coagulation-flocculation reactions & clarifier sizing",
          "Chemical dosing calculations, neutralisation tank design",
          "Sludge thickener, filter press sizing calculations",
        ],
        projects: ["ETP process design report and mass balance for a textile mill"],
      },
      {
        label: "Month 2 · Biological Treatment & Modeling",
        name: "Biological Reactors & GPS-X Simulation",
        topics: [
          "Kinetics of biological growth — Monod equation parameters",
          "Activated sludge process (ASP) reactor calculations",
          "Moving Bed Bio-Reactor (MBBR) & SBR systems design",
          "GPS-X software setup for wastewater simulation",
          "Steady-state simulation of biological bioreactors",
          "Aeration system requirements & dissolved oxygen calculations",
        ],
        projects: ["GPS-X biological simulator model of an ASP plant"],
      },
      {
        label: "Month 3 · Advanced Treatment & Green Design",
        name: "Zero-Liquid Discharge & Green Processes",
        topics: [
          "Membrane filtration — Ultrafiltration, Reverse Osmosis sizing",
          "Multi-Effect Evaporator (MEE) & ATFD sizing for ZLD",
          "EHS compliance, environmental clearance documentation in India",
          "Green chemical process principles — atom economy, life cycle",
          "Carbon footprint calculation methodologies",
          "Sustainable raw material substitution, process efficiency improvements",
        ],
        projects: ["Zero-Liquid Discharge (ZLD) design layout and mass balance report"],
      },
    ],
    outcomes: [
      {
        title: "ETP Process Design",
        text: "Develop wastewater plant flowsheets and size physical, chemical, and biological reactors.",
      },
      {
        title: "Bio-Reactor Modeling",
        text: "Simulate activated sludge and MBBR bio-treatment efficiency in GPS-X.",
      },
      {
        title: "Environmental Compliance",
        text: "Model Zero-Liquid Discharge systems and compile EHS audit documentation.",
      },
    ],
    careers: [
      "Environmental Process Engineer",
      "ETP Design Engineer",
      "Water Treatment Consultant",
      "EHS Compliance Specialist",
    ],
  },
  {
    id: "chem3",
    track: "chem",
    title: "Petroleum Refinery & Petrochemical Processes",
    badge: "Foundation",
    description:
      "Model crude distillation columns, FCC reactors, hydrotreaters, steam reformers, and petrochemical synthesis pipelines.",
    tools: ["Aspen HYSYS", "Petro-Sim", "Excel"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Characterize", "Simulate", "Fractionate", "React", "Refine"],
    phases: [
      {
        label: "Month 1 · Crude Characterization",
        name: "Crude Assay & HYSYS Setup",
        topics: [
          "Crude oil composition, TBP, ASTM distillation assays",
          "Importing assay data into Aspen HYSYS petroleum interface",
          "Generating pseudocomponents and light end fractions",
          "Thermodynamic models for oil refining (Peng-Robinson, Chao-Seader)",
          "Atmospheric Distillation Unit (ADU) flowsheets configuration",
        ],
        projects: ["Assay characterization and true boiling point curve modeling in HYSYS"],
      },
      {
        label: "Months 2–3 · Refining",
        name: "Secondary Conversion & Gas Processing",
        topics: [
          "Vacuum Distillation Unit (VDU) modeling & sizing",
          "Hydrotreating and catalytic reforming reactions",
          "Fluid Catalytic Cracking (FCC) unit dynamics",
          "Petrochemical building blocks — ethylene & propylene synthesis",
          "Refinery utility systems and steam balance models",
        ],
        projects: ["Simulation of ADU column with side-strippers and product returns"],
      },
    ],
    outcomes: [
      {
        title: "Refinery Simulation",
        text: "Characterize raw crude assays and simulate atmospheric distillation columns.",
      },
      {
        title: "Conversion Reactor Modeling",
        text: "Model secondary cracking and reforming reactors in petroleum flowsheets.",
      },
      {
        title: "Petrochemical Synthesis",
        text: "Evaluate process loops for main monomers production.",
      },
    ],
    careers: [
      "Refinery Process Engineer",
      "HYSYS Modeler",
      "Petrochemical Specialist",
      "Consulting Engineer",
    ],
  },
  {
    id: "chem4",
    track: "chem",
    title: "Polymer Engineering & Plastics Technology",
    badge: "Specialist",
    description:
      "Understand polymerization reactors, polymer extrusion/injection molding process design, material characterization, and biodegradable plastics.",
    tools: ["Moldflow", "SolidWorks", "Aspen Plus"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Synthesize", "Characterize", "Model", "Mold", "Test"],
    phases: [
      {
        label: "Month 1 · Polymerization",
        name: "Polymer Chemistry & Reactor Sizing",
        topics: [
          "Step-growth & chain-growth polymerization kinetics",
          "Industrial reactors for polymer production (CSTR, batch, loop)",
          "Molecular weight distribution (MWD) calculations",
          "Characterization methods — DSC, TGA, melt flow index (MFI)",
          "Properties of thermoplastic and thermosetting materials",
        ],
        projects: ["Sizing calculation and kinetics simulation for a polystyrene reactor loop"],
      },
      {
        label: "Months 2–3 · Molding",
        name: "Extrusion & Moldflow Simulation",
        topics: [
          "Polymer extrusion screw geometry & die operations",
          "Injection molding machine parameters & defects",
          "Designing plastic parts using SolidWorks draft guidelines",
          "Autodesk Moldflow mold filling and cooling simulations",
          "Biodegradable polymer compounding techniques",
        ],
        projects: ["Moldflow simulation and gate location optimize report for a plastic component"],
      },
    ],
    outcomes: [
      {
        title: "Reactor Kinetics",
        text: "Calculate kinetics parameters and size polymerization reactors.",
      },
      {
        title: "Molding Simulations",
        text: "Run mold filling and warp simulations in Moldflow to optimize processes.",
      },
      {
        title: "Green Polymers",
        text: "Determine specs and compounding recipes for bio-plastics.",
      },
    ],
    careers: [
      "Polymer Design Engineer",
      "Molding Consultant",
      "Compounding Chemist",
      "Process Sizing Specialist",
    ],
  },
  {
    id: "chem5",
    track: "chem",
    title: "Biochemical Engineering & Bioprocess Design",
    badge: "Specialist",
    description:
      "Model fermenters, bioreactors, separation process scale-up (chromatography, filtration), and enzymatic pathway reaction kinetics.",
    tools: ["SuperPro Designer", "MATLAB", "Aspen Plus"],
    duration: "3 Months",
    sessions: "36 Sessions",
    credits: "3 Credits",
    flow: ["Enzyme", "Culture", "Ferment", "Filter", "Purify"],
    phases: [
      {
        label: "Month 1 · Bioreactors",
        name: "Enzyme Kinetics & Fermenter Sizing",
        topics: [
          "Michaelis-Menten enzyme kinetics equations",
          "Cell growth kinetics — Monod models, yield factors",
          "Aseptic design, sterilization cycles calculations",
          "Bioreactor geometry design — stirred tank, airlift, packed bed",
          "Aeration and agitation power consumption sizing",
        ],
        projects: ["Sizing and oxygen mass transfer calculations for 10,000L fermenter"],
      },
      {
        label: "Months 2–3 · Downstream",
        name: "Downstream Purification & SuperPro Design",
        topics: [
          "Cell disruption techniques (homogenizers, microfluidizers)",
          "Centrifugation and rotary vacuum filtration sizing",
          "Industrial chromatography column modeling",
          "SuperPro Designer bioprocess flowsheet modeling",
          "Economic evaluations and scheduling of batch bioprocesses",
        ],
        projects: ["SuperPro simulation model for the production of penicillin batch"],
      },
    ],
    outcomes: [
      {
        title: "Bioreactor Kinetics",
        text: "Design batch/fed-batch fermentation runs and compute oxygen transfer rates.",
      },
      {
        title: "Downstream Sizing",
        text: "Size filtration, centrifugation, and chromatography columns for purification.",
      },
      {
        title: "Batch Process Modeling",
        text: "Construct complete bio-pharmaceutical process models in SuperPro Designer.",
      },
    ],
    careers: [
      "Bioprocess Engineer",
      "Biotech Process Analyst",
      "Downstream Sizing Chemist",
      "Simulation Specialist",
    ],
  },
];
