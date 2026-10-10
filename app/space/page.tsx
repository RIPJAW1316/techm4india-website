/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */
import {
  ArrowLink,
  EditorialList,
  PageHero,
  PartnershipCTA,
  PeopleGrid,
  SectionHeading,
  StatRow,
} from "../components/Shared";
import { StructuredData } from "../components/StructuredData";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "TechM4Space | Space Education & Innovation",
  description:
    "TechM4Space delivers space education, CubeSat design, and aerospace innovation initiatives inspiring the next generation.",
  path: "/space",
});

const labs = [
  {
    title: "CanSat development lab",
    text: "Design a compact mission, balance a payload and learn to think in systems.",
  },
  {
    title: "CubeSat technology lab",
    text: "Explore the architecture, electronics and communication that make a small satellite work.",
  },
  {
    title: "Rocket & propulsion lab",
    text: "Understand the forces, materials and decisions behind a launch.",
  },
  {
    title: "Drone & aerial systems lab",
    text: "Build a practical relationship with flight, control and the world below.",
  },
  {
    title: "Advanced research lab",
    text: "A place for the question that does not fit neatly into a syllabus.",
  },
  {
    title: "Space communication lab",
    text: "Trace the signal from a piece of hardware to a mission that depends on it.",
  },
];

const layers = [
  "Physical innovation labs",
  "Curriculum-integrated modules",
  "Student development programs",
  "Hands-on learning kits",
  "Digital platforms",
];

const outcomes = [
  "Satellite architecture mastery",
  "Rocket propulsion understanding",
  "Space communication systems",
  "Aerospace engineering practice",
  "Systems thinking & mission design",
  "Innovation & research output",
];

const kits = [
  "CanSat student kit",
  "CubeSat learning kit",
  "Rocket science kit",
  "Drone technology kit",
  "Space systems kit",
];

export default function SpacePage() {
  return (
    <main className="inner-page space-page">
      <PageHero
        eyebrow="TechM4Space · Aerospace learning"
        title={
          <>
            Build real satellites. <em>Launch real rockets.</em>
          </>
        }
        description="A professional aerospace innovation ecosystem for universities and schools, built around hardware, mission thinking and the discipline of learning by doing."
        image="/images/space/hero.webp"
        imageAlt="Indian launch vehicle rising through a blue sky"
        credit="Launch imagery: ISRO / Department of Space"
        className="page-hero-space"
      />

      <section className="space-intro section shell">
        <div className="space-intro-copy" data-reveal>
          <p className="section-kicker">
            <span>01 / The horizon</span>
          </p>
          <h2>
            Space is not only somewhere we go. It is a way of learning to <em>think.</em>
          </h2>
          <p>
            TechM4Space brings the patience, precision and shared responsibility of aerospace
            engineering into the everyday learning environment.
          </p>
          <ArrowLink href="/contact">Build a space pathway</ArrowLink>
        </div>
        <StatRow
          items={[
            { value: "6", label: "Aerospace labs" },
            { value: "5", label: "Innovation layers" },
            { value: "5", label: "Hands-on learning kits" },
            { value: "6", label: "Capability outcomes" },
          ]}
        />
      </section>

      <section className="space-image-story section">
        <div className="shell space-story-grid">
          <div className="space-story-image image-frame" data-reveal>
            <img
              src="/images/space/hardware.webp"
              alt="Space hardware inside a test chamber"
              loading="lazy"
            />
            <span>Real hardware. Real questions.</span>
          </div>
          <div className="space-story-copy" data-reveal>
            <p className="section-kicker section-kicker-light">
              <span>02 / Physical innovation labs</span>
            </p>
            <h2>
              Make the invisible <em>testable.</em>
            </h2>
            <p>
              A satellite is a conversation between structures, power, communication and purpose.
              The lab gives students a way to hold that conversation in their hands.
            </p>
            <ArrowLink href="/contact" light>
              Explore lab partnerships
            </ArrowLink>
          </div>
        </div>
      </section>

      <section className="space-labs section shell">
        <SectionHeading
          eyebrow="03 / The six labs"
          title={
            <>
              A mission has many <em>moving parts.</em>
            </>
          }
          text="Each lab is a doorway into the larger discipline of aerospace systems."
        />
        <div className="space-lab-grid">
          {labs.map((lab, index) => (
            <article key={lab.title} data-reveal>
              <span>0{index + 1}</span>
              <h3>{lab.title}</h3>
              <p>{lab.text}</p>
              <i aria-hidden="true">↗</i>
            </article>
          ))}
        </div>
      </section>

      <section className="space-assembly section shell">
        <div className="space-assembly-copy" data-reveal>
          <p className="section-kicker">
            <span>04 / Curriculum to orbit</span>
          </p>
          <h2>
            From a learning kit to a <em>systems mindset.</em>
          </h2>
          <p>
            Five connected layers let an institution move from a memorable workshop to a sustained
            aerospace learning culture.
          </p>
        </div>
        <div className="space-layers">
          {layers.map((layer, index) => (
            <div key={layer} data-reveal>
              <span>0{index + 1}</span>
              <strong>{layer}</strong>
              <i aria-hidden="true">↗</i>
            </div>
          ))}
        </div>
      </section>

      <section className="space-outcomes section">
        <div className="shell">
          <SectionHeading
            eyebrow="05 / Outcomes"
            title={
              <>
                The destination is capability, <em>not spectacle.</em>
              </>
            }
            text="Aerospace learning should leave students with habits they can carry into any complex system."
            align="center"
          />
          <div className="outcomes-grid">
            {outcomes.map((outcome, index) => (
              <div key={outcome} data-reveal>
                <span>0{index + 1}</span>
                <h3>{outcome}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-kits section shell">
        <div className="space-kits-image image-frame" data-reveal>
          <img
            src="/images/space/assembly.jpeg"
            alt="Rocket hardware assembly detail"
            loading="lazy"
          />
        </div>
        <div className="space-kits-copy" data-reveal>
          <p className="section-kicker">
            <span>06 / Hands-on kits</span>
          </p>
          <h2>
            Begin with something you can <em>hold.</em>
          </h2>
          <EditorialList
            numbered={false}
            items={kits.map((kit) => ({
              title: kit,
              text: "A guided entry point into mission design, experimentation and shared problem-solving.",
            }))}
          />
        </div>
      </section>

      <section className="space-benefits section shell">
        <SectionHeading
          eyebrow="07 / For institutions"
          title={
            <>
              Aerospace can become a <em>strategic advantage.</em>
            </>
          }
        />
        <div className="benefit-grid">
          {[
            "Practice beyond the syllabus",
            "Cross-disciplinary projects",
            "Research readiness",
            "A distinctive student experience",
            "Industry-facing portfolios",
            "Startup & innovation culture",
          ].map((benefit, index) => (
            <div key={benefit} data-reveal>
              <span>0{index + 1}</span>
              <h3>{benefit}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="space-team section shell">
        <SectionHeading
          eyebrow="08 / The shared team"
          title={
            <>
              Ambition is a team <em>sport.</em>
            </>
          }
        />
        <PeopleGrid compact />
      </section>

      <PartnershipCTA
        eyebrow="Space partnerships"
        title={
          <>
            Give the next mission a <em>place to begin.</em>
          </>
        }
        text="Bring aerospace into your institution through a program built around real hardware, thoughtful mentorship and a long horizon."
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Space", path: "/space" },
        ])}
      />
    </main>
  );
}
