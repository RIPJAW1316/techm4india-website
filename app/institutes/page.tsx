/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */
import type { CSSProperties } from "react";
import { Btn, ClosingPaths, Kicker, Plate, SectionHead, TextLink } from "../components/xp/Primitives";
import { StructuredData } from "../components/StructuredData";
import {
  bootcamps,
  closing,
  creditIntro,
  creditProgrammes,
  hero,
  nstep,
  offer,
  pathway,
  semesterTracks,
  start,
} from "@/lib/content/institutes";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "TechM4Institutes | Programmes for colleges and universities",
  description:
    "TechM4Institutes brings credit-bearing programmes (N-STEP, PDP, RBLP, LSEP), faculty development, lab set-up and campus bootcamps to colleges and universities.",
  path: "/institutes",
});

const pad = (n: number) => String(n).padStart(2, "0");
const delay = (ms: number) => ({ "--delay": ms + "ms" }) as CSSProperties;

export default function InstitutesPage() {
  return (
    <main className="xp xp-institutes">
      {/* Hero */}
      <section className="xp-section xp-tone-ink xi-hero" aria-labelledby="xi-hero-title">
        <div className="xp-shell xi-hero-grid">
          <div className="xi-hero-copy">
            <Kicker index={hero.kickerIndex}>{hero.kicker}</Kicker>
            <h1 className="xp-display xi-hero-title" id="xi-hero-title">
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
          <Plate
            className="xi-hero-plate"
            src={hero.image}
            alt={hero.imageAlt}
            caption={hero.imageCaption}
            note={hero.imageNote}
            ratio="4x5"
            priority
            sizes="(max-width: 900px) 100vw, 40vw"
          />
        </div>
        <nav className="xp-shell xi-index" aria-label="On this page">
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

      {/* What an institution receives */}
      <section className="xp-section xi-offer" id="offer" aria-labelledby="xi-offer-title">
        <div className="xp-shell">
          <SectionHead
            index="01"
            label={offer.label}
            id="xi-offer-title"
            title={
              <>
                {offer.title} <em>{offer.titleAccent}</em>
              </>
            }
            lede={offer.lede}
          />
          <ol className="xi-offer-list">
            {offer.items.map((item, index) => (
              <li key={item.title} data-reveal style={delay((index % 3) * 70)}>
                <span aria-hidden="true">{pad(index + 1)}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Credit programmes */}
      <section
        className="xp-section xp-tone-white xi-credits"
        id="programmes"
        aria-labelledby="xi-credits-title"
      >
        <div className="xp-shell">
          <SectionHead
            index="02"
            label={creditIntro.label}
            id="xi-credits-title"
            title={
              <>
                {creditIntro.title} <em>{creditIntro.titleAccent}</em>
              </>
            }
            lede={creditIntro.lede}
          />
          <div className="xi-credit-grid">
            {creditProgrammes.map((programme, index) => (
              <article className="xi-credit" key={programme.code} data-reveal style={delay(index * 90)}>
                <header>
                  <span className="xi-credit-code">{programme.code}</span>
                  <span className="xi-credit-value">{programme.credits}</span>
                </header>
                <h3>{programme.name}</h3>
                <p>{programme.text}</p>
                <ul aria-label={"What " + programme.code + " covers"}>
                  {programme.covers.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* N-STEP */}
      <section className="xp-section xp-tone-navy xi-nstep" id="n-step" aria-labelledby="xi-nstep-title">
        <div className="xp-shell xi-nstep-grid">
          <div className="xi-nstep-copy" data-reveal>
            <Kicker index="03">{nstep.label}</Kicker>
            <h2 className="xp-title" id="xi-nstep-title">
              {nstep.title} <em>{nstep.titleAccent}</em>
            </h2>
            <p className="xp-lede">{nstep.lede}</p>
            <dl className="xi-facts">
              {nstep.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <ol className="xi-tracks">
            {nstep.tracks.map((track, index) => (
              <li key={track.name} data-reveal style={delay(index * 60)}>
                <span aria-hidden="true">{pad(index + 1)}</span>
                <div>
                  <h3>{track.name}</h3>
                  <p>{track.text}</p>
                </div>
                <small>3 credits · 12 weeks</small>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Four-year pathway */}
      <section className="xp-section xi-pathway" id="pathway" aria-labelledby="xi-pathway-title">
        <div className="xp-shell">
          <SectionHead
            index="04"
            label={pathway.label}
            id="xi-pathway-title"
            title={
              <>
                {pathway.title} <em>{pathway.titleAccent}</em>
              </>
            }
            lede={pathway.lede}
          />
          <ol className="xi-years">
            {pathway.years.map((year, index) => (
              <li key={year.year} data-reveal style={delay(index * 90)}>
                <span className="xi-year-node" aria-hidden="true">
                  {index + 1}
                </span>
                <p className="xp-meta">
                  {year.year} · {year.semesters}
                </p>
                <h3>{year.title}</h3>
                <ul>
                  {year.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <div className="xi-semesters">
            <div className="xi-semesters-head" data-reveal>
              <h3 className="xp-subtitle" id="xi-semesters-title">
                {semesterTracks.label}
              </h3>
              <p>{semesterTracks.lede}</p>
            </div>
            <ol className="xi-semester-list" aria-labelledby="xi-semesters-title">
              {semesterTracks.items.map((item) => (
                <li key={item.stage} data-reveal>
                  <p className="xp-meta">{item.stage}</p>
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                  <ul className="xi-chips" aria-label={"Software in " + item.stage}>
                    {item.tools.map((tool) => (
                      <li key={tool}>{tool}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            <TextLink href={semesterTracks.cta.href}>{semesterTracks.cta.label}</TextLink>
          </div>
        </div>
      </section>

      {/* Bootcamps */}
      <section
        className="xp-section xp-tone-tint xi-bootcamps"
        id="bootcamps"
        aria-labelledby="xi-bootcamps-title"
      >
        <div className="xp-shell">
          <SectionHead
            index="05"
            label={bootcamps.label}
            id="xi-bootcamps-title"
            title={
              <>
                {bootcamps.title} <em>{bootcamps.titleAccent}</em>
              </>
            }
            lede={bootcamps.lede}
          />
          <ul className="xi-camps">
            {bootcamps.items.map((camp, index) => (
              <li
                key={camp.name}
                className={index === 0 ? "is-featured" : undefined}
                data-reveal
                style={delay((index % 3) * 70)}
              >
                <div className="xi-camp-copy">
                  <p className="xi-camp-length">{camp.length}</p>
                  <h3>{camp.name}</h3>
                  <p>{camp.text}</p>
                  <ul aria-label={"About " + camp.name}>
                    {camp.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                  {camp.image && <TextLink href="/contact#contact-form">Bring IGNITE AI to your campus</TextLink>}
                </div>
                {camp.image && (
                  <div className="xi-camp-poster">
                    <img src={camp.image.src} alt={camp.image.alt} loading="lazy" decoding="async" />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How a partnership starts */}
      <section className="xp-section xp-section--tight xi-start" aria-labelledby="xi-start-title">
        <div className="xp-shell">
          <h2 className="xp-kicker" id="xi-start-title">
            <b>06</b>
            <span>{start.label}</span>
          </h2>
          <ol className="xi-steps">
            {start.steps.map((step, index) => (
              <li key={step.name} data-reveal style={delay(index * 70)}>
                <span aria-hidden="true">{pad(index + 1)}</span>
                <h3>{step.name}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ClosingPaths
        label={closing.label}
        title={
          <>
            {closing.title} <em>{closing.titleAccent}</em>
          </>
        }
        lede={closing.lede}
        paths={closing.paths}
      />

      <StructuredData
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Institutes", path: "/institutes" },
        ])}
      />
    </main>
  );
}
