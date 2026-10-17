/* eslint-disable @next/next/no-img-element -- Locally hosted editorial photography is part of the static export. */
import Link from "next/link";
import type { EcosystemDivision } from "@/lib/content/home";

/** The five divisions are the homepage's primary navigation, even without JavaScript. */
export function HeroEcosystem({ divisions }: { divisions: EcosystemDivision[] }) {
  return (
    <section className="xh-cover" aria-labelledby="home-title">
      <div className="xh-cover-shell xp-shell">
        <div className="xh-cover-topline">
          <p className="xp-kicker"><b>TechM4India</b><span>Five divisions. One ecosystem.</span></p>
          <span className="xh-cover-edition">Hyderabad · India</span>
        </div>

        <h1 className="xh-cover-title" id="home-title">
          <span>Engineering</span>
          <span>imagination</span>
          <em>into impact.</em>
        </h1>

        <ol className="xh-cover-cards" aria-label="Explore TechM4India divisions">
          {divisions.map((division) => (
            <li className={`xh-cover-item xh-cover-item--${division.id}`} key={division.id}>
              <Link className="xh-cover-card" href={division.href} aria-label={division.cta}>
                <img src={division.image} alt={division.imageAlt} loading="eager" decoding="async" />
                <span className="xh-cover-card-shade" aria-hidden="true" />
                <span className="xh-cover-card-number">{division.index} / 05</span>
                <span className="xh-cover-card-name">{division.short}</span>
                <span className="xh-cover-card-arrow" aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ol>

        <div className="xh-cover-bottom">
          <p>From a first working robot to software in production, we give ideas somewhere to go.</p>
          <Link className="xh-cover-cta" href="#ecosystem">
            Explore the ecosystem <span aria-hidden="true">↘</span>
          </Link>
        </div>
      </div>
      <div className="xh-cover-foot xp-shell">
        <span>Scroll to discover the work</span>
        <span>Student photography is illustrative · Space image: ISRO / Department of Space</span>
      </div>
    </section>
  );
}
