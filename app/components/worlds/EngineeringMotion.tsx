"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Small motion helpers for the Engineering world. Scroll reveals and parallax
 * are pure CSS (scroll-driven animations in en.css); these cover the two
 * effects CSS cannot do alone. Both stay still for reduced-motion visitors.
 */

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Counts a figure up from zero the first time it scrolls into view, e.g. "30"
 * or a range such as "36–72". The server renders the final value, figures
 * already on screen at load are left alone, and screen readers always get
 * the real value.
 */
export function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const node = ref.current;
    const targets = value.match(/\d+/g)?.map(Number) ?? [];
    if (!node || !targets.length || reducedMotion()) return;

    let frame = 0;
    let armed = false;
    const render = (progress: number) => {
      let index = 0;
      return value.replace(/\d+/g, () => String(Math.round(targets[index++] * progress)));
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (!armed) {
          // First report: already visible means no count, just the value.
          if (entry.isIntersecting) {
            observer.disconnect();
            return;
          }
          armed = true;
          setDisplay(render(0));
          return;
        }
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 4);
          setDisplay(render(eased));
          if (t < 1) frame = window.requestAnimationFrame(tick);
        };
        frame = window.requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <>
      <span ref={ref} className="en-count" aria-hidden="true">
        {display}
      </span>
      <span className="en-sr">{value}</span>
    </>
  );
}

/**
 * A soft light that follows the pointer across any `[data-en-spot]` card.
 * One delegated listener for the whole page; it only writes two custom
 * properties per frame.
 */
export function EngineeringMotion() {
  useEffect(() => {
    if (reducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let frame = 0;
    let pending: { el: HTMLElement; x: number; y: number } | null = null;

    const onMove = (event: PointerEvent) => {
      const el = (event.target as Element | null)?.closest<HTMLElement>("[data-en-spot]");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      pending = { el, x: event.clientX - rect.left, y: event.clientY - rect.top };
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (!pending) return;
        pending.el.style.setProperty("--mx", pending.x + "px");
        pending.el.style.setProperty("--my", pending.y + "px");
      });
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
