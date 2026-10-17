"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import type { Industry } from "@/lib/content/solutions";

const PANEL_ID = "sf-industry-panel";
const tabId = (index: number) => `sf-industry-tab-${index}`;

export function IndustryIndex({ items }: { items: Industry[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const current = items[active] ?? items[0];

  const move = (next: number) => {
    const index = (next + items.length) % items.length;
    setActive(index);
    tabs.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      move(index + 1);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      move(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      move(0);
    } else if (event.key === "End") {
      event.preventDefault();
      move(items.length - 1);
    }
  };

  return (
    <div className="sf-ind">
      <div className="sf-ind-list" role="tablist" aria-label="Industries" aria-orientation="vertical">
        {items.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.name}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              id={tabId(index)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={PANEL_ID}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.name}
            </button>
          );
        })}
      </div>
      <div
        className="sf-ind-stage"
        id={PANEL_ID}
        role="tabpanel"
        aria-labelledby={tabId(active)}
        key={current.name}
      >
        <p>{String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</p>
        <h3>{current.name}</h3>
        <ul>
          {current.builds.map((build) => (
            <li key={build}>{build}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
