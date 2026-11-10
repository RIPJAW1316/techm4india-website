"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll reveals for every `[data-reveal]` element.
 *
 * Content is visible by default. It is only held back for a reveal once this
 * script is running (`reveal-ready` on <html>), so a slow connection or a
 * failed script never leaves a page blank. Anything already on screen when the
 * script starts is marked visible first, so the top of the page does not blink.
 */
export function MotionController() {
  const pathname = usePathname();

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const root = document.documentElement;
    if (!root.classList.contains("reveal-ready")) {
      const viewport = window.innerHeight;
      elements.forEach((element) => {
        const bounds = element.getBoundingClientRect();
        if (bounds.top < viewport && bounds.bottom > 0) element.classList.add("is-visible");
      });
      root.classList.add("reveal-ready");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    elements.forEach((element) => {
      if (!element.classList.contains("is-visible")) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
