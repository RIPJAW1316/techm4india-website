/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */
import {
  ArrowLink,
  EditorialList,
  PageHero,
  PartnershipCTA,
  SectionHeading,
} from "../components/Shared";
import { StructuredData } from "../components/StructuredData";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "TechM4Engineering | Engineering Innovation Programs",
  description:
    "TechM4Engineering offers industry-ready engineering innovation programs for students and professionals to build future-ready skills.",
  path: "/engineering",
});

const pathways = [
  {
    title: "Civil engineering",
    text: "Structural design, BIM, digital construction, infrastructure and geotechnical foundations.",
    tools: "Revit · STAAD Pro · ETABS · AutoCAD · Civil 3D",
  },
  {
    title: "Mechanical engineering",
    text: "Simulation, product design, manufacturing, fluids and CNC workflows.",
    tools: "ANSYS · HyperMesh · SolidWorks · CFD · CAM",
  },
  {
    title: "Computer science",
    text: "Full-stack systems, artificial intelligence, data engineering, cloud and cybersecurity.",
    tools: "React · Node.js · AWS · Docker · Python",
  },
  {
    title: "Electrical engineering",
    text: "Electric mobility, smart grids, renewable energy, automation and power electronics.",
    tools: "MATLAB · Simulink · ETAP · PLC · SCADA",
  },
  {
    title: "Electronics engineering",
    text: "VLSI design, digital verification, signal processing and hardware prototyping.",
    tools: "Verilog · Vivado · Cadence · Altium",
  },
  {
    title: "Communication engineering",
    text: "Embedded systems, IoT solutions and the networks that connect them.",
    tools: "C/C++ · FreeRTOS · IoT protocols · 5G",
  },
  {
    title: "Chemical engineering",
    text: "Process simulation, green process design, polymers and bioprocess systems.",
    tools: "Aspen Plus · HYSYS · Plant 3D · GPS-X",
  },
];

const programs = [
  {
    title: "Engineering foundations & digital tools",
    text: "Build a strong base before the complexity arrives.",
  },
  {
    title: "Structural analysis & simulation",
    text: "Move from a drawing to a decision through analysis.",
  },
  {
    title: "Advanced simulation & BIM workflows",
    text: "Coordinate digital models with real project logic.",
  },
  {
    title: "MoU-based institute programs",
    text: "Embed a credit-ready pathway into the institution itself.",
  },
];

const tools = [
  "Revit",
  "STAAD Pro",
  "ANSYS",
  "HyperMesh",
  "SolidWorks",
  "MATLAB",
  "Simulink",
  "ETAP",
  "React",
  "Node.js",
  "Python",
  "AWS",
  "Docker",
  "Verilog",
  "Vivado",
  "Cadence",
  "Altium",
  "Aspen Plus",
  "Plant 3D",
  "AutoCAD",
  "Civil 3D",
  "ETABS",
  "C/C++",
  "FreeRTOS",
];

export default function EngineeringPage() {
  return (
    <main className="inner-page engineering-page">
      <PageHero
        eyebrow="TechM4Engineering · Industry-ready learning"
        title={
          <>
            Engineering India&apos;s industrial future through <em>hands-on innovation.</em>
          </>
        }
        description="Master the tools and habits of modern engineering through real-world projects, structured mentorship and institute-level lab programs."
        image="/images/engineering/hero.jpeg"
        imageAlt="Engineer working with industrial equipment in a laboratory"
      />

      <section className="engineering-manifesto section shell">
        <div data-reveal>
          <p className="section-kicker">
            <span>01 / The method</span>
          </p>
          <h2>
            Learn → Design → Analyze → Build → <em>Implement.</em>
          </h2>
        </div>
        <p data-reveal>
          Engineering becomes a vocation when students can see the relationship between a concept, a
          tool, a constraint and a working result. Our programs are structured around that movement.
        </p>
      </section>

      <section className="pathways-section section">
        <div className="shell">
          <SectionHeading
            eyebrow="02 / Engineering pathways"
            title={
              <>
                Seven disciplines. <em>One standard of practice.</em>
              </>
            }
            text="Choose a pathway, then go deep enough to build confidence with the tools, workflows and decisions that define the discipline."
          />
          <div className="pathway-list">
            {pathways.map((pathway, index) => (
              <article className="pathway-row" key={pathway.title} data-reveal>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{pathway.title}</h3>
                  <p>{pathway.text}</p>
                </div>
                <p className="pathway-tools">{pathway.tools}</p>
                <ArrowLink href="/contact">Explore pathway</ArrowLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="engineering-feature section">
        <div className="engineering-feature-image image-frame" data-reveal>
          <img
            src="/images/engineering/robotics.jpeg"
            alt="Engineers working on a robotic machine"
            loading="lazy"
          />
          <span>Build with the constraints in view.</span>
        </div>
        <div className="engineering-feature-copy" data-reveal>
          <p className="section-kicker">
            <span>03 / Featured studio</span>
          </p>
          <h2>
            From a brief to a <em>working system.</em>
          </h2>
          <p>
            Live project studios make the invisible parts of engineering visible: assumptions,
            trade-offs, documentation, testing and the discipline to make one more iteration.
          </p>
          <ul className="check-list">
            <li>Project-based learning with a clear outcome</li>
            <li>Mentors who explain the why behind the tool</li>
            <li>Assessment through work, not only recall</li>
          </ul>
          <ArrowLink href="/contact">Design an institute program</ArrowLink>
        </div>
      </section>

      <section className="tools-section section">
        <div className="shell">
          <SectionHeading
            eyebrow="04 / The working toolkit"
            title={
              <>
                Tools are not the destination. They are the <em>doorway.</em>
              </>
            }
            text="A practical, changing toolkit gives students a language for the industries they want to enter."
          />
          <div className="tool-cloud" aria-label="Engineering tools">
            {tools.map((tool, index) => (
              <span key={tool} data-reveal>
                {String(index + 1).padStart(2, "0")} {tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="engineering-labs section shell">
        <div className="engineering-lab-image image-frame" data-reveal>
          <img
            src="/images/engineering/laboratory.jpeg"
            alt="Students collaborating in a science laboratory"
            loading="lazy"
          />
        </div>
        <div className="engineering-lab-copy" data-reveal>
          <p className="section-kicker">
            <span>05 / Beyond the classroom</span>
          </p>
          <h2>
            Infrastructure that lets <em>curiosity persist.</em>
          </h2>
          <EditorialList
            numbered={false}
            items={[
              {
                title: "Institute-embedded labs",
                text: "Physical and digital environments that make experimentation part of the semester.",
              },
              {
                title: "Credit-aware pathways",
                text: "Programs that can sit alongside existing academic structures rather than compete with them.",
              },
              {
                title: "Mentorship & project studios",
                text: "Guidance that moves from a first question to a defensible result.",
              },
            ]}
          />
        </div>
      </section>

      <section className="engineering-programs section shell">
        <SectionHeading
          eyebrow="06 / Program architecture"
          title={
            <>
              A pathway with enough room to <em>grow.</em>
            </>
          }
        />
        <div className="program-grid">
          {programs.map((program, index) => (
            <article key={program.title} data-reveal>
              <span>0{index + 1}</span>
              <h3>{program.title}</h3>
              <p>{program.text}</p>
            </article>
          ))}
        </div>
      </section>

      <PartnershipCTA
        eyebrow="Engineering partnerships"
        title={
          <>
            Give your students a place to <em>build seriously.</em>
          </>
        }
        text="Bring a department, a cohort or an institution-wide ambition. We will help shape the labs, mentors and program rhythm around it."
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Engineering", path: "/engineering" },
        ])}
      />
    </main>
  );
}
