import type { CSSProperties } from "react";
import { Btn, ClosingPaths, Figures, Kicker, Plate, SectionHead, SmartLink } from "../components/xp/Primitives";
import { WorkIndex } from "../components/xp/solutions/WorkIndex";
import { StructuredData } from "../components/StructuredData";
import {
  capabilities,
  closing,
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
  title: "TechM4Solutions | Software, apps, AI and computer labs",
  description:
    "TechM4Solutions designs and builds software products, web and mobile apps, AI solutions and enterprise systems, and offers pay-per-use access to high-performance computer labs.",
  path: "/solutions",
});

const pad = (n: number) => String(n).padStart(2, "0");
const delay = (ms: number) => ({ "--delay": ms + "ms" }) as CSSProperties;

export default function SolutionsPage() {
  return (
    <main className="xp xp-solutions">
      {/* Hero: the promise on the left, the delivery sheet on the right */}
      <section className="xp-section xp-tone-ink xo-hero" aria-labelledby="xo-hero-title">
        <div className="xp-shell xo-hero-grid">
          <div className="xo-hero-copy">
            <Kicker index={hero.kickerIndex}>{hero.kicker}</Kicker>
            <h1 className="xp-display xo-hero-title" id="xo-hero-title">
              {hero.title} <em>{hero.titleAccent}</em>
            </h1>
            <p className="xp-lede">{hero.lede}</p>
            <div className="xp-actions">
              <Btn href={hero.primary.href}>{hero.primary.label}</Btn>
              <Btn href={hero.secondary.href} variant="line">
                {hero.secondary.label}
              </Btn>
            </div>
          </div>

          <aside className="xo-sheet" aria-labelledby="xo-sheet-title">
            <header className="xo-sheet-head">
              <p className="xp-meta" id="xo-sheet-title">
                {hero.sheet.title}
              </p>
              <p className="xp-meta">{hero.sheet.reference}</p>
            </header>
            <ol className="xo-sheet-rows">
              {hero.sheet.rows.map((row, index) => (
                <li key={row.code} style={delay(index * 70)}>
                  <a href={row.href}>
                    <span className="xo-sheet-code">{row.code}</span>
                    <span className="xo-sheet-term">{row.term}</span>
                    <span className="xo-sheet-detail">{row.detail}</span>
                    <i aria-hidden="true">↘</i>
                  </a>
                </li>
              ))}
            </ol>
            <footer className="xo-sheet-foot">
              <span className="xp-meta">{hero.sheet.footLabel}</span>
              <strong>{hero.sheet.footValue}</strong>
            </footer>
          </aside>
        </div>

        <nav className="xp-shell xo-index" aria-label="On this page">
          <ol>
            {hero.index.map((item, index) => (
              <li key={item.href}>
                <a href={item.href}>
                  <span aria-hidden="true">{pad(index + 1)}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      {/* Delivery record */}
      <section
        className="xp-section xp-section--tight xo-record"
        id="record"
        aria-labelledby="xo-record-title"
      >
        <div className="xp-shell xo-record-grid">
          <div className="xo-record-head" data-reveal>
            <Kicker index="01">{record.label}</Kicker>
            <h2 className="xp-title" id="xo-record-title">
              {record.title} <em>{record.titleAccent}</em>
            </h2>
            <p className="xp-body">{record.lede}</p>
          </div>
          <div className="xo-record-figures">
            <Figures items={record.figures} />
            <p className="xo-record-note">{record.note}</p>
          </div>
        </div>
      </section>

      {/* Featured build: the one system whose code is in this repository */}
      <section
        className="xp-section xp-tone-white xo-featured"
        id="featured"
        aria-labelledby="xo-featured-title"
      >
        <div className="xp-shell">
          <SectionHead
            index="02"
            label={featured.label}
            id="xo-featured-title"
            title={
              <>
                {featured.title} <em>{featured.titleAccent}</em>
              </>
            }
            lede={featured.lede}
          />
          <div className="xo-featured-grid">
            <div className="xo-console" data-reveal>
              <div className="xo-console-bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>{featured.name}</span>
              </div>
              <div className="xo-console-body">
                <p className="xp-meta">{featured.layersTitle}</p>
                <ol className="xo-layers">
                  {featured.layers.map((layer) => (
                    <li key={layer.code}>
                      <span className="xo-layer-code">{layer.code}</span>
                      <strong>{layer.term}</strong>
                      <span>{layer.detail}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="xo-modules" data-reveal>
              <h3 className="xp-meta" id="xo-modules-title">
                {featured.modulesTitle}
              </h3>
              <ul aria-labelledby="xo-modules-title">
                {featured.modules.map((module, index) => (
                  <li key={module}>
                    <span aria-hidden="true">{pad(index + 1)}</span>
                    {module}
                  </li>
                ))}
              </ul>
              <p className="xp-body">{featured.divisionsNote}</p>
              <Btn href={featured.cta.href}>{featured.cta.label}</Btn>
            </div>
          </div>
        </div>
      </section>

      {/* Selected work */}
      <section className="xp-section xo-work-section" id="work" aria-labelledby="xo-work-title">
        <div className="xp-shell">
          <SectionHead
            index="03"
            label={workSection.label}
            id="xo-work-title"
            title={
              <>
                {workSection.title} <em>{workSection.titleAccent}</em>
              </>
            }
            lede={workSection.lede}
          />
          <WorkIndex items={work} stages={workStages} stageLabels={stageLabels} labels={workSection} />
          <p className="xo-work-note">{workSection.note}</p>
        </div>
      </section>

      {/* Accent band: a mid-page way out */}
      <section className="xo-band" aria-labelledby="xo-band-title">
        <div className="xp-shell xo-band-inner">
          <div>
            <h2 className="xo-band-title" id="xo-band-title">
              {ctaBand.title}
            </h2>
            <p>{ctaBand.text}</p>
          </div>
          <div className="xo-band-actions">
            <Btn href={ctaBand.action.href} variant="light">
              {ctaBand.action.label}
            </Btn>
            <a className="xo-band-mail" href={contact.partnershipsHref}>
              {contact.partnerships}
            </a>
          </div>
        </div>
      </section>

      {/* Capabilities and the stack */}
      <section
        className="xp-section xp-tone-navy xo-cap"
        id="capabilities"
        aria-labelledby="xo-cap-title"
      >
        <div className="xp-shell">
          <SectionHead
            index="04"
            label={capabilities.label}
            id="xo-cap-title"
            title={
              <>
                {capabilities.title} <em>{capabilities.titleAccent}</em>
              </>
            }
            lede={capabilities.lede}
          />
          <ol className="xo-services">
            {services.map((service, index) => (
              <li key={service.title} data-reveal style={delay((index % 2) * 80)}>
                <span className="xo-service-no" aria-hidden="true">
                  {pad(index + 1)}
                </span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <ul aria-label={"Includes, for " + service.title}>
                    {service.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>

          <div className="xo-stack">
            <div className="xo-stack-head" data-reveal>
              <h3 className="xp-subtitle" id="xo-stack-title">
                {capabilities.stackTitle}
              </h3>
              <p>{capabilities.stackLede}</p>
            </div>
            <table className="xo-stack-table" aria-labelledby="xo-stack-title">
              <thead>
                <tr>
                  <th scope="col">{capabilities.columns.layer}</th>
                  <th scope="col">{capabilities.columns.items}</th>
                  <th scope="col">{capabilities.columns.basis}</th>
                </tr>
              </thead>
              <tbody>
                {techGroups.map((group) => (
                  <tr key={group.layer}>
                    <th scope="row">{group.layer}</th>
                    <td>
                      <ul className="xo-chips">
                        {group.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </td>
                    <td>{group.basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Industries and the edge */}
      <section className="xp-section xo-industries" id="industries" aria-labelledby="xo-industries-title">
        <div className="xp-shell">
          <SectionHead
            index="05"
            label={industries.label}
            id="xo-industries-title"
            title={
              <>
                {industries.title} <em>{industries.titleAccent}</em>
              </>
            }
            lede={industries.lede}
          />
          <ul className="xo-industry-grid">
            {industries.items.map((industry, index) => (
              <li key={industry.name} data-reveal style={delay((index % 3) * 60)}>
                <span aria-hidden="true">{pad(index + 1)}</span>
                <h3>{industry.name}</h3>
                <p>{industry.builds.join(" · ")}</p>
              </li>
            ))}
          </ul>

          <div className="xo-edge">
            <h3 className="xp-meta" id="xo-edge-title">
              {edge.label}
            </h3>
            <ol className="xo-edge-list" aria-labelledby="xo-edge-title">
              {edge.items.map((item) => (
                <li key={item.title} data-reveal>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="xp-section xp-tone-tint xo-process" id="process" aria-labelledby="xo-process-title">
        <div className="xp-shell">
          <SectionHead
            index="06"
            label={process.label}
            id="xo-process-title"
            title={
              <>
                {process.title} <em>{process.titleAccent}</em>
              </>
            }
            lede={process.lede}
          />
          <ol className="xo-steps">
            {process.steps.map((step, index) => (
              <li key={step.name} data-reveal style={delay(index * 80)}>
                <span className="xo-step-no" aria-hidden="true">
                  {pad(index + 1)}
                </span>
                <h3>{step.name}</h3>
                <p>{step.text}</p>
                <div className="xo-step-receive">
                  <p className="xp-meta">{process.receiveLabel}</p>
                  <p>{step.receive}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pay-and-use computer labs */}
      <section className="xp-section xp-tone-navy xo-labs" id="labs" aria-labelledby="xo-labs-title">
        <div className="xp-shell">
          <div className="xo-labs-grid">
            <div className="xo-labs-copy" data-reveal>
              <Kicker index="07">{labs.label}</Kicker>
              <h2 className="xp-title" id="xo-labs-title">
                {labs.title} <em>{labs.titleAccent}</em>
              </h2>
              <p className="xp-lede">{labs.lede}</p>
              <ul className="xo-offers">
                {labs.offers.map((offer, index) => (
                  <li key={offer.title}>
                    <span aria-hidden="true">{pad(index + 1)}</span>
                    <div>
                      <h3>{offer.title}</h3>
                      <p>{offer.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="xo-labs-side">
              <Plate
                src={labs.image.src}
                alt={labs.image.alt}
                caption={labs.image.caption}
                note={labs.image.note}
                ratio="4x3"
                sizes="(max-width: 900px) 100vw, 44vw"
              />
              <div className="xo-labs-who" data-reveal>
                <p className="xp-meta">{labs.whoTitle}</p>
                <ul>
                  {labs.who.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="xo-lab-steps">
            <h3 className="xp-meta" id="xo-lab-steps-title">
              {labs.stepsTitle}
            </h3>
            <ol aria-labelledby="xo-lab-steps-title">
              {labs.steps.map((step, index) => (
                <li key={step.name} data-reveal style={delay(index * 80)}>
                  <span aria-hidden="true">{pad(index + 1)}</span>
                  <strong>{step.name}</strong>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="xo-labs-work">
            <h3 className="xp-meta" id="xo-labs-work-title">
              {labs.workTitle}
            </h3>
            <ul aria-labelledby="xo-labs-work-title">
              {labs.work.map((item) => (
                <li key={item.title} data-reveal>
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                  <ul className="xo-chips" aria-label={"Software for " + item.title}>
                    {item.tools.map((tool) => (
                      <li key={tool}>{tool}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <div className="xo-labs-cta">
              <p>{labs.note}</p>
              <Btn href={labs.cta.href} variant="light">
                {labs.cta.label}
              </Btn>
            </div>
          </div>
        </div>
      </section>

      <ClosingPaths
        label={closing.label}
        title={
          <>
            {closing.title} <em>{closing.titleAccent}</em>
          </>
        }
        lede={
          <>
            {closing.lede}{" "}
            <SmartLink className="xo-inline-link" href={contact.partnershipsHref}>
              {contact.partnerships}
            </SmartLink>
            .
          </>
        }
        paths={closing.paths}
      />

      <StructuredData
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions" },
        ])}
      />
    </main>
  );
}
