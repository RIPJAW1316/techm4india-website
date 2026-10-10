"use client";

import { useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import type { EcosystemDivision } from "@/lib/content/home";
import { Plate, SmartLink } from "../Primitives";

/**
 * The five divisions, explored one at a time.
 *
 * Server render and no-JS: every division panel is rendered in full, one after
 * another, so nothing is hidden. After hydration it becomes an ARIA tab list
 * (arrow keys, Home and End move between divisions). A link to
 * #division-<id> opens that division's tab.
 */

const subscribe = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

const subscribeHash = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
const useHash = () =>
  useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => "",
  );

export function DivisionExplorer({ divisions }: { divisions: EcosystemDivision[] }) {
  const hydrated = useHydrated();
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const panelId = (division: EcosystemDivision) => "division-" + division.id;
  const tabId = (division: EcosystemDivision) => "division-tab-" + division.id;

  // Follow #division-<id> links, including ones clicked after load. The hash
  // seen on the previous render is kept so a new hash selects its tab once.
  const hash = useHash();
  const [seenHash, setSeenHash] = useState(hash);
  if (hash !== seenHash) {
    setSeenHash(hash);
    const index = divisions.findIndex((division) => "#" + panelId(division) === hash);
    if (index >= 0) setActive(index);
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = divisions.length - 1;
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
    <div className={"xh-explorer" + (hydrated ? " is-tabs" : "")}>
      {hydrated && (
        <div className="xh-explorer-tabs" role="tablist" aria-label="TechM4India divisions">
          {divisions.map((division, index) => (
            <button
              key={division.id}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={tabId(division)}
              className="xh-explorer-tab"
              aria-selected={index === active}
              aria-controls={panelId(division)}
              tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={onKeyDown}
            >
              <span className="xh-explorer-no" aria-hidden="true">
                {division.index}
              </span>
              <span className="xh-explorer-name">{division.short}</span>
              <span className="xh-explorer-stage">{division.stage}</span>
            </button>
          ))}
        </div>
      )}

      <div className="xh-explorer-panels">
        {divisions.map((division, index) => (
          <article
            key={division.id}
            id={panelId(division)}
            className="xh-explorer-panel"
            aria-labelledby={hydrated ? tabId(division) : panelId(division) + "-title"}
            {...(hydrated ? { role: "tabpanel", tabIndex: 0, hidden: index !== active } : {})}
          >
            <SmartLink className="xh-explorer-media" href={division.href} aria-label={division.cta}>
              <Plate
                src={division.image}
                alt={division.imageAlt}
                caption={division.name}
                note={division.imageCredit ?? division.index + " / 0" + divisions.length}
                ratio="16x9"
                sizes="(max-width: 900px) 100vw, 60vw"
              />
            </SmartLink>
            <div className="xh-explorer-body">
              <p className="xp-meta">
                {division.index} · For {division.serves.toLowerCase()}
              </p>
              <h3 className="xh-explorer-title" id={panelId(division) + "-title"}>
                {division.name}
              </h3>
              <p className="xh-explorer-line">{division.line}</p>
              <p className="xp-body">{division.description}</p>
              <div className="xh-explorer-cols">
                <div>
                  <p className="xp-meta">Inside</p>
                  <ul className="xh-explorer-inside">
                    {division.inside.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="xp-meta">{division.toolsLabel}</p>
                  <ul className="xh-explorer-tools">
                    {division.tools.map((tool) => (
                      <li key={tool}>{tool}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <SmartLink className="xp-btn" href={division.href}>
                <span>{division.cta}</span>
                <i aria-hidden="true">↗</i>
              </SmartLink>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
