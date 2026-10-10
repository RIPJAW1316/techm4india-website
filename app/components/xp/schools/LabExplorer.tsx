"use client";

import { useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import type { Lab } from "@/lib/content/schools";

/**
 * The five labs of the Composite Skill Lab.
 *
 * Server render and no-JS: a list of in-page links followed by all five lab
 * panels, so nothing is hidden. After hydration it becomes an ARIA tab list
 * (arrow keys, Home and End move between labs) showing one panel at a time.
 */

const subscribe = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

export function LabExplorer({
  labs,
  label,
  activitiesLabel,
}: {
  labs: Lab[];
  label: string;
  activitiesLabel: string;
}) {
  const hydrated = useHydrated();
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabId = (lab: Lab) => "xs-lab-tab-" + lab.id;
  const panelId = (lab: Lab) => "xs-lab-" + lab.id;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = labs.length - 1;
    let next = active;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className={"xs-labs" + (hydrated ? " is-tabs" : "")}>
      {hydrated ? (
        <div className="xs-labs-nav" role="tablist" aria-label={label} aria-orientation="vertical">
          {labs.map((lab, index) => (
            <button
              key={lab.id}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={tabId(lab)}
              className="xs-labs-tab"
              aria-selected={index === active}
              aria-controls={panelId(lab)}
              tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={onKeyDown}
            >
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <strong>{lab.name}</strong>
            </button>
          ))}
        </div>
      ) : (
        <nav className="xs-labs-nav" aria-label={label}>
          {labs.map((lab, index) => (
            <a key={lab.id} className="xs-labs-tab" href={"#" + panelId(lab)}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <strong>{lab.name}</strong>
            </a>
          ))}
        </nav>
      )}

      <div className="xs-labs-panels">
        {labs.map((lab, index) => (
          <article
            key={lab.id}
            id={panelId(lab)}
            className="xs-lab"
            {...(hydrated
              ? {
                  role: "tabpanel",
                  "aria-labelledby": tabId(lab),
                  tabIndex: 0,
                  hidden: index !== active,
                }
              : {})}
          >
            <p className="xp-meta">
              Lab {String(index + 1).padStart(2, "0")} of {String(labs.length).padStart(2, "0")}
            </p>
            <h3 className="xs-lab-name">{lab.name}</h3>
            <p className="xs-lab-line">{lab.line}</p>
            <p className="xp-body">{lab.description}</p>
            <div className="xs-lab-do">
              <p className="xp-meta">{activitiesLabel}</p>
              <ul>
                {lab.activities.map((activity) => (
                  <li key={activity}>{activity}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
