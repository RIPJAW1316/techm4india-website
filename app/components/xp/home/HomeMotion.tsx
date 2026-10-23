"use client";

import { useEffect } from "react";

/** Homepage-only motion. Content stays visible when JavaScript is unavailable. */
export function HomeMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".xp-home");
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let directoryFrame = 0;
    const onDivisionClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const summary = target.closest<HTMLElement>(".xh-directory-item summary");
      if (!summary || !root.contains(summary)) return;
      const details = summary.parentElement as HTMLDetailsElement;
      if (details.open) return;
      cancelAnimationFrame(directoryFrame);
      directoryFrame = requestAnimationFrame(() => {
        directoryFrame = requestAnimationFrame(() => {
          summary.scrollIntoView({
            behavior: reducedMotion.matches ? "auto" : "smooth",
            block: "start",
          });
        });
      });
    };
    root.addEventListener("click", onDivisionClick);
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      return () => {
        root.removeEventListener("click", onDivisionClick);
        cancelAnimationFrame(directoryFrame);
      };
    }

    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-home-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -7% 0px" },
    );

    const observe = (node: Element) => {
      const targets = node.matches("[data-home-reveal]")
        ? [node, ...node.querySelectorAll("[data-home-reveal]")]
        : node.querySelectorAll("[data-home-reveal]");
      for (const target of targets) {
        if (seen.has(target)) continue;
        seen.add(target);
        observer.observe(target);
      }
    };

    observe(root);
    root.classList.add("xh-motion-ready");

    // Filtered lists add and remove rows without remounting the page.
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof Element) observe(node);
        }
      }
    });
    mutations.observe(root, { childList: true, subtree: true });

    const cover = root.querySelector<HTMLElement>(".xh-cover");
    let scrollFrame = 0;
    const updateScroll = () => {
      if (scrollFrame || reducedMotion.matches) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        if (!cover) return;
        const rect = cover.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)));
        cover.style.setProperty("--xh-hero-progress", progress.toFixed(3));
      });
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });

    const cards = Array.from(root.querySelectorAll<HTMLElement>(".xh-cover-card"));
    let pointerFrame = 0;
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || reducedMotion.matches) return;
      const card = event.currentTarget as HTMLElement;
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        card.style.setProperty("--xh-tilt-x", `${(-y * 4).toFixed(2)}deg`);
        card.style.setProperty("--xh-tilt-y", `${(x * 4).toFixed(2)}deg`);
        card.classList.add("is-tilting");
      });
    };
    const onPointerLeave = (event: PointerEvent) => {
      const card = event.currentTarget as HTMLElement;
      cancelAnimationFrame(pointerFrame);
      card.classList.remove("is-tilting");
      card.style.removeProperty("--xh-tilt-x");
      card.style.removeProperty("--xh-tilt-y");
    };
    cards.forEach((card) => {
      card.addEventListener("pointermove", onPointerMove);
      card.addEventListener("pointerleave", onPointerLeave);
    });

    return () => {
      root.classList.remove("xh-motion-ready");
      root.removeEventListener("click", onDivisionClick);
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(pointerFrame);
      cancelAnimationFrame(directoryFrame);
      cards.forEach((card) => {
        card.removeEventListener("pointermove", onPointerMove);
        card.removeEventListener("pointerleave", onPointerLeave);
      });
    };
  }, []);

  return null;
}
