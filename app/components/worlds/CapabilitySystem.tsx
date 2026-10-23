"use client";
/* eslint-disable @next/next/no-img-element -- Optimized local WebP images keep the interactive scene lightweight. */

import { useRef, useState, type KeyboardEvent } from "react";
import type { Service } from "@/lib/content/solutions";

const DIAGRAMS = {
  "AI and agentic AI solutions": "ai",
  "Software development": "software",
  "Mobile app development": "mobile",
  "ERP and enterprise systems": "erp",
  "Cloud and DevOps": "cloud",
  "Data and analytics": "data",
} as const;

type Kind = (typeof DIAGRAMS)[keyof typeof DIAGRAMS];
const PHOTOS: Record<Kind, { src: string; alt: string }> = {
  ai: { src: "/images/solutions/product-planning.webp", alt: "Team discussing a problem around a computer" },
  software: { src: "/images/solutions/software-detail.webp", alt: "Hands writing code on a laptop" },
  mobile: { src: "/images/solutions/mobile-interface.webp", alt: "Smartphone showing applications on a desk" },
  erp: { src: "/images/solutions/workspace.webp", alt: "Laptop displaying application code on a desk" },
  cloud: { src: "/images/solutions/cloud-infrastructure.webp", alt: "Server equipment in a data center" },
  data: { src: "/images/solutions/analytics.webp", alt: "A graph being studied on a laptop" },
};
const PANEL_ID = "sf-capability-panel";
const tabId = (index: number) => `sf-capability-tab-${index}`;

function Diagram({ kind, items }: { kind: Kind; items: string[] }) {
  if (kind === "ai") {
    return (
      <div className="sf-diagram sf-diagram--ai" data-kind="ai">
        <p>Schematic · agent loop</p>
        <div className="sf-ai">
          <i className="sf-ai-ring" aria-hidden="true" />
          <span>Observe</span>
          <span>Decide</span>
          <span>Act</span>
        </div>
      </div>
    );
  }
  if (kind === "software") {
    return (
      <div className="sf-diagram sf-diagram--software" data-kind="software">
        <p>Schematic · product frame</p>
        <div className="sf-frame" aria-hidden="true">
          <header>
            <i />
            <i />
            <i />
            <b>Application</b>
          </header>
          <div>
            <aside />
            <section>
              <span />
              <span />
              <span />
            </section>
          </div>
        </div>
      </div>
    );
  }
  if (kind === "mobile") {
    return (
      <div className="sf-diagram sf-diagram--mobile" data-kind="mobile">
        <p>Schematic · two surfaces</p>
        <div className="sf-phones" aria-hidden="true">
          <div className="sf-phone">
            <b />
            <span />
            <span />
            <span />
          </div>
          <div className="sf-phone sf-phone--small">
            <b />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }
  if (kind === "erp") {
    return (
      <div className="sf-diagram sf-diagram--erp" data-kind="erp">
        <p>Schematic · divisions in the ERP</p>
        <div className="sf-hub" aria-hidden="true">
          <span>Leadership</span>
          <span>Engineering</span>
          <strong>Company</strong>
          <span>Schools</span>
          <span>Space</span>
          <span>Solutions</span>
        </div>
      </div>
    );
  }
  if (kind === "cloud") {
    return (
      <div className="sf-diagram sf-diagram--cloud" data-kind="cloud">
        <p>Schematic · delivery line</p>
        <div className="sf-pipe">
          <ol>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <i aria-hidden="true" />
        </div>
      </div>
    );
  }
  return (
    <div className="sf-diagram sf-diagram--data" data-kind="data">
      <p>Schematic · published outputs</p>
      <ol className="sf-scan">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </div>
  );
}

export function CapabilitySystem({ services }: { services: Service[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const service = services[active] ?? services[0];
  const kind = DIAGRAMS[service.title as keyof typeof DIAGRAMS] ?? "software";

  const move = (next: number) => {
    const count = services.length;
    const index = (next + count) % count;
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
      move(services.length - 1);
    }
  };

  return (
    <div className="sf-caps">
      <div className="sf-tabs" role="tablist" aria-label="Capabilities" aria-orientation="vertical">
        {services.map((item, index) => {
          const selected = index === active;
          const itemKind = DIAGRAMS[item.title as keyof typeof DIAGRAMS] ?? "software";
          return (
            <button
              key={item.title}
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
              <span className="sf-tab-title">{item.title}</span>
              <img src={PHOTOS[itemKind].src} alt="" loading="lazy" width={96} height={72} />
            </button>
          );
        })}
      </div>
      <div
        className="sf-panel"
        id={PANEL_ID}
        role="tabpanel"
        aria-labelledby={tabId(active)}
        key={service.title}
      >
        <div className="sf-panel-copy">
          <p className="sf-kicker">Capability {String(active + 1).padStart(2, "0")}</p>
          <h3>{service.title}</h3>
          <p>{service.text}</p>
          <ul>
            {service.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="sf-panel-visual">
          <img src={PHOTOS[kind].src} alt={PHOTOS[kind].alt} loading="lazy" width={1500} height={1000} />
          <Diagram kind={kind} items={service.items} />
          <span className="sf-visual-note">Illustrative engineering scene</span>
        </div>
      </div>
    </div>
  );
}
