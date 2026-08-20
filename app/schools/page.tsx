import Link from "next/link";
import { ArrowLink, EditorialList, PageHero, PartnershipCTA, PeopleGrid, SectionHeading, StatRow } from "../components/Shared";
import { StructuredData } from "../components/StructuredData";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "TechM4Schools | Experiential Learning Platform",
  description:
    "TechM4Schools offers experiential K-12 learning programs in AI, robotics, coding, and drones for future innovators.",
  path: "/schools",
});

const pillars = [
  { title: "Skill-based curriculum", text: "Learning that builds a usable language for the technologies shaping the world around students." },
  { title: "Experiential learning", text: "A brief, a kit, a team, a prototype and the confidence that comes from trying." },
  { title: "Composite skill laboratories", text: "Spaces where coding, robotics, AI and making can sit beside one another." },
  { title: "End-to-end implementation", text: "A partner for school leadership from first conversation to daily program rhythm." },
];

const labs = [
  { title: "Coding & programming lab", text: "Logic, software and the habit of asking a computer to do something useful." },
  { title: "Robotics & automation lab", text: "Mechanisms, sensors and the joy of seeing a system respond." },
  { title: "Drone & aerial technology lab", text: "A new perspective on motion, mapping and the world from above." },
  { title: "Artificial intelligence lab", text: "A grounded introduction to the systems learning to recognise patterns." },
  { title: "Innovation & maker education lab", text: "A place to sketch, prototype, question and try again." },
];

const programs = [
  "Innovation learning programs",
  "Technology exploration workshops",
  "Future technology awareness",
  "Summer innovation camps",
  "Student project development",
  "National innovation challenges",
];

const products = ["CareerBuddy", "SchoolOS", "Composite Skill Lab"];

export default function SchoolsPage() {
  return (
    <main className="inner-page schools-page">
      <PageHero
        eyebrow="TechM4Schools · K–12 innovation"
        title={<>Transforming education through <em>innovation.</em></>}
        description="A human, practical learning ecosystem where students code, build robots, experiment with AI, fly drones and learn to make their ideas matter."
        image="/images/schools/hero.jpeg"
        imageAlt="Students learning together in a modern Indian classroom"
      />

      <section className="schools-intro section shell">
        <SectionHeading
          eyebrow="01 / The opportunity"
          title={<>Every student deserves a chance to <em>make.</em></>}
          text="TechM4Schools brings future technologies into the everyday life of a school, with the people, infrastructure and support to make them stick."
        />
        <StatRow items={[
          { value: "5+", label: "Innovation lab formats" },
          { value: "6", label: "Core student programs" },
          { value: "3", label: "Scalable platforms" },
          { value: "NEP", label: "2020 aligned" },
          { value: "600+", label: "Hands-on activities" },
        ]} />
      </section>

      <section className="pillars-section section">
        <div className="shell">
          <SectionHeading
            eyebrow="02 / Four pillars"
            title={<>A school ecosystem built to <em>keep going.</em></>}
            text="The most memorable lesson is often the one that opens the next question."
          />
          <div className="pillar-grid">
            {pillars.map((pillar, index) => (
              <article key={pillar.title} data-reveal>
                <span>0{index + 1}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="schools-feature section">
        <div className="schools-feature-copy" data-reveal>
          <p className="section-kicker"><span>03 / The labs</span></p>
          <h2>Make the future <em>visible.</em></h2>
          <p>Five lab environments give students a vocabulary for the technologies they keep hearing about and a safe place to use it.</p>
          <ArrowLink href="/contact">Plan a school innovation ecosystem</ArrowLink>
        </div>
        <div className="schools-feature-image image-frame" data-reveal>
          <img src="/images/schools/robotics.jpeg" alt="Students collaborating on a robotics project" loading="lazy" />
          <span>Curiosity, with tools.</span>
        </div>
      </section>

      <section className="labs-editorial section shell">
        <div className="labs-editorial-list">
          {labs.map((lab, index) => (
            <article key={lab.title} data-reveal>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{lab.title}</h3>
              <p>{lab.text}</p>
              <i aria-hidden="true">↗</i>
            </article>
          ))}
        </div>
      </section>

      <section className="programs-section section">
        <div className="shell">
          <SectionHeading
            eyebrow="04 / Student development"
            title={<>A rhythm of experiences, not a <em>single event.</em></>}
            text="From a first workshop to a national challenge, students need different ways to return to the work."
          />
          <div className="programs-list">
            {programs.map((program, index) => (
              <div key={program} data-reveal><span>0{index + 1}</span><strong>{program}</strong><i aria-hidden="true">↗</i></div>
            ))}
          </div>
        </div>
      </section>

      <section className="transformation-section section shell">
        <div className="transformation-image image-frame" data-reveal>
          <img src="/images/schools/drone-electronics.jpeg" alt="Student learning about electronics and aerial technology" loading="lazy" />
        </div>
        <div className="transformation-copy" data-reveal>
          <p className="section-kicker"><span>05 / Five layers</span></p>
          <h2>From a room to a <em>learning ecosystem.</em></h2>
          <EditorialList
            items={[
              { title: "Physical innovation labs", text: "The place where a concept gets its first material form." },
              { title: "Curriculum-integrated modules", text: "A pathway that respects the school day and enriches it." },
              { title: "Student development programs", text: "Experiences that build confidence through repetition and challenge." },
              { title: "Hands-on learning kits", text: "Tools that make it possible to continue the work beyond the lab." },
              { title: "Digital platforms", text: "A connective layer for teachers, students and school leadership." },
            ]}
          />
        </div>
      </section>

      <section className="school-products-section section">
        <div className="shell">
          <SectionHeading eyebrow="06 / Platforms" title={<>The digital layer behind <em>the physical one.</em></>} />
          <div className="school-products">
            {products.map((product, index) => (
              <Link href="/contact" key={product} data-reveal><span>0{index + 1}</span><h3>{product}</h3><i aria-hidden="true">↗</i></Link>
            ))}
          </div>
        </div>
      </section>

      <section className="schools-team section shell">
        <SectionHeading eyebrow="07 / The people" title={<>A program is only as good as the <em>care behind it.</em></>} />
        <PeopleGrid compact />
      </section>

      <PartnershipCTA
        eyebrow="School partnerships"
        title={<>Give every learner a place to <em>begin.</em></>}
        text="We help school leadership design an innovation ecosystem that is credible for parents, useful for teachers and memorable for students."
      />
      <StructuredData data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Schools", path: "/schools" }])} />
    </main>
  );
}
