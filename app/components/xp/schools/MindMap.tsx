"use client";
/* eslint-disable @next/next/no-img-element -- Optimized local WebP images are swapped by the interaction. */

import { useState, type CSSProperties } from "react";
import type { MapBranch } from "@/lib/content/schools";

/**
 * The student mind map: one student, five branches, five directions.
 *
 * Nodes are HTML positioned in percentages; the connectors are an SVG in the
 * same 0-100 coordinate space (stretched with preserveAspectRatio="none"), so
 * lines meet nodes at any width. Choosing a direction (click, hover or the
 * keyboard) lights its path and shows how a student travels it. Below 900px
 * the map becomes a stacked list and the SVG is hidden.
 */

// Node rows, top to bottom, as percentages of the map's height.
const ROWS = [10, 30, 50, 70, 90];

const article = (word: string) => (/^[aeiou]/i.test(word) ? "an" : "a");

export function MindMap({
  center,
  branches,
}: {
  center: string;
  branches: MapBranch[];
}) {
  const [active, setActive] = useState(0);
  const current = branches[active];

  return (
    <div className="xs-map">
      <div className="xs-map-canvas">
        <svg className="xs-map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {branches.map((branch, index) => {
            const y = ROWS[index] ?? 50;
            const on = index === active;
            return (
              <g key={branch.id} className={on ? "is-active" : undefined}>
                <path d={`M 25 50 C 32 50, 31 ${y}, 38 ${y}`} vectorEffect="non-scaling-stroke" />
                <path d={`M 58 ${y} L 76 ${y}`} vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}
        </svg>

        <div className="xs-map-center">
          <span className="xp-meta">Start</span>
          <strong>{center}</strong>
        </div>

        <div className="xs-map-rows" role="group" aria-label="Directions a student can grow toward">
          {branches.map((branch, index) => {
            const on = index === active;
            return (
              <div
                key={branch.id}
                className={"xs-map-row" + (on ? " is-active" : "")}
                style={{ "--y": (ROWS[index] ?? 50) + "%" } as CSSProperties}
              >
                <div className="xs-map-branch" onMouseEnter={() => setActive(index)}>
                  <strong>{branch.branch}</strong>
                  <span>{branch.branchDetail}</span>
                </div>
                <i className="xs-map-arrow" aria-hidden="true" />
                <button
                  type="button"
                  className="xs-map-outcome"
                  aria-pressed={on}
                  aria-controls="xs-map-detail"
                  onClick={() => setActive(index)}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                >
                  <span className="sr-only">Show how a student becomes a </span>
                  <img src={branch.image} alt="" loading="lazy" width={30} height={30} />
                  {branch.outcome}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="xs-map-detail" id="xs-map-detail" aria-live="polite">
        <figure className="xs-map-image" key={current.id}>
          <img src={current.image} alt={current.imageAlt} loading="lazy" width={1500} height={1000} />
          <figcaption>Illustrative learning scene</figcaption>
        </figure>
        <p className="xp-meta">
          {current.branch} · {current.branchDetail}
        </p>
        <h3>
          Becoming {article(current.outcome)} <em>{current.outcome.toLowerCase()}</em>
        </h3>
        <ol>
          <li>
            <span aria-hidden="true">00</span>
            {center}.
          </li>
          {current.path.map((step, index) => (
            <li key={step}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {step}
            </li>
          ))}
          <li className="is-outcome">
            <span aria-hidden="true">→</span>
            {current.outcome}
          </li>
        </ol>
      </div>
    </div>
  );
}
