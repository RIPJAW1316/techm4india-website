"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Banner carousel for the Schools world. Slides are rendered on the server
 * (the first is visible without JavaScript). Autoplay pauses on hover or
 * focus and is off for visitors who prefer reduced motion.
 */
export function BannerCarousel({ slides, label }: { slides: ReactNode[]; label: string }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [motionOk, setMotionOk] = useState(false);
  const count = slides.length;

  const go = useCallback((index: number) => setActive((index + count) % count), [count]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionOk(!query.matches);
    query.addEventListener("change", sync);
    const first = window.setTimeout(sync, 0);
    return () => {
      query.removeEventListener("change", sync);
      window.clearTimeout(first);
    };
  }, []);

  useEffect(() => {
    if (!motionOk || paused) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % count), 6500);
    return () => window.clearInterval(timer);
  }, [motionOk, paused, count]);

  return (
    <section
      className="sc-hero"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="sc-slides">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={"sc-slide-wrap" + (index === active ? " is-active" : "")}
            role="group"
            aria-roledescription="slide"
            aria-label={index + 1 + " of " + count}
            aria-hidden={index !== active}
            inert={index !== active}
          >
            {slide}
          </div>
        ))}
      </div>
      <div className="sc-hero-controls">
        <div className="sc-container">
          <button type="button" className="sc-arrow" aria-label="Previous slide" onClick={() => go(active - 1)}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <div className="sc-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={"Show slide " + (index + 1)}
                aria-current={index === active}
                onClick={() => go(index)}
              />
            ))}
          </div>
          <button type="button" className="sc-arrow" aria-label="Next slide" onClick={() => go(active + 1)}>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * A horizontal row of cards that scrolls with touch, trackpad or the arrow
 * buttons. The arrows hide at either end.
 */
export function ScrollRow({ children, label }: { children: ReactNode; label: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const update = () =>
      setEdges({
        start: node.scrollLeft <= 4,
        end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 4,
      });
    node.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const first = window.setTimeout(update, 0);
    return () => {
      node.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.clearTimeout(first);
    };
  }, []);

  const scroll = (direction: 1 | -1) => {
    const node = track.current;
    if (!node) return;
    const card = node.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 22 : node.clientWidth * 0.8;
    node.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <div className="sc-row">
      <ul className="sc-row-track" ref={track} aria-label={label}>
        {children}
      </ul>
      <div className="sc-row-nav">
        <button type="button" className="sc-arrow" aria-label="Scroll back" disabled={edges.start} onClick={() => scroll(-1)}>
          <ChevronLeft aria-hidden="true" />
        </button>
        <button type="button" className="sc-arrow" aria-label="Scroll forward" disabled={edges.end} onClick={() => scroll(1)}>
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
