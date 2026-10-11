"use client";
/* eslint-disable @next/next/no-img-element -- Local, approved division photography. */

import { ArrowDownRight, ArrowRight } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { programmeCounts, tracks } from "@/lib/content/engineering";
import { TrackButton } from "./EngineeringFinder";

/** A single photographic stage rather than seven competing cards. */
export function EngineeringDisciplines() {
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const track = tracks[active];

  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowDown") next = (index + 1) % tracks.length;
    else if (event.key === "ArrowUp") next = (index - 1 + tracks.length) % tracks.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tracks.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  }

  return (
    <div className="en-explorer" data-en-reveal="">
      <div className="en-explorer-list" role="group" aria-label="Engineering disciplines">
        {tracks.map((item, index) => (
          <div className="en-explorer-item" data-active={active === index} key={item.id}>
            <button
              ref={(node) => { buttons.current[index] = node; }}
              className="en-explorer-trigger"
              type="button"
              aria-pressed={active === index}
              onClick={() => setActive(index)}
              onFocus={() => setActive(index)}
              onKeyDown={(event) => onKey(event, index)}
            >
              <span className="en-explorer-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="en-explorer-name">{item.name}</span>
              <span className="en-explorer-count">{programmeCounts[item.id]} programmes</span>
              <ArrowDownRight aria-hidden="true" />
            </button>
            <div id={`en-discipline-${item.id}`} className="en-explorer-mobile" hidden={active !== index}>
              <img src={item.image} alt={item.imageAlt} width={1200} height={800} loading="lazy" />
              <p>{item.text}</p>
              <TrackButton track={item.id} className="en-explorer-link">
                Explore {item.short} programmes <ArrowRight aria-hidden="true" />
              </TrackButton>
            </div>
          </div>
        ))}
      </div>
      <div className="en-explorer-stage" aria-live="polite">
        <div className="en-explorer-image" key={track.id}>
          <img
            src={track.image}
            alt={track.imageAlt}
            width={1200}
            height={800}
            style={track.focus ? { objectPosition: track.focus } : undefined}
          />
        </div>
        <div className="en-explorer-caption" key={`${track.id}-caption`}>
          <div>
            <span className="en-explorer-caption-index">Field notes / {String(active + 1).padStart(2, "0")}</span>
            <h3>{track.name}</h3>
            <p>{track.text}</p>
            <ul aria-label={`${track.name} tools`}>
              {track.tools.map((tool) => <li key={tool}>{tool}</li>)}
            </ul>
          </div>
          <TrackButton track={track.id} className="en-explorer-link">
            View {programmeCounts[track.id]} programmes <ArrowRight aria-hidden="true" />
          </TrackButton>
        </div>
      </div>
    </div>
  );
}
