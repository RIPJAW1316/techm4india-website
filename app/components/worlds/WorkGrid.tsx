"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import type { WorkItem, WorkStage } from "@/lib/content/solutions";

type StageLabel = { short: string; filter: string; note: string };

const BADGE: Record<WorkStage, string> = {
  built: "tm-badge tm-badge--green tm-badge--dot",
  platform: "tm-badge",
  concept: "tm-badge tm-badge--grey",
};

/**
 * Selected work as portfolio cards with a stage filter. Every card carries its
 * stage, so a concept is never read as shipped work.
 */
export function WorkGrid({
  items,
  stages,
  stageLabels,
  allLabel,
}: {
  items: WorkItem[];
  stages: readonly WorkStage[];
  stageLabels: Record<WorkStage, StageLabel>;
  allLabel: string;
}) {
  const [active, setActive] = useState<WorkStage | null>(null);
  const visible = items.filter((item) => active === null || item.stage === active);
  const filters: { key: WorkStage | null; label: string; count: number }[] = [
    { key: null, label: allLabel, count: items.length },
    ...stages.map((stage) => ({
      key: stage,
      label: stageLabels[stage].filter,
      count: items.filter((item) => item.stage === stage).length,
    })),
  ];

  return (
    <div className="tm-work">
      <div className="tm-work-bar">
        <div className="tm-pills" role="group" aria-label="Filter work by stage">
          {filters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              className="tm-pill"
              aria-pressed={active === filter.key}
              onClick={() => setActive(filter.key)}
            >
              {filter.label}
              <small aria-hidden="true">{filter.count}</small>
            </button>
          ))}
        </div>
        <p className="tm-small" role="status">
          Showing {visible.length} of {items.length}
        </p>
      </div>

      <ul className="tm-work-grid">
        {visible.map((item) => {
          const internal = item.href.startsWith("/") && !item.href.startsWith("/contact");
          return (
            <li key={item.id} className={"tm-card tm-card--hover tm-work-card is-" + item.stage} id={"work-" + item.id}>
              <div className="tm-work-top">
                <span className={BADGE[item.stage]}>{stageLabels[item.stage].short}</span>
                <span className="tm-small">{item.category}</span>
              </div>
              <h3 className="tm-h3">{item.name}</h3>
              <p className="tm-work-problem">{item.problem}</p>
              <p className="tm-body">{item.does}</p>
              {item.tech && (
                <ul className="tm-chips" aria-label={"Built with, for " + item.name}>
                  {item.tech.map((tech) => (
                    <li key={tech} className="tm-chip">
                      {tech}
                    </li>
                  ))}
                </ul>
              )}
              <p className="tm-small tm-work-note">{stageLabels[item.stage].note}</p>
              {internal ? (
                <Link className="tm-link" href={item.href}>
                  {item.cta}
                  <ArrowRight aria-hidden="true" />
                </Link>
              ) : (
                <a className="tm-link" href={item.href.startsWith("/contact") ? "#contact" : item.href}>
                  {item.cta}
                  <ArrowRight aria-hidden="true" />
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
