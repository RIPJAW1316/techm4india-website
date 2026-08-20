import Link from "next/link";
import { ArrowLink, EditorialList, PageHero, PartnershipCTA, PeopleGrid, SectionHeading, StatRow } from "../components/Shared";
import { StructuredData } from "../components/StructuredData";
import { divisions } from "@/lib/site-data";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About TechM4India | Transforming India Through Technology",
  description:
    "Learn about TechM4India's mission to build India's innovation ecosystem through four powerful verticals: Engineering, Solutions, Space Technology, and Schools.",
  path: "/about",
});

const timeline = [
  { date: "2022", title: "A question becomes a company", text: "TechM4India begins with a simple belief: world-class technology education should not be limited by geography or circumstance." },
  { date: "2022", title: "Solutions take shape", text: "The first product and software experiments turn real institutional and industry problems into practical tools." },
  { date: "2023", title: "Space joins the ecosystem", text: "Aerospace learning expands the horizon from code and circuits to satellites, rockets and mission thinking." },
  { date: "2023", title: "Schools start building", text: "Innovation labs and hands-on programs bring future technologies into school learning environments." },
  { date: "2024", title: "A network with momentum", text: "200+ institutions and 10,000+ students become part of a growing, connected ecosystem." },
  { date: "2025", title: "A wider ambition", text: "AI, digital infrastructure and global delivery capabilities join the next chapter of the work." },
];

const principles = [
  { title: "Radical transparency", text: "Clear expectations, honest feedback and visible work build better partnerships." },
  { title: "Student obsession", text: "Every program is judged by what it helps a learner understand, make or become." },
  { title: "Speed & iteration", text: "Small experiments, fast learning and thoughtful refinement keep the work relevant." },
  { title: "Community first", text: "The strongest ideas travel further when institutions, mentors and students share them." },
  { title: "Real-world impact", text: "A certificate matters less than the confidence to solve a real problem." },
  { title: "Global ambition, Indian roots", text: "Build for the world, stay close to the people and contexts that shaped the work." },
];

export default function AboutPage() {
  return (
    <main className="inner-page about-page">
      <PageHero
        eyebrow="Our story · Est. 2023"
        title={<>We&apos;re building India&apos;s largest <em>tech ecosystem for every student.</em></>}
        description="From a single classroom in Telangana to four connected divisions shaping engineers, innovators, space scientists and future-ready school students."
        image="/images/about/hero.jpeg"
        imageAlt="Indian students collaborating on a technology project"
      />

      <section className="question-section section shell">
        <div className="question-mark" data-reveal>?</div>
        <div className="question-copy" data-reveal>
          <p className="section-kicker"><span>01 / The beginning</span></p>
          <h2>Started with a question:<br /><em>“Why can&apos;t every student access world-class tech education?”</em></h2>
          <p>
            The answer could not be another isolated course. It had to be an
            ecosystem: the people, tools, labs, mentors and institutional
            partnerships that let a student keep going after the lesson ends.
          </p>
          <ArrowLink href="/contact">Build the next chapter with us</ArrowLink>
        </div>
        <div className="question-image image-frame" data-reveal>
          <img src="/images/about/computer-lab.jpeg" alt="Students working together in a computer lab" loading="lazy" />
          <span>Ideas become capability through practice.</span>
        </div>
      </section>

      <section className="about-stats section">
        <div className="shell">
          <SectionHeading
            eyebrow="02 / The footprint"
            title={<>A small beginning with a <em>long horizon.</em></>}
            text="The scale is useful only when it creates more chances for people to learn by doing."
          />
          <StatRow items={[
            { value: "10K+", label: "Students impacted" },
            { value: "4", label: "Connected divisions" },
            { value: "200+", label: "Institutions in the network" },
            { value: "50+", label: "Live projects" },
            { value: "6", label: "Product solutions" },
          ]} />
        </div>
      </section>

      <section className="timeline-section section shell">
        <SectionHeading eyebrow="03 / The timeline" title={<>The story is still <em>being written.</em></>} />
        <div className="timeline-list">
          {timeline.map((item, index) => (
            <article key={item.date + item.title} data-reveal>
              <span className="timeline-year">{item.date}</span>
              <span className="timeline-line" aria-hidden="true"><i /></span>
              <div>
                <p>Chapter {String(index + 1).padStart(2, "0")}</p>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="verticals-section section">
        <div className="shell">
          <SectionHeading
            eyebrow="04 / Four divisions"
            title={<>Different disciplines. <em>One ecosystem.</em></>}
            text="Each division has its own craft, pace and point of view. Together they create more complete pathways into India’s technology future."
          />
          <div className="verticals-list">
            {divisions.map((division) => (
              <Link href={division.href} key={division.href} className="vertical-row" data-reveal>
                <span>{division.number}</span>
                <h3>{division.name}</h3>
                <p>{division.description}</p>
                <i aria-hidden="true">↗</i>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="principles-section section shell">
        <SectionHeading
          eyebrow="05 / What we believe"
          title={<>Principles are the infrastructure <em>behind the work.</em></>}
          text="The way we build matters as much as what we build."
        />
        <EditorialList items={principles} />
      </section>

      <section className="leadership-section section shell">
        <SectionHeading
          eyebrow="06 / Leadership"
          title={<>People who keep the work <em>close to the ground.</em></>}
          text="The team brings academic context, technical fluency and a practical instinct for making ideas useful."
        />
        <PeopleGrid />
      </section>

      <section className="about-quote section">
        <div className="shell">
          <p className="section-kicker section-kicker-light"><span>07 / The promise</span></p>
          <blockquote>“We are not preparing students for a technology future. We are giving them a hand in building it.”</blockquote>
          <p>TechM4India</p>
        </div>
      </section>

      <PartnershipCTA
        eyebrow="The next chapter"
        title={<>Let&apos;s make the <em>future tangible.</em></>}
        text="Bring your institution, your students and your most ambitious questions. We will bring the ecosystem to help you move."
      />
      <StructuredData data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
    </main>
  );
}
