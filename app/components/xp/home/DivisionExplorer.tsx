/* eslint-disable @next/next/no-img-element -- Locally hosted editorial photography is part of the static export. */
import Link from "next/link";
import type { EcosystemDivision } from "@/lib/content/home";

/** A compact, progressively enhanced directory following the photographic hero. */
export function DivisionExplorer({ divisions }: { divisions: EcosystemDivision[] }) {
  return (
    <div className="xh-directory">
      <p className="xh-directory-guidance">Select a division to explore its work, people and tools.</p>
      {divisions.map((division, index) => (
        <details className="xh-directory-item" id={`division-${division.id}`} key={division.id} open={index === 0}>
          <summary>
            <span className="xh-directory-index">{division.index}</span>
            <span className="xh-directory-name">{division.name}</span>
            <span className="xh-directory-stage">{division.stage}</span>
            <span className="xh-directory-toggle" aria-hidden="true">↗</span>
          </summary>
          <div className="xh-directory-panel">
            <figure className="xh-directory-media">
              <img src={division.image} alt={division.imageAlt} loading="lazy" decoding="async" />
              {division.imageCredit && <figcaption>{division.imageCredit}</figcaption>}
            </figure>
            <div className="xh-directory-copy">
              <p className="xp-meta">For {division.serves.toLowerCase()}</p>
              <h3>{division.line}</h3>
              <p className="xp-body">{division.description}</p>
              <div className="xh-directory-facts">
                <div>
                  <p className="xp-meta">Inside the division</p>
                  <ul>{division.inside.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div>
                  <p className="xp-meta">{division.toolsLabel}</p>
                  <ul>{division.tools.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              </div>
              <Link className="xh-directory-link" href={division.href}>{division.cta}<span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
