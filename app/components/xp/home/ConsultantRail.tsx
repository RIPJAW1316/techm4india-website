"use client";
/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */

import { useCallback, useEffect, useRef, useState } from "react";
import { consultantPhoto, type Consultant } from "@/lib/content/consultants";

const pad = (value: number) => String(value).padStart(2, "0");

/** First letter of the first and last word, e.g. "Sirassu Rashmi" -> "SR". */
function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function Card({ person, index, active }: { person: Consultant; index: number; active: boolean }) {
  const photo = useRef<HTMLImageElement>(null);
  const [missing, setMissing] = useState(false);

  // An image can fail before React attaches onError, so check it once on mount.
  useEffect(() => {
    const node = photo.current;
    if (node && node.complete && node.naturalWidth === 0) setMissing(true);
  }, []);

  return (
    <li
      className={"xh-cons-card" + (active ? " is-active" : "")}
      data-tint={index % 4}
      data-index={index}
    >
      <span className="xh-cons-photo">
        <span className="xh-cons-mono" aria-hidden="true">
          {initials(person.name)}
        </span>
        {!missing && (
          <img
            ref={photo}
            src={consultantPhoto(person.id)}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setMissing(true)}
          />
        )}
        <span className="xp-meta">{pad(index + 1)}</span>
      </span>
      <span className="xh-cons-name">{person.name}</span>
    </li>
  );
}

/**
 * A full-bleed, horizontally scrollable strip of consultants.
 *
 * Native scrolling does the work (touch, trackpad, wheel). On top of it:
 * arrow buttons (the keyboard route), drag-to-scroll with a mouse, a progress
 * rule, and a "now showing" readout that follows the scroll position. The
 * active card is also what carries the colour on touch screens, where there
 * is no hover.
 */
export function ConsultantRail({ people }: { people: Consultant[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [edge, setEdge] = useState({ start: true, end: false });
  const last = people.length - 1;

  const update = useCallback(() => {
    const node = rail.current;
    if (!node) return;
    const max = Math.max(node.scrollWidth - node.clientWidth, 0);
    const progress = max ? Math.min(Math.max(node.scrollLeft / max, 0), 1) : 0;
    bar.current?.style.setProperty("--p", progress.toFixed(4));
    // Maps the first card to the start and the last to the end, so every
    // person is reachable by scrolling and the highlight stays inside view.
    setActive(Math.round(progress * last));
    setEdge((prev) => {
      const next = { start: node.scrollLeft <= 2, end: node.scrollLeft >= max - 2 };
      return prev.start === next.start && prev.end === next.end ? prev : next;
    });
  }, [last]);

  useEffect(() => {
    const node = rail.current;
    if (!node) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    update();
    node.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [update]);

  // Mouse drag. Touch and pen already pan natively.
  useEffect(() => {
    const node = rail.current;
    if (!node) return;
    let startX = 0;
    let startLeft = 0;
    let dragging = false;

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragging = true;
      startX = event.clientX;
      startLeft = node.scrollLeft;
      node.setPointerCapture(event.pointerId);
      node.classList.add("is-dragging");
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging) return;
      node.scrollLeft = startLeft - (event.clientX - startX);
    };
    const onUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      node.classList.remove("is-dragging");
      if (node.hasPointerCapture(event.pointerId)) node.releasePointerCapture(event.pointerId);
    };

    node.addEventListener("pointerdown", onDown);
    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerup", onUp);
    node.addEventListener("pointercancel", onUp);
    return () => {
      node.removeEventListener("pointerdown", onDown);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerup", onUp);
      node.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const scrollBy = (direction: 1 | -1) => {
    const node = rail.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollBy({
      left: direction * node.clientWidth * 0.8,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  return (
    <div className="xh-cons" data-start={edge.start} data-end={edge.end}>
      <div className="xp-shell xh-cons-bar">
        <p className="xh-cons-now" aria-hidden="true">
          <span className="xp-meta">
            <b>{pad(active + 1)}</b> / {pad(people.length)}
          </span>
          <strong key={active}>{people[active]?.name}</strong>
        </p>
        <div className="xh-cons-nav">
          <button
            type="button"
            aria-label="Previous consultants"
            disabled={edge.start}
            onClick={() => scrollBy(-1)}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            aria-label="Next consultants"
            disabled={edge.end}
            onClick={() => scrollBy(1)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div
        className="xh-cons-rail"
        ref={rail}
        role="region"
        aria-label="Consultants. Scroll sideways to see everyone."
      >
        <ul className="xh-cons-track">
          {people.map((person, index) => (
            <Card key={person.id} person={person} index={index} active={index === active} />
          ))}
        </ul>
      </div>

      <div className="xp-shell">
        <div className="xh-cons-progress" aria-hidden="true">
          <span ref={bar} />
        </div>
        <p className="xh-cons-hint xp-meta">{pad(people.length)} consultants in the network</p>
      </div>
    </div>
  );
}
