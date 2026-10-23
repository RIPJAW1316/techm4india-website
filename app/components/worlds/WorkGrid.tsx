"use client";
/* eslint-disable @next/next/no-img-element -- Local imagery supports the static Vinext build. */

import Link from "next/link";
import { useEffect, useState } from "react";
import type { WorkItem, WorkStage } from "@/lib/content/solutions";

type StageLabel = { short: string; filter: string; note: string };

type Featured = {
  label: string;
  name: string;
  title: string;
  titleAccent: string;
  lede: string;
  modulesTitle: string;
  modules: readonly string[];
  divisionsNote: string;
  cta: { label: string; href: string };
};

function destination(href: string) {
  return href.startsWith("/contact") ? "#contact" : href;
}

function isInternal(href: string) {
  return href.startsWith("/") && !href.startsWith("/contact");
}

function WorkLink({ item }: { item: WorkItem }) {
  const href = destination(item.href);
  const content = (
    <>
      {item.cta}
      <span aria-hidden="true"> →</span>
    </>
  );
  return isInternal(item.href) ? (
    <Link className="sf-textlink" href={href}>
      {content}
    </Link>
  ) : (
    <a className="sf-textlink" href={href}>
      {content}
    </a>
  );
}

const conceptVisuals: Record<string, { signal: string; markers: string[] }> = {
  "airguard-pro": { signal: "ULTRASONIC / LEAK DETECTION", markers: ["AIR LINE", "SENSOR", "SIGNAL"] },
  acousticast: { signal: "ACOUSTIC / SOLIDIFICATION", markers: ["MOULD", "EMISSION", "ALERT"] },
  foodspectra: { signal: "SPECTRAL / SAMPLE ANALYSIS", markers: ["SAMPLE", "SCAN", "READOUT"] },
  itcmax: { signal: "RECONCILIATION / TAX DATA", markers: ["INVOICE", "MATCH", "ALERT"] },
};

function ConceptVisual({ id }: { id: string }) {
  const visual = conceptVisuals[id];
  if (!visual) return null;
  return (
    <div className={`sf-concept-visual sf-concept-visual--${id}`} aria-label={`${visual.signal.toLowerCase()} conceptual diagram`} role="img">
      <span className="sf-concept-visual-label">{visual.signal}</span>
      <span className="sf-concept-orbit" aria-hidden="true" />
      <span className="sf-concept-device" aria-hidden="true">
        <i /><i /><i /><i /><i />
      </span>
      <span className="sf-concept-readout" aria-hidden="true">01 / 02 / 03</span>
      <span className="sf-concept-visual-foot">{visual.markers.join("  /  ")} <b>Concept visualization</b></span>
    </div>
  );
}

export function WorkGrid({
  items,
  stages,
  stageLabels,
  allLabel,
  problemLabel,
  doesLabel,
  techLabel,
  noTech,
  featured,
}: {
  items: WorkItem[];
  stages: readonly WorkStage[];
  stageLabels: Record<WorkStage, StageLabel>;
  allLabel: string;
  problemLabel: string;
  doesLabel: string;
  techLabel: string;
  noTech: string;
  featured: Featured;
}) {
  const [active, setActive] = useState<WorkStage | null>(null);
  useEffect(() => {
    const revealFeatured = () => {
      if (window.location.hash === "#featured") setActive(null);
    };
    const onFeaturedLink = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('a[href="#featured"]')) {
        setActive(null);
      }
    };
    revealFeatured();
    window.addEventListener("hashchange", revealFeatured);
    document.addEventListener("click", onFeaturedLink);
    return () => {
      window.removeEventListener("hashchange", revealFeatured);
      document.removeEventListener("click", onFeaturedLink);
    };
  }, []);
  const visible = items.filter((item) => active === null || item.stage === active);
  const built = visible.filter((item) => item.stage === "built");
  const platforms = visible.filter((item) => item.stage === "platform");
  const concepts = visible.filter((item) => item.stage === "concept");
  const filters: { key: WorkStage | null; label: string; count: number }[] = [
    { key: null, label: allLabel, count: items.length },
    ...stages.map((stage) => ({
      key: stage,
      label: stageLabels[stage].filter,
      count: items.filter((item) => item.stage === stage).length,
    })),
  ];

  return (
    <div className="sf-work">
      <div className="sf-work-bar">
        <div className="sf-filters" role="group" aria-label="Filter work by stage">
          {filters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              aria-pressed={active === filter.key}
              onClick={() => setActive(filter.key)}
            >
              {filter.label}
              <small>{filter.count}</small>
            </button>
          ))}
        </div>
        <p role="status">
          Showing {visible.length} of {items.length}
        </p>
      </div>

      <div id="featured">
        {built.map((item) => (
          <article className="sf-case" id={"work-" + item.id} key={item.id}>
            <div className="sf-case-copy">
              <p>
                <span>{featured.label}</span>
                <span>{stageLabels.built.short}</span>
              </p>
              <h3>{item.name}</h3>
              <p className="sf-case-dek">
                {featured.title} {featured.titleAccent}
              </p>
              <p>{featured.lede}</p>
              <p>
                <strong>{problemLabel}.</strong> {item.problem}
              </p>
              {item.tech && (
                <p>
                  <strong>{techLabel}.</strong> {item.tech.join(", ")}
                </p>
              )}
              <p className="sf-stage-note">{stageLabels.built.note}</p>
              <Link className="sf-btn" href={featured.cta.href}>
                {featured.cta.label}
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
            <div className="sf-case-modules">
              <p>{featured.modulesTitle}</p>
              <ul>
                {featured.modules.map((module) => (
                  <li key={module}>{module}</li>
                ))}
              </ul>
              <p>{featured.divisionsNote}</p>
            </div>
          </article>
        ))}
      </div>

      {platforms.length > 0 && (
        <ul className="sf-platforms">
          {platforms.map((item) => (
            <li key={item.id} id={"work-" + item.id}>
              <figure className="sf-platform-visual">
                <img
                  src={item.id === "careerbuddy" ? "/images/schools/school-career-discovery.webp" : "/images/schools/computer-lab.webp"}
                  alt={item.id === "careerbuddy" ? "Student researching with a book and computer in a library" : "Students working at computers in a learning space"}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>Illustrative education scene <span>{item.id === "careerbuddy" ? "Explore strengths → directions" : "Connect students → programmes"}</span></figcaption>
              </figure>
              <p>
                <span>{stageLabels.platform.short}</span>
                <span>{item.category}</span>
              </p>
              <h3>{item.name}</h3>
              <p>
                <strong>{problemLabel}.</strong> {item.problem}
              </p>
              <p>
                <strong>{doesLabel}.</strong> {item.does}
              </p>
              <p className="sf-stage-note">{stageLabels.platform.note}</p>
              <WorkLink item={item} />
            </li>
          ))}
        </ul>
      )}

      {concepts.length > 0 && (
        <ul className="sf-concepts">
          {concepts.map((item, index) => (
            <li key={item.id} id={"work-" + item.id}>
              <ConceptVisual id={item.id} />
              <p>
                <span>Concept {String(index + 1).padStart(2, "0")}</span>
                <span>{stageLabels.concept.short}</span>
              </p>
              <h3>{item.name}</h3>
              <p className="sf-concept-cat">{item.category}</p>
              <p>
                <strong>{problemLabel}.</strong> {item.problem}
              </p>
              <p>
                <strong>{doesLabel}.</strong> {item.does}
              </p>
              <p>
                <strong>Proposed stack.</strong> {item.tech?.join(", ") || noTech}
              </p>
              <p className="sf-stage-note">{stageLabels.concept.note}</p>
              <WorkLink item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
