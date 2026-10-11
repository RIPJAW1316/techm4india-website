"use client";

import { useEffect } from "react";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Lightweight, page-scoped motion inputs for the Solutions world. */
export function SolutionsMotion() {
  useEffect(() => {
    const world = document.querySelector<HTMLElement>(".tm-world--solutions");
    if (!world) return;

    const hero = world.querySelector<HTMLElement>(".tm-hero");
    const glow = hero?.querySelector<HTMLElement>(".tm-hero-glow");
    const reveals = Array.from(
      world.querySelectorAll<HTMLElement>("[data-solution-reveal]"),
    );
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    let pointerFrame = 0;
    let scrollFrame = 0;
    let observer: IntersectionObserver | null = null;
    let pointerX = 50;
    let pointerY = 50;
    let targetX = 50;
    let targetY = 50;
    let heroWidth = hero?.clientWidth ?? 0;
    let heroHeight = hero?.clientHeight ?? 0;

    const revealAll = () => {
      observer?.disconnect();
      observer = null;
      reveals.forEach((element) => element.classList.add("is-visible"));
    };

    const paintPointer = () => {
      pointerFrame = 0;
      if (!hero || motionPreference.matches) return;

      // Ease toward the latest pointer position, then stop requesting frames.
      pointerX += (targetX - pointerX) * 0.16;
      pointerY += (targetY - pointerY) * 0.16;
      if (Math.abs(targetX - pointerX) < 0.05) pointerX = targetX;
      if (Math.abs(targetY - pointerY) < 0.05) pointerY = targetY;
      const offsetX = ((pointerX - 50) / 100) * heroWidth;
      const offsetY = ((pointerY - 50) / 100) * heroHeight;
      if (glow) {
        glow.style.transform = `translate3d(calc(-50% + ${offsetX.toFixed(1)}px), calc(-50% + ${offsetY.toFixed(1)}px), 0)`;
      }

      if (pointerX !== targetX || pointerY !== targetY) {
        pointerFrame = window.requestAnimationFrame(paintPointer);
      }
    };

    const queuePointer = () => {
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(paintPointer);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!hero || motionPreference.matches || !finePointer.matches) return;
      const rect = hero.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      heroWidth = rect.width;
      heroHeight = rect.height;
      targetX = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
      targetY = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
      queuePointer();
    };

    const onPointerLeave = () => {
      targetX = 50;
      targetY = 50;
      queuePointer();
    };

    const paintScroll = () => {
      scrollFrame = 0;
      const worldTop = window.scrollY + world.getBoundingClientRect().top;
      const scrollable = Math.max(1, world.offsetHeight - window.innerHeight);
      const progress = clamp((window.scrollY - worldTop) / scrollable, 0, 1);
      world.style.setProperty("--scroll-progress", progress.toFixed(4));
    };

    const queueScroll = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(paintScroll);
    };

    const onResize = () => {
      heroWidth = hero?.clientWidth ?? 0;
      heroHeight = hero?.clientHeight ?? 0;
      queueScroll();
    };

    const onMotionPreferenceChange = () => {
      if (!motionPreference.matches) return;
      revealAll();
      window.cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      pointerX = targetX = 50;
      pointerY = targetY = 50;
      if (glow) glow.style.transform = "translate3d(-50%, -50%, 0)";
    };

    paintScroll();
    world.classList.add("motion-ready");

    if (motionPreference.matches || typeof IntersectionObserver === "undefined") {
      revealAll();
    } else if (reveals.length) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer?.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
      );
      reveals.forEach((element) => observer?.observe(element));
    }

    hero?.addEventListener("pointermove", onPointerMove, { passive: true });
    hero?.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("scroll", queueScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    motionPreference.addEventListener("change", onMotionPreferenceChange);

    return () => {
      observer?.disconnect();
      hero?.removeEventListener("pointermove", onPointerMove);
      hero?.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", queueScroll);
      window.removeEventListener("resize", onResize);
      motionPreference.removeEventListener("change", onMotionPreferenceChange);
      window.cancelAnimationFrame(pointerFrame);
      window.cancelAnimationFrame(scrollFrame);
      world.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
