/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */
import Link from "next/link";
import { CapabilitySystem } from "../components/worlds/CapabilitySystem";
import { EnquiryForm } from "../components/worlds/EnquiryForm";
import { FoundryStack } from "../components/worlds/FoundryStack";
import { IndustryIndex } from "../components/worlds/IndustryIndex";
import { SolutionsFooter, SolutionsHeader } from "../components/worlds/SolutionsChrome";
import { SolutionsMotion } from "../components/worlds/SolutionsMotion";
import { WorkGrid } from "../components/worlds/WorkGrid";
import { StructuredData } from "../components/StructuredData";
import {
  capabilities,
  ctaBand,
  edge,
  featured,
  hero,
  industries,
  labs,
  process,
  record,
  services,
  stageLabels,
  techGroups,
  work,
  workSection,
  workStages,
} from "@/lib/content/solutions";
import { contact } from "@/lib/site-data";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "TechM4Solutions | Software, apps, AI and pay-and-use computer labs",
  description:
    "TechM4Solutions designs and builds software products, web and mobile apps, AI solutions and enterprise systems, with pay-and-use labs of Silicon Valley-level computer systems.",
  path: "/solutions",
});

const enquiryFields = [
  { name: "name", label: "Your name", required: true, autoComplete: "name" },
  { name: "email", label: "Email", type: "email" as const, required: true, autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel" as const, autoComplete: "tel" },
  { name: "company", label: "Company or institution", autoComplete: "organization" },
  {
    name: "interest",
    label: "I'm interested in",
    type: "select" as const,
    options: [
      "A software product",
      "A web or mobile app",
      "An AI solution",
      "An ERP or enterprise system",
      "Booking lab time",
      "Something else",
    ],
    wide: true,
  },
  { name: "message", label: "Tell us about the project", type: "textarea" as const, required: true },
];

export default function SolutionsPage() {
  const [leadFigure, ...otherFigures] = record.figures;

  return (
    <div className="tm-world tm-world--solutions">
      <SolutionsMotion />
      <SolutionsHeader />
      <div className="tm-scroll-progress" aria-hidden="true">
        <span />
      </div>

      <main className="tm sf" id="top">
        <section className="sf-hero sf-ink" aria-labelledby="tm-hero-title">
          <div className="tm-container sf-hero-grid">
            <div className="sf-hero-copy">
              <p className="sf-kicker">TechM4Solutions · Software division</p>
              <h1 className="sf-h1" id="tm-hero-title">
                <span>{hero.title}</span>
                <em>{hero.titleAccent}</em>
              </h1>
              <p className="sf-lead">{hero.lede}</p>
              <div className="sf-actions">
                <a className="sf-btn" href="#contact">
                  {hero.primary.label}
                  <span aria-hidden="true"> →</span>
                </a>
                <a className="sf-btn sf-btn--ghost" href="#work">
                  {hero.secondary.label}
                  <span aria-hidden="true"> →</span>
                </a>
              </div>
            </div>
            <FoundryStack />
          </div>

          <div className="sf-sheet">
            <div className="tm-container">
              <div className="sf-sheet-head">
                <p>
                  {hero.sheet.title}
                  <span>{hero.sheet.reference}</span>
                </p>
                <p>
                  <span>{hero.sheet.footLabel}</span>
                  {hero.sheet.footValue}
                </p>
              </div>
              <ul>
                {hero.sheet.rows.map((row) => (
                  <li key={row.code}>
                    <a href={row.href}>
                      <span>{row.code}</span>
                      <strong>{row.term}</strong>
                      <small>{row.detail}</small>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="sf-section" id="record" aria-labelledby="sf-record-title">
          <div className="tm-container sf-record">
            <div className="sf-record-copy">
              <p className="sf-kicker">{record.label}</p>
              <h2 className="sf-h2" id="sf-record-title">
                {record.title} <em>{record.titleAccent}</em>
              </h2>
              <p>{record.lede}</p>
              <p>
                We are the software division of TechM4India. We design, build and ship products, apps, AI systems
                and enterprise software, and we stay for the support after release.
              </p>
              <a className="sf-call" href={contact.generalPhoneHref}>
                <span>Call us now</span>
                <strong>{contact.generalPhone}</strong>
              </a>
            </div>
            <div className="sf-ledger">
              <p className="sf-ledger-main">
                <strong>
                  {leadFigure.value}
                  <sup>{leadFigure.suffix}</sup>
                </strong>
                <span>{leadFigure.label}</span>
              </p>
              <ul>
                {otherFigures.map((figure) => (
                  <li key={figure.label}>
                    <strong>
                      {figure.value}
                      <sup>{figure.suffix}</sup>
                    </strong>
                    <span>{figure.label}</span>
                  </li>
                ))}
              </ul>
              <p className="sf-note">{record.note}</p>
            </div>
          </div>
        </section>

        <section className="sf-section sf-ink" id="services" aria-labelledby="sf-services-title">
          <div className="tm-container">
            <div className="sf-section-head">
              <p className="sf-kicker" id="capabilities">
                {capabilities.label}
              </p>
              <h2 className="sf-h2" id="sf-services-title">
                {capabilities.title} <em>{capabilities.titleAccent}</em>
              </h2>
              <p>{capabilities.lede}</p>
            </div>
            <CapabilitySystem services={services} />
          </div>
        </section>

        <section className="sf-section sf-section--tight" aria-labelledby="sf-edge-title">
          <div className="tm-container">
            <div className="sf-section-head">
              <p className="sf-kicker">{edge.label}</p>
              <h2 className="sf-h2" id="sf-edge-title">
                Practical engineering. <em>Measurable delivery.</em>
              </h2>
            </div>
            <ol className="sf-edge">
              {edge.items.map((item, index) => (
                <li key={item.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="sf-section sf-section--tight sf-tech" aria-labelledby="sf-tech-title">
          <div className="tm-container">
            <div className="sf-section-head">
              <p className="sf-kicker">{capabilities.stackTitle}</p>
              <h2 className="sf-h2" id="sf-tech-title">
                Named where the work already uses them.
              </h2>
              <p>{capabilities.stackLede}</p>
            </div>
            <div className="sf-tech-grid">
              {techGroups.map((group) => (
                <article key={group.layer}>
                  <h3>{group.layer}</h3>
                  <p>{group.basis}</p>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sf-section sf-work-section" id="work" aria-labelledby="sf-work-title">
          <div className="tm-container">
            <div className="sf-section-head sf-section-head--split">
              <div>
                <p className="sf-kicker">{workSection.label}</p>
                <h2 className="sf-h2" id="sf-work-title">
                  {workSection.title} <em>{workSection.titleAccent}</em>
                </h2>
              </div>
              <p>{workSection.lede}</p>
            </div>
            <WorkGrid
              items={work}
              stages={workStages}
              stageLabels={stageLabels}
              allLabel={workSection.allLabel}
              problemLabel={workSection.problemLabel}
              doesLabel={workSection.doesLabel}
              techLabel={workSection.techLabel}
              noTech={workSection.noTech}
              featured={featured}
            />
            <p className="sf-note sf-work-note">{workSection.note}</p>
          </div>
        </section>

        <section className="sf-section sf-ink" id="industries" aria-labelledby="sf-industries-title">
          <div className="tm-container">
            <div className="sf-section-head">
              <p className="sf-kicker">{industries.label}</p>
              <h2 className="sf-h2" id="sf-industries-title">
                {industries.title} <em>{industries.titleAccent}</em>
              </h2>
              <p>{industries.lede}</p>
            </div>
            <IndustryIndex items={industries.items} />
          </div>
        </section>

        <section className="sf-section sf-process" id="process" aria-labelledby="sf-process-title">
          <div className="tm-container">
            <div className="sf-section-head">
              <p className="sf-kicker">{process.label}</p>
              <h2 className="sf-h2" id="sf-process-title">
                {process.title} <em>{process.titleAccent}</em>
              </h2>
              <p>{process.lede}</p>
            </div>
            <div className="sf-rail" aria-hidden="true">
              <span />
            </div>
            <ol className="sf-steps">
              {process.steps.map((step, index) => (
                <li className="sf-step" key={step.name}>
                  <span className="sf-step-no">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{step.name}</h3>
                  <p>{step.text}</p>
                  <p className="sf-receive">
                    <span>{process.receiveLabel}</span>
                    {step.receive}
                  </p>
                  <i className="sf-step-bar" aria-hidden="true" />
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="sf-section sf-labs" id="labs" aria-labelledby="sf-labs-title">
          <div className="tm-container">
            <div className="sf-annex">
              <div className="sf-labs-copy">
                <p className="sf-kicker">Annex · {labs.label}</p>
                <h2 className="sf-h2" id="sf-labs-title">
                  {labs.title} <em>{labs.titleAccent}</em>
                </h2>
                <p>{labs.lede}</p>
                <ul className="sf-offers">
                  {labs.offers.map((offer, index) => (
                    <li key={offer.title}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <h3>{offer.title}</h3>
                        <p>{offer.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <figure className="sf-labs-photo">
                <img
                  src={labs.image.src}
                  alt={labs.image.alt}
                  width={1600}
                  height={1066}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>
                  {labs.image.caption}
                  <span>{labs.image.note}</span>
                </figcaption>
              </figure>
            </div>

            <div className="sf-lab-foot">
              <div>
                <h3>{labs.stepsTitle}</h3>
                <ol className="sf-lab-steps">
                  {labs.steps.map((step, index) => (
                    <li key={step.name}>
                      <span>{index + 1}</span>
                      <strong>{step.name}</strong>
                      <p>{step.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3>{labs.workTitle}</h3>
                <ul className="sf-lab-work">
                  {labs.work.map((item) => (
                    <li key={item.title}>
                      <strong>{item.title}</strong>
                      <span>{item.text}</span>
                      <small>{item.tools.join(" · ")}</small>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="sf-lab-who">
                <h3>{labs.whoTitle}</h3>
                <ul>
                  {labs.who.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p>{labs.note}</p>
                <a className="sf-btn" href="#contact">
                  {labs.cta.label}
                  <span aria-hidden="true"> →</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="sf-section sf-contact" id="contact" aria-labelledby="sf-contact-title">
          <div className="tm-container sf-contact-grid">
            <div>
              <p className="sf-kicker">Book a discovery call</p>
              <h2 className="sf-h2" id="sf-contact-title">
                {ctaBand.title}
              </h2>
              <p>{ctaBand.text}</p>
              <p>
                Projects, products and lab time all start with a short conversation about the people, the constraints
                and the result you need.
              </p>
              <dl className="sf-contact-list">
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={contact.partnershipsHref}>{contact.partnerships}</a>
                  </dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>
                    <a href={contact.generalPhoneHref}>{contact.generalPhone}</a>
                  </dd>
                </div>
                <div>
                  <dt>Address</dt>
                  <dd>{contact.address}</dd>
                </div>
              </dl>
              <p className="sf-note">
                <Link href="/solutions/erp">Explore the Company Management ERP</Link>
                {" · "}
                <a href="#labs">Book lab time</a>
              </p>
            </div>
            <div className="sf-form">
              <EnquiryForm
                formId="tm-enquiry"
                theme="tm"
                title="New TechM4Solutions enquiry"
                fields={enquiryFields}
                submitLabel="Send request"
              />
            </div>
          </div>
        </section>
      </main>

      <SolutionsFooter />

      <StructuredData
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions" },
        ])}
      />
    </div>
  );
}
