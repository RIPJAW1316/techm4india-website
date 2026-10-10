/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */
import type { CSSProperties } from "react";
import { Btn, Kicker, Plate, SectionHead, SmartLink, TextLink } from "../components/xp/Primitives";
import { LabExplorer } from "../components/xp/schools/LabExplorer";
import { MindMap } from "../components/xp/schools/MindMap";
import { StructuredData } from "../components/StructuredData";
import { leads } from "@/lib/content/home";
import {
  audiences,
  closing,
  hero,
  heroInside,
  implementation,
  innovateBharath,
  journey,
  journeyIntro,
  kits,
  kitsIntro,
  labRoom,
  labs,
  labsIntro,
  mindMap,
  nep,
  outcomes,
  outcomesIntro,
  partnershipIntro,
  pillars,
  platforms,
  platformsIntro,
  programmes,
  programmesIntro,
  teamIntro,
  transformation,
  validation,
  validationLedger,
} from "@/lib/content/schools";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "TechM4Schools | From curiosity to capability",
  description:
    "TechM4Schools brings a five-lab Composite Skill Lab, structured programmes, learning kits, CareerBuddy, SchoolOS and the Innovate Bharath challenge into schools.",
  path: "/schools",
});

const pad = (n: number) => String(n).padStart(2, "0");
const delay = (ms: number) => ({ "--delay": ms + "ms" }) as CSSProperties;

// Only client-confirmed validation is published; see lib/content/schools.ts.
const confirmedValidation = validationLedger.filter((entry) => entry.confirmed && entry.detail);

export default function SchoolsPage() {
  return (
    <main className="xp xp-schools">
      {/* A. Hero */}
      <section className="xp-section xp-tone-ink xs-hero" aria-labelledby="xs-hero-title">
        <div className="xp-shell">
          <div className="xs-hero-grid">
            <div className="xs-hero-copy">
              <Kicker index="K-12">{hero.kicker}</Kicker>
              <h1 className="xp-display xs-hero-title" id="xs-hero-title">
                {hero.title + ", "}
                <em>{hero.titleAccent}</em>
              </h1>
              <p className="xp-lede">{hero.lede}</p>
              <div className="xp-actions">
                <Btn href={hero.primaryCta.href}>{hero.primaryCta.label}</Btn>
                <Btn href={hero.secondaryCta.href} variant="line">
                  {hero.secondaryCta.label}
                </Btn>
              </div>
            </div>
            <Plate
              className="xs-hero-plate"
              src={hero.image}
              alt={hero.imageAlt}
              caption={hero.imageCaption}
              note={hero.imageNote}
              ratio="4x5"
              priority
              sizes="(max-width: 900px) 100vw, 40vw"
            />
          </div>

          <nav className="xs-hero-strip" aria-label={heroInside.label}>
            <p className="xp-meta">{heroInside.label}</p>
            <ul>
              {heroInside.items.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>
                    <strong>
                      {item.value}
                      {item.suffix && <sup>{item.suffix}</sup>}
                    </strong>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
            <TextLink href="#innovate-bharath">About Innovate Bharath</TextLink>
          </nav>
        </div>
      </section>

      {/* B. The transformation: before and with TechM4Schools */}
      <section
        className="xp-section xp-tone-white xs-shift"
        id="transformation"
        aria-labelledby="xs-shift-title"
      >
        <div className="xp-shell">
          <SectionHead
            index="01"
            label={transformation.label}
            id="xs-shift-title"
            title={
              <>
                {transformation.title} <em>{transformation.titleAccent}</em>
              </>
            }
            lede={transformation.lede}
          />
          <div className="xs-shift-grid">
            <Plate
              className="xs-shift-plate"
              src={transformation.image}
              alt={transformation.imageAlt}
              caption={transformation.imageCaption}
              note={transformation.imageNote}
              ratio="4x5"
              sizes="(max-width: 900px) 100vw, 34vw"
            />
            <table className="xs-shift-table">
              <caption className="sr-only">
                How a student&apos;s learning changes with TechM4Schools
              </caption>
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only">Aspect</span>
                  </th>
                  <th scope="col">{transformation.beforeLabel}</th>
                  <th scope="col">{transformation.afterLabel}</th>
                </tr>
              </thead>
              <tbody>
                {transformation.shifts.map((shift, index) => (
                  <tr key={shift.aspect} data-reveal style={delay(index * 60)}>
                    <th scope="row">{shift.aspect}</th>
                    <td className="xs-shift-before">{shift.before}</td>
                    <td className="xs-shift-after">{shift.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* B2. Innovate Bharath */}
      <section
        className="xp-section xp-tone-tint xs-ib"
        id="innovate-bharath"
        aria-labelledby="innovate-bharath-title"
      >
        <div className="xp-shell xs-ib-grid">
          <div className="xs-ib-copy" data-reveal>
            <Kicker index="02">{innovateBharath.label}</Kicker>
            <h2 className="xp-title" id="innovate-bharath-title">
              {innovateBharath.title} <em>{innovateBharath.titleAccent}</em>
            </h2>
            <p className="xp-lede">{innovateBharath.body}</p>
            <aside className="xs-note" aria-label={innovateBharath.noteTitle}>
              <p className="xp-meta">{innovateBharath.noteTitle}</p>
              <p>{innovateBharath.note}</p>
              <TextLink href={innovateBharath.cta.href}>{innovateBharath.cta.label}</TextLink>
            </aside>
          </div>

          <div className="xs-ib-data">
            {innovateBharath.figuresConfirmed && (
            <dl className="xs-ib-figures">
              {innovateBharath.figures.map((figure, index) => (
                <div key={figure.label} data-reveal style={delay(index * 90)}>
                  <dt>{figure.label}</dt>
                  <dd>
                    {figure.value}
                    {figure.suffix && <sup>{figure.suffix}</sup>}
                  </dd>
                </div>
              ))}
            </dl>
            )}
            <ol className="xs-ib-steps" aria-label="How Innovate Bharath works">
              {innovateBharath.steps.map((step, index) => (
                <li key={step.title} data-reveal style={delay(index * 80)}>
                  <span aria-hidden="true">{pad(index + 1)}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* C1. Platforms */}
      <section
        className="xp-section xp-tone-white xs-platforms"
        id="platforms"
        aria-labelledby="xs-platforms-title"
      >
        <div className="xp-shell">
          <SectionHead
            index="03"
            label={platformsIntro.label}
            id="xs-platforms-title"
            title={
              <>
                {platformsIntro.title} <em>{platformsIntro.titleAccent}</em>
              </>
            }
            lede={platformsIntro.lede}
          />
          <div className="xs-platform-list">
            {platforms.map((platform, index) => (
              <article className="xs-platform" key={platform.id} id={platform.id} data-reveal>
                <header>
                  <span className="xp-meta">
                    {pad(index + 1)} / {platform.kind}
                  </span>
                  <h3>{platform.name}</h3>
                </header>
                <p className="xp-body">{platform.description}</p>
                <div className="xs-platform-features">
                  <p className="xp-meta">{platform.featuresLabel}</p>
                  <ul>
                    {platform.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* C2. Composite Skill Lab */}
      <section className="xp-section xp-tone-navy xs-labs-section" id="labs" aria-labelledby="xs-labs-title">
        <div className="xp-shell">
          <SectionHead
            index="04"
            label={labsIntro.label}
            id="xs-labs-title"
            title={
              <>
                {labsIntro.title} <em>{labsIntro.titleAccent}</em>
              </>
            }
            lede={labsIntro.lede}
          />
          <LabExplorer
            labs={labs}
            label={labsIntro.explorerLabel}
            activitiesLabel={labsIntro.activitiesLabel}
          />
          <div className="xs-room">
            <Plate
              src={labRoom.image}
              alt={labRoom.imageAlt}
              caption={labRoom.imageCaption}
              note={labRoom.imageNote}
              ratio="3x2"
              sizes="(max-width: 900px) 100vw, 42vw"
            />
            <div className="xs-room-copy" data-reveal>
              <h3 className="xp-subtitle">{labRoom.title}</h3>
              <ul>
                {labRoom.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="xs-room-note">{labRoom.note}</p>
            </div>
          </div>
        </div>
      </section>

      {/* C3. Innovation kits */}
      <section
        className="xp-section xp-section--tight xp-tone-tint xs-kits"
        id="kits"
        aria-labelledby="xs-kits-title"
      >
        <div className="xp-shell xs-kits-grid">
          <Plate
            className="xs-kits-plate"
            src={kitsIntro.image}
            alt={kitsIntro.imageAlt}
            caption={kitsIntro.imageCaption}
            note={kitsIntro.imageNote}
            ratio="4x5"
            sizes="(max-width: 900px) 100vw, 34vw"
          />
          <div className="xs-kits-copy">
            <div className="xs-kits-head" data-reveal>
              <Kicker index="05">{kitsIntro.label}</Kicker>
              <h2 className="xp-title" id="xs-kits-title">
                {kitsIntro.title} <em>{kitsIntro.titleAccent}</em>
              </h2>
              <p className="xp-body">{kitsIntro.body}</p>
            </div>
            <ul className="xs-kit-list">
              {kits.map((kit, index) => (
                <li key={kit.name} data-reveal style={delay(index * 60)}>
                  <span aria-hidden="true">{pad(index + 1)}</span>
                  <h3>{kit.name}</h3>
                  <p>{kit.text}</p>
                </li>
              ))}
            </ul>
            <div className="xs-kits-foot">
              <p>{kitsIntro.note}</p>
              <TextLink href={kitsIntro.cta.href}>{kitsIntro.cta.label}</TextLink>
            </div>
          </div>
        </div>
      </section>

      {/* C4. Student programmes and outcomes */}
      <section className="xp-section xs-programmes" id="programmes" aria-labelledby="xs-programmes-title">
        <div className="xp-shell">
          <SectionHead
            index="06"
            label={programmesIntro.label}
            id="xs-programmes-title"
            title={
              <>
                {programmesIntro.title} <em>{programmesIntro.titleAccent}</em>
              </>
            }
            lede={programmesIntro.lede}
          />
          <ol className="xs-programme-list">
            {programmes.map((programme, index) => (
              <li key={programme.name} data-reveal style={delay((index % 3) * 70)}>
                <span className="xs-programme-no" aria-hidden="true">
                  {pad(index + 1)}
                </span>
                <p className="xs-programme-rhythm">{programme.rhythm}</p>
                <h3>{programme.name}</h3>
                <p>{programme.text}</p>
              </li>
            ))}
          </ol>

          <div className="xs-outcomes">
            <div className="xs-outcomes-head" data-reveal>
              <h3 className="xp-subtitle" id="xs-outcomes-title">
                {outcomesIntro.label}
              </h3>
              <p>{outcomesIntro.note}</p>
            </div>
            <ul className="xs-outcome-list" aria-labelledby="xs-outcomes-title">
              {outcomes.map((outcome) => (
                <li key={outcome.title} data-reveal>
                  <strong>{outcome.title}</strong>
                  <span>{outcome.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* D. Student journey */}
      <section
        className="xp-section xp-tone-ink xs-journey-section"
        id="student-journey"
        aria-labelledby="student-journey-title"
      >
        <div className="xp-shell">
          <SectionHead
            index="07"
            label={journeyIntro.label}
            id="student-journey-title"
            title={
              <>
                {journeyIntro.title} <em>{journeyIntro.titleAccent}</em>
              </>
            }
            lede={journeyIntro.lede}
          />
          <ol className="xs-journey">
            {journey.map((stage, index) => {
              const last = index === journey.length - 1;
              return (
                <li
                  className={"xs-stage" + (last ? " xs-stage--final" : "")}
                  key={stage.id}
                  style={{ "--i": index + 1 } as CSSProperties}
                >
                  <span className="xs-stage-node" aria-hidden="true">
                    {pad(index + 1)}
                  </span>
                  <div className="xs-stage-body" data-reveal>
                    <div className="xs-stage-main">
                      <p className="xp-meta">
                        Stage {pad(index + 1)}
                      </p>
                      <h3>{stage.title}</h3>
                      <p className="xs-stage-text">{stage.happens}</p>
                    </div>
                    <div className="xs-stage-support">
                      <p className="xp-meta">{journeyIntro.supportLabel}</p>
                      <ul>
                        {stage.support.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    {last && (
                      <div className="xs-roles">
                        <TextLink href="#where-it-leads">{journeyIntro.rolesLabel}: see the map</TextLink>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* D2. Mind map: where the journey can lead */}
      <section
        className="xp-section xp-tone-navy xs-map-section"
        id="where-it-leads"
        aria-labelledby="xs-map-title"
      >
        <div className="xp-shell">
          <SectionHead
            index="08"
            label={mindMap.label}
            id="xs-map-title"
            title={
              <>
                {mindMap.title} <em>{mindMap.titleAccent}</em>
              </>
            }
            lede={mindMap.lede}
          />
          <MindMap center={mindMap.center} branches={mindMap.branches} />
          <div className="xs-map-foot">
            <p>{mindMap.note}</p>
            <Btn href={mindMap.cta.href} variant="light">
              {mindMap.cta.label}
            </Btn>
          </div>
        </div>
      </section>

      {/* E. Partnerships and validation */}
      <section className="xp-section xs-partners" id="partnerships" aria-labelledby="xs-partners-title">
        <div className="xp-shell">
          <SectionHead
            index="09"
            label={partnershipIntro.label}
            id="xs-partners-title"
            title={
              <>
                {partnershipIntro.title} <em>{partnershipIntro.titleAccent}</em>
              </>
            }
            lede={partnershipIntro.lede}
          />

          <div className="xs-partners-grid">
            <ol className="xs-pillars">
              {pillars.map((pillar, index) => (
                <li key={pillar.title} data-reveal style={delay(index * 60)}>
                  <span aria-hidden="true">{pad(index + 1)}</span>
                  <div>
                    <h3>{pillar.title}</h3>
                    <p>{pillar.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <aside className="xs-impl" aria-labelledby="xs-impl-title">
              <Plate
                src={implementation.image}
                alt={implementation.imageAlt}
                caption={implementation.imageCaption}
                note={implementation.imageNote}
                ratio="4x3"
                sizes="(max-width: 900px) 100vw, 36vw"
              />
              <h3 className="xp-meta" id="xs-impl-title">
                {implementation.title}
              </h3>
              <ul>
                {implementation.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </aside>
          </div>

          <div className="xs-nep" data-reveal>
            <h3 className="xp-meta">{nep.label}</h3>
            <p>{nep.text}</p>
          </div>

          {confirmedValidation.length > 0 ? (
            <div className="xs-ledger" data-reveal>
              <header>
                <h3 className="xp-subtitle" id="xs-ledger-title">
                  {validation.title}
                </h3>
                <p>{validation.intro}</p>
              </header>
              <ul aria-labelledby="xs-ledger-title">
                {confirmedValidation.map((entry) => (
                  <li key={entry.name}>
                    <strong>{entry.name}</strong>
                    <span>{entry.detail}</span>
                  </li>
                ))}
              </ul>
              <TextLink href={validation.cta.href}>{validation.cta.label}</TextLink>
            </div>
          ) : (
            <div className="xs-references" data-reveal>
              <p>{validation.pending}</p>
              <TextLink href={validation.cta.href}>{validation.cta.label}</TextLink>
            </div>
          )}
        </div>
      </section>

      {/* Programme team: a credit strip, not a card grid */}
      <section
        className="xp-section xp-section--tight xp-tone-tint xs-team"
        aria-labelledby="xs-team-title"
      >
        <div className="xp-shell xs-team-grid">
          <div>
            <Kicker>{teamIntro.label}</Kicker>
            <h2 className="xp-subtitle" id="xs-team-title">
              {teamIntro.title}
            </h2>
          </div>
          <ul className="xs-credits">
            {leads.map((lead) => (
              <li key={lead.name}>
                <img src={lead.image} alt="" width={56} height={56} loading="lazy" decoding="async" />
                <div>
                  <strong>{lead.name}</strong>
                  <span>{lead.role}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* F. Calls to action by audience */}
      <section className="xp-close xp-tone-ink xs-close" id="next-step" aria-labelledby="next-step-title">
        <div className="xp-shell">
          <header className="xp-head" data-reveal>
            <div>
              <Kicker>{closing.label}</Kicker>
              <h2 className="xp-title" id="next-step-title">
                {closing.title} <em>{closing.titleAccent}</em>
              </h2>
            </div>
            <p className="xp-lede">{closing.lede}</p>
          </header>
          <ul className="xs-audiences">
            {audiences.map((path) => (
              <li key={path.audience}>
                <SmartLink className="xs-audience" href={path.href}>
                  <span className="xs-audience-who">For {path.audience.toLowerCase()}</span>
                  <span className="xs-audience-what">
                    <strong>{path.title}</strong>
                    <small>{path.text}</small>
                  </span>
                  <span className="xs-audience-go">
                    {path.action}
                    <i aria-hidden="true">↗</i>
                  </span>
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <StructuredData
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Schools", path: "/schools" },
        ])}
      />
    </main>
  );
}
