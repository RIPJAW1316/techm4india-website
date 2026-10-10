"use client";

import { useState } from "react";
import { SmartLink } from "../Primitives";
import type { WorkItem, WorkStage } from "@/lib/content/solutions";

type Labels = {
  filterLabel: string;
  allLabel: string;
  problemLabel: string;
  doesLabel: string;
  techLabel: string;
  noTech: string;
};

type StageLabel = { short: string; filter: string; note: string };

/**
 * Selected work as a filterable, expandable ledger.
 *
 * Every entry is rendered on the server inside a native <details>, so the index
 * reads and opens without JavaScript. The filter only toggles `hidden`. Each
 * entry carries its stage, so a concept is never read as shipped work.
 */
export function WorkIndex({
  items,
  stages,
  stageLabels,
  labels,
}: {
  items: WorkItem[];
  stages: readonly WorkStage[];
  stageLabels: Record<WorkStage, StageLabel>;
  labels: Labels;
}) {
  const [active, setActive] = useState<WorkStage | null>(null);
  const visible = items.filter((item) => active === null || item.stage === active);

  const filters: { key: WorkStage | null; label: string; count: number }[] = [
    { key: null, label: labels.allLabel, count: items.length },
    ...stages.map((stage) => ({
      key: stage,
      label: stageLabels[stage].filter,
      count: items.filter((item) => item.stage === stage).length,
    })),
  ];

  return (
    <div className="xo-work">
      <div className="xo-work-bar">
        <p className="xp-meta" id="xo-work-filter-label">
          {labels.filterLabel}
        </p>
        <div className="xo-work-filters" role="group" aria-labelledby="xo-work-filter-label">
          {filters.map((filter) => (
            <button
              type="button"
              className="xo-filter"
              key={filter.label}
              aria-pressed={active === filter.key}
              onClick={() => setActive(filter.key)}
            >
              <span>{filter.label}</span>
              <small aria-hidden="true">{String(filter.count).padStart(2, "0")}</small>
            </button>
          ))}
        </div>
        <p className="xp-meta xo-work-count" role="status">
          Showing {visible.length} of {items.length}
        </p>
      </div>

      <ol className="xo-work-list">
        {items.map((item, index) => (
          <li
            className={"xo-work-item is-" + item.stage}
            key={item.id}
            id={"work-" + item.id}
            hidden={!visible.includes(item)}
          >
            <details name="xo-work" open={index === 0}>
              <summary>
                <span className="xo-work-no" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="xo-work-title">
                  <h3 className="xo-work-name">{item.name}</h3>
                  <span className="xo-work-cat">{item.category}</span>
                </span>
                <span className={"xo-stage is-" + item.stage}>{stageLabels[item.stage].short}</span>
                <i className="xo-work-toggle" aria-hidden="true" />
              </summary>
              <div className="xo-work-body">
                <p className="xo-work-stage-note">{stageLabels[item.stage].note}</p>
                <div className="xo-work-col">
                  <p className="xp-meta">{labels.problemLabel}</p>
                  <p>{item.problem}</p>
                </div>
                <div className="xo-work-col">
                  <p className="xp-meta">{labels.doesLabel}</p>
                  <p>{item.does}</p>
                </div>
                <div className="xo-work-col xo-work-side">
                  <p className="xp-meta">{labels.techLabel}</p>
                  {item.tech ? (
                    <ul className="xo-work-tech">
                      {item.tech.map((tech) => (
                        <li key={tech}>{tech}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="xo-work-empty">{labels.noTech}</p>
                  )}
                  <SmartLink
                    className="xp-link"
                    href={item.href}
                    aria-label={item.cta + ": " + item.name}
                  >
                    <span>{item.cta}</span>
                    <i aria-hidden="true">↗</i>
                  </SmartLink>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}
