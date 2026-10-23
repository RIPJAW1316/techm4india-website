/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */
import type { CSSProperties } from "react";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { StructuredData } from "../components/StructuredData";
import { EngineeringFooter, EngineeringHeader } from "../components/worlds/EngineeringChrome";
import { HeroFinder, ProgrammeCatalogue } from "../components/worlds/EngineeringFinder";
import { EngineeringDisciplines } from "../components/worlds/EngineeringDisciplines";
import { CountUp, EngineeringMotion } from "../components/worlds/EngineeringMotion";
import { DriveGallery, PathTabs } from "../components/worlds/EngineeringShowcase";
import { EnquiryForm } from "../components/worlds/EnquiryForm";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { contact } from "@/lib/site-data";
import {
  campusDrive,
  cta,
  enquiryInterests,
  faqs,
  gains,
  glance,
  hero,
  labVision,
  path,
  semesterProgrammes,
  toolCount,
  toolGroups,
  tracks,
} from "@/lib/content/engineering";
import { programmes } from "@/lib/content/engineering-programmes";

export const metadata = pageMetadata({
  title: "TechM4Engineering | Engineering Innovation Programs",
  description:
    "Industry-ready engineering programmes across civil, mechanical, computer science, electrical, electronics, communication and chemical engineering, with institute labs and credit-based semester programmes.",
  path: "/engineering",
});

/** Engineering division: workshop photography, a discipline index, and an explorable catalogue. */

const enquiryFields = [
  { name: "name", label: "Your name", required: true, autoComplete: "name" },
  { name: "phone", label: "Phone number", type: "tel" as const, required: true, autoComplete: "tel" },
  { name: "email", label: "Email", type: "email" as const, autoComplete: "email" },
  { name: "institution", label: "College or company", autoComplete: "organization" },
  {
    name: "role",
    label: "I am a",
    type: "select" as const,
    options: ["Student", "Parent", "Faculty member", "Institution leader", "Industry partner"],
  },
  { name: "interest", label: "Interested in", type: "select" as const, options: enquiryInterests },
  { name: "message", label: "Message", type: "textarea" as const },
];

const range = (pair: readonly [number, number]) => (pair[0] === pair[1] ? String(pair[0]) : pair[0] + "–" + pair[1]);

/** Stagger index for scroll reveals. */
const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Sparks drifting up over the hero's grinding-wheel photo. Fixed values so
 * the server and client render the same markup.
 */
const EMBERS = [
  { x: 54, d: 0, s: 3, t: 5.6 },
  { x: 58, d: 1.6, s: 2, t: 6.4 },
  { x: 61, d: 3.1, s: 4, t: 5.1 },
  { x: 64, d: 0.8, s: 2, t: 7 },
  { x: 67, d: 2.4, s: 3, t: 5.8 },
  { x: 70, d: 4.2, s: 2, t: 6.1 },
  { x: 72, d: 1.1, s: 3, t: 4.9 },
  { x: 75, d: 3.7, s: 2, t: 6.8 },
  { x: 78, d: 0.4, s: 4, t: 5.4 },
  { x: 81, d: 2.9, s: 2, t: 6.6 },
  { x: 84, d: 1.9, s: 3, t: 5.2 },
  { x: 88, d: 4.6, s: 2, t: 7.2 },
  { x: 91, d: 3.3, s: 3, t: 5.9 },
  { x: 95, d: 0.2, s: 2, t: 6.3 },
];

/** Every tool once, for the marquee above the grouped tool wall. */
const marqueeTools = toolGroups.flatMap((group) => group.tools);

export default function EngineeringPage() {
  return (
    <div className="en-world">
      <EngineeringMotion />
      <EngineeringHeader />
      <main className="en" id="top">
        {/* Hero ------------------------------------------------------------------------------------- */}
        <section className="en-hero" aria-labelledby="en-hero-title">
          <div className="en-hero-media">
            <img src={hero.image} alt={hero.imageAlt} width={2400} height={1601} fetchPriority="high" />
          </div>
          <div className="en-embers" aria-hidden="true">
            {EMBERS.map((ember, index) => (
              <i
                key={index}
                style={
                  {
                    "--x": ember.x + "%",
                    "--d": ember.d + "s",
                    "--s": ember.s + "px",
                    "--t": ember.t + "s",
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <div className="en-container en-hero-inner">
            <p className="en-eyebrow is-light">{hero.eyebrow} · Industry-ready learning</p>
            <h1 id="en-hero-title" className="en-hero-title">
              {hero.titleLines.map((line, index) => (
                <span className="en-line" key={line}>
                  <span style={stagger(index)}>{line}</span>{" "}
                </span>
              ))}
              {hero.accentLines.map((line, index) => (
                <span className="en-line is-accent" key={line}>
                  <span style={stagger(index + hero.titleLines.length)}>{line}</span>{" "}
                </span>
              ))}
            </h1>
            <p className="en-hero-lead">{hero.lead}</p>
            <div className="en-hero-actions">
              <a className="en-btn en-btn--cream" href="#programmes">
                Explore programmes
                <ArrowRight aria-hidden="true" />
              </a>
              <a className="en-btn en-btn--ghost" href="#labs">
                Bring a lab to your campus
              </a>
            </div>
          </div>
          <div className="en-container en-hero-finder">
            <HeroFinder />
          </div>
        </section>

        {/* At a glance ------------------------------------------------------------------------------ */}
        <section className="en-section en-glance" aria-labelledby="en-glance-title">
          <div className="en-container">
            <div className="en-head" data-en-reveal="">
              <p className="en-eyebrow">At a glance</p>
              <h2 id="en-glance-title">TechM4Engineering at a glance</h2>
            </div>
            <div className="en-bento">
              <div className="en-tile en-tile--teal is-disciplines" data-en-reveal="" style={stagger(0)}>
                <strong>
                  <CountUp value={String(glance.disciplines)} />
                </strong>
                <span>engineering disciplines</span>
                <ul>
                  {tracks.map((track, index) => (
                    <li key={track.id} style={stagger(index)}>
                      {track.short}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="en-tile en-tile--cream is-programmes" data-en-reveal="" style={stagger(1)}>
                <strong>
                  <CountUp value={String(glance.programmes)} />
                </strong>
                <span>programmes, each with its own curriculum, projects and capstone</span>
              </div>
              <figure className="en-tile en-tile--photo is-photo" data-en-reveal="" style={stagger(1)}>
                <img
                  src={campusDrive.photos[0].src}
                  alt={campusDrive.photos[0].alt}
                  loading="lazy"
                  width={1600}
                  height={1200}
                />
                <figcaption>Campus Recruitment Drive 2026 · Vishwa Vishwani</figcaption>
              </figure>
              <div className="en-tile en-tile--mint is-tools" data-en-reveal="" style={stagger(2)}>
                <strong>
                  <CountUp value={String(toolCount)} />
                </strong>
                <span>industry tools in the curriculum, from Revit and ANSYS to Vivado and Aspen HYSYS</span>
              </div>
              <div className="en-tile en-tile--forest is-path" data-en-reveal="" style={stagger(0)}>
                <strong>
                  <CountUp value={String(path.length)} />
                </strong>
                <span>phases in every programme</span>
                <ol className="en-tile-path" aria-label="The five phases">
                  {path.map((phase, index) => (
                    <li key={phase.code} style={stagger(index)}>
                      {phase.name}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="en-tile en-tile--line is-credits" data-en-reveal="" style={stagger(1)}>
                <strong>
                  <CountUp value={range(glance.creditRange)} />
                </strong>
                <span>credits per programme, built for university calendars</span>
              </div>
              <div className="en-tile en-tile--line is-sessions" data-en-reveal="" style={stagger(2)}>
                <strong>
                  <CountUp value={range(glance.sessionsRange)} />
                </strong>
                <span>
                  sessions over {glance.durations[0].split(" ")[0]} to {glance.durations[glance.durations.length - 1].toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Disciplines ------------------------------------------------------------------------------ */}
        <section id="disciplines" className="en-section en-bg-mist" aria-labelledby="en-disciplines-title">
          <div className="en-container">
            <div className="en-head en-head--split" data-en-reveal="">
              <div>
                <p className="en-eyebrow">Choose your discipline</p>
                <h2 id="en-disciplines-title">Seven disciplines. One standard of practice.</h2>
              </div>
              <p className="en-lead">
                Choose a discipline to preview its tools and focus, then explore the programmes built for it.
              </p>
            </div>
            <EngineeringDisciplines />
          </div>
        </section>

        {/* Method ----------------------------------------------------------------------------------- */}
        <section id="method" className="en-section" aria-labelledby="en-method-title">
          <div className="en-container">
            <div className="en-head en-head--split" data-en-reveal="">
              <div>
                <p className="en-eyebrow">The TechM4 path</p>
                <h2 id="en-method-title">
                  <span>Learn →</span>
                  <span>Design →</span>
                  <span>Analyze →</span>
                  <span>Build →</span>
                  <span>Implement</span>
                </h2>
              </div>
              <p className="en-lead">
                Every programme follows the same five phases, from foundational theory to industry-ready
                delivery on real projects.
              </p>
            </div>
            <PathTabs />
          </div>
        </section>

        {/* Programmes ------------------------------------------------------------------------------- */}
        <section id="programmes" className="en-section en-bg-cream" aria-labelledby="en-programmes-title">
          <div className="en-container">
            <div className="en-head en-head--split" data-en-reveal="">
              <div>
                <p className="en-eyebrow">Programmes</p>
                <h2 id="en-programmes-title">Skill up with mentors and hands-on projects</h2>
              </div>
              <p className="en-lead">
                {glance.programmes} programmes across {glance.disciplines} disciplines. Filter by discipline,
                duration or tool, then open any programme for its full curriculum, projects and career paths.
              </p>
            </div>
            <div className="en-editorial-pair" aria-label="Engineering learning and campus engagement">
              <figure data-en-reveal="wipe">
                <img src="/images/engineering/path-design.webp" alt="Students working together around a project table" loading="lazy" width={1500} height={1000} />
                <figcaption>Learning through collaboration</figcaption>
              </figure>
              <figure data-en-reveal="wipe">
                <img src={campusDrive.photos[0].src} alt={campusDrive.photos[0].alt} loading="lazy" width={1200} height={900} />
                <figcaption>TechM4India at Vishwa Vishwani</figcaption>
              </figure>
            </div>
            <ProgrammeCatalogue />
          </div>
        </section>

        {/* Tools ------------------------------------------------------------------------------------ */}
        <section id="tools" className="en-section en-bg-forest" aria-labelledby="en-tools-title">
          <div className="en-container">
            <div className="en-head en-head--split" data-en-reveal="">
              <div>
                <p className="en-eyebrow is-light">Tool ecosystem</p>
                <h2 id="en-tools-title">The tools the projects are built in</h2>
              </div>
              <p className="en-lead">
                {toolCount} tools from the programmes, taught as workflows from the first exercise through to
                the capstone.
              </p>
            </div>
          </div>
          {/* Decorative: the same tools as the wall below, drifting past. */}
          <div className="en-marquee" aria-hidden="true">
            {[marqueeTools.slice(0, Math.ceil(marqueeTools.length / 2)), marqueeTools.slice(Math.ceil(marqueeTools.length / 2))].map(
              (row, rowIndex) => (
                <div key={rowIndex} className={"en-marquee-row" + (rowIndex ? " is-reverse" : "")}>
                  <div className="en-marquee-track">
                    {[...row, ...row].map((tool, index) => (
                      <span key={tool + index}>{tool}</span>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
          <div className="en-container">
            <div className="en-toolwall">
              {toolGroups.map((group, index) => (
                <div key={group.id} className="en-toolgroup" data-track={group.id} data-en-spot="" data-en-reveal="" style={stagger(index % 4)}>
                  <h3>{group.label}</h3>
                  <ul>
                    {group.tools.map((tool) => (
                      <li key={tool}>{tool}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="en-tool-images" aria-label="Illustrative engineering disciplines">
              <figure><img src="/images/engineering/electronics-board.webp" alt="Hands examining a printed circuit board" loading="lazy" width={1500} height={1000} /><figcaption>Circuits</figcaption></figure>
              <figure><img src="/images/engineering/software-engineer.webp" alt="Software engineer working at a computer" loading="lazy" width={1500} height={1000} /><figcaption>Software</figcaption></figure>
              <figure><img src="/images/engineering/chemical-lab.webp" alt="Researcher testing materials in a laboratory" loading="lazy" width={734} height={1100} /><figcaption>Process</figcaption></figure>
            </div>
          </div>
        </section>

        {/* Labs ------------------------------------------------------------------------------------- */}
        <section id="labs" className="en-section" aria-labelledby="en-labs-title">
          <div className="en-container en-labs">
            <div className="en-labs-copy">
              <div data-en-reveal="">
                <p className="en-eyebrow">Our vision</p>
                <h2 id="en-labs-title">{labVision.title}</h2>
                <p className="en-lead">{labVision.text}</p>
              </div>
              <ul className="en-labs-list">
                {labVision.items.map((item, index) => (
                  <li key={item.title} data-en-reveal="" style={stagger(index % 2)}>
                    <span className="en-labs-num" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                      <span className="en-tag">{item.tag}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="en-labs-mosaic">
              {labVision.images.map((image, index) => (
                <figure key={image.src} className={"en-parallax is-" + (index + 1)} data-en-reveal="wipe" style={stagger(index)}>
                  <img src={image.src} alt={image.alt} loading="lazy" width={1200} height={800} />
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Semester programmes ---------------------------------------------------------------------- */}
        <section id="semesters" className="en-section en-bg-mist" aria-labelledby="en-semesters-title">
          <div className="en-container">
            <div className="en-head en-head--split" data-en-reveal="">
              <div>
                <p className="en-eyebrow">Programme structure</p>
                <h2 id="en-semesters-title">Credit-based semester programmes</h2>
              </div>
              <p className="en-lead">
                Semester-length programmes aligned with university calendars, so they sit inside B.Tech and
                M.Tech curricula instead of competing with them.
              </p>
            </div>
            <ol className="en-semesters" data-en-reveal="line">
              {semesterProgrammes.map((item, index) => (
                <li
                  key={item.title}
                  className={index === semesterProgrammes.length - 1 ? "is-mou" : undefined}
                  data-en-spot=""
                  style={stagger(index)}
                >
                  <span className="en-semester-dot" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="en-semester-kicker">{item.kicker}</p>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <ul className="en-checks">
                    {item.items.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            <p className="en-swipe-hint" aria-hidden="true">
              Swipe through the {semesterProgrammes.length} programmes
            </p>
          </div>
        </section>

        {/* Campus drive ----------------------------------------------------------------------------- */}
        <section id="campus" className="en-section" aria-labelledby="en-campus-title">
          <div className="en-container">
            <div className="en-head en-head--split" data-en-reveal="">
              <div>
                <p className="en-eyebrow">Campus life</p>
                <h2 id="en-campus-title">{campusDrive.title}</h2>
              </div>
              <p className="en-lead">{campusDrive.text}</p>
            </div>
            <DriveGallery />
          </div>
        </section>

        {/* Outcomes --------------------------------------------------------------------------------- */}
        <section id="outcomes" className="en-section en-bg-mist" aria-labelledby="en-outcomes-title">
          <div className="en-container en-gains">
            <figure className="en-gains-media en-parallax" data-en-reveal="">
              <img src={gains.image} alt={gains.imageAlt} loading="lazy" width={1200} height={800} />
            </figure>
            <div>
              <p className="en-eyebrow">What you gain</p>
              <h2 id="en-outcomes-title">What you can show on day one</h2>
              <p className="en-lead">
                Drawings, models, analysis and a TechM4India certificate for the programme you finish.
              </p>
              <ul className="en-gains-list">
                {gains.items.map((item, index) => (
                  <li key={item.title} data-en-reveal="" style={stagger(index % 2)}>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ -------------------------------------------------------------------------------------- */}
        <section id="faq" className="en-section" aria-labelledby="en-faq-title">
          <div className="en-container en-faq">
            <div className="en-faq-side" data-en-reveal="">
              <p className="en-eyebrow">FAQ</p>
              <h2 id="en-faq-title">Questions, answered</h2>
              <p className="en-lead">For students, faculty and institutions planning a programme or a lab.</p>
              <div className="en-faq-help">
                <strong>Still have a question?</strong>
                <a href={contact.generalPhoneHref}>
                  <Phone aria-hidden="true" />
                  {contact.generalPhone}
                </a>
                <a href={contact.partnershipsHref}>
                  <Mail aria-hidden="true" />
                  {contact.partnerships}
                </a>
              </div>
            </div>
            <div className="en-faq-list">
              {faqs.map((faq, index) => (
                <details key={faq.q} open={index === 0} data-en-reveal="" style={stagger(index)}>
                  <summary>{faq.q}</summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA strip -------------------------------------------------------------------------------- */}
        <section className="en-cta" aria-labelledby="en-cta-title">
          <img src={cta.image} alt="" loading="lazy" width={2000} height={1125} />
          <div className="en-container en-cta-inner" data-en-reveal="">
            <div>
              <h2 id="en-cta-title">Bring TechM4Engineering to your campus</h2>
              <p>
                Labs, mentors, credit-ready programmes and a placement pipeline, shaped around your departments
                and your academic calendar.
              </p>
            </div>
            <div className="en-cta-actions">
              <a className="en-btn" href="#contact">
                Start a conversation
                <ArrowRight aria-hidden="true" />
              </a>
              <a className="en-btn en-btn--outline" href="#programmes">
                Browse programmes
              </a>
            </div>
          </div>
        </section>

        {/* Contact ---------------------------------------------------------------------------------- */}
        <section id="contact" className="en-section" aria-labelledby="en-contact-title">
          <div className="en-container en-contact">
            <div className="en-contact-copy" data-en-reveal="">
              <p className="en-eyebrow">Enquire</p>
              <h2 id="en-contact-title">Plan your programme or your lab</h2>
              <p className="en-lead">
                Tell us who you are and what you are looking for. Students get help choosing a programme;
                institutions get a plan for labs, faculty development and credit integration.
              </p>
              <ul className="en-contact-paths">
                <li>
                  <strong>Students</strong>
                  <span>Choose a discipline, a programme and a start date.</span>
                </li>
                <li>
                  <strong>Institutions</strong>
                  <span>Set up an embedded lab under an MoU, with FDP and certification.</span>
                </li>
                <li>
                  <strong>Industry</strong>
                  <span>Mentor a studio, share a live project or hire from a campus drive.</span>
                </li>
              </ul>
            </div>
            <div className="en-contact-card" data-en-reveal="" style={stagger(1)}>
              <EnquiryForm
                formId="en-enquiry"
                theme="en"
                title="New TechM4Engineering enquiry"
                fields={enquiryFields}
                submitLabel="Send enquiry"
                prefillEvent="en:enquire"
              />
            </div>
          </div>
        </section>
      </main>
      <EngineeringFooter />
      <StructuredData
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Engineering", path: "/engineering" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "TechM4Engineering programmes",
            itemListElement: programmes.map((programme, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Course",
                name: programme.title,
                description: programme.description,
                provider: { "@type": "Organization", name: "TechM4India", sameAs: "https://www.techm4india.com" },
              },
            })),
          },
        ]}
      />
    </div>
  );
}
