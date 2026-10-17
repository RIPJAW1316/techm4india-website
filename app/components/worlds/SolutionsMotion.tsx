"use client";

import { useEffect } from "react";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const supportsViewTimeline = () =>
  typeof CSS !== "undefined" &&
  CSS.supports("animation-timeline", "view()") &&
  CSS.supports("animation-range", "0% 100%");

/**
 * Page-scoped motion for the Solutions foundry.
 * Scroll-driven CSS owns the effects where the browser supports it.
 * This fallback only runs for the gaps, and it never hides content.
 */
export function SolutionsMotion() {
  useEffect(() => {
    const world = document.querySelector<HTMLElement>(".tm-world--solutions");
    if (!world) return;

    const foundry = world.querySelector<HTMLElement>(".sf-foundry");
    const process = world.querySelector<HTMLElement>(".sf-process");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const viewNative = supportsViewTimeline();

    let pointerFrame = 0;
    let scrollFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;

    const paintPointer = () => {
      pointerFrame = 0;
      if (!foundry || motion.matches) return;
      pointerX += (targetX - pointerX) * 0.14;
      pointerY += (targetY - pointerY) * 0.14;
      if (Math.abs(targetX - pointerX) < 0.01) pointerX = targetX;
      if (Math.abs(targetY - pointerY) < 0.01) pointerY = targetY;
      foundry.style.setProperty("--tilt-x", pointerX.toFixed(3));
      foundry.style.setProperty("--tilt-y", pointerY.toFixed(3));
      if (pointerX !== targetX || pointerY !== targetY) {
        pointerFrame = window.requestAnimationFrame(paintPointer);
      }
    };

    const queuePointer = () => {
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(paintPointer);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!foundry || motion.matches || !finePointer.matches) return;
      const rect = foundry.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      targetX = clamp(((event.clientY - rect.top) / rect.height - 0.5) * -1.2, -1, 1);
      targetY = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 1.2, -1, 1);
      queuePointer();
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      queuePointer();
    };

    const paintScroll = () => {
      scrollFrame = 0;
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      world.style.setProperty("--scroll-progress", clamp(window.scrollY / scrollable, 0, 1).toFixed(4));
      if (!viewNative && foundry && !motion.matches) {
        const rect = foundry.getBoundingClientRect();
        const total = Math.max(1, rect.height + window.innerHeight);
        const passed = window.innerHeight - rect.top;
        const progress = clamp(passed / total, 0, 1);
        foundry.style.setProperty("--sf-open", (0.35 + progress * 0.65).toFixed(3));
      }
      if (!viewNative && process && !motion.matches) {
        const rect = process.getBoundingClientRect();
        const start = window.innerHeight * 0.9;
        const travel = Math.max(1, rect.height + window.innerHeight * 0.35);
        const progress = clamp((start - rect.top) / travel, 0, 1);
        process.style.setProperty("--sf-rail", progress.toFixed(3));
        const steps = process.querySelectorAll<HTMLElement>(".sf-step");
        steps.forEach((step, index) => {
          step.classList.toggle("is-lit", progress >= (index + 0.15) / steps.length);
        });
      }
    };

    const queueScroll = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(paintScroll);
    };

    const settle = () => {
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      pointerX = targetX = 0;
      pointerY = targetY = 0;
      foundry?.style.setProperty("--tilt-x", "0");
      foundry?.style.setProperty("--tilt-y", "0");
      if (motion.matches) {
        foundry?.style.setProperty("--sf-open", "0.55");
        process?.style.setProperty("--sf-rail", "1");
        process?.querySelectorAll(".sf-step").forEach((step) => step.classList.add("is-lit"));
      }
    };

    settle();
    paintScroll();
    world.classList.add("motion-ready");

    foundry?.addEventListener("pointermove", onPointerMove, { passive: true });
    foundry?.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("scroll", queueScroll, { passive: true });
    window.addEventListener("resize", queueScroll, { passive: true });
    motion.addEventListener("change", settle);

    return () => {
      foundry?.removeEventListener("pointermove", onPointerMove);
      foundry?.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", queueScroll);
      window.removeEventListener("resize", queueScroll);
      motion.removeEventListener("change", settle);
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      world.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
