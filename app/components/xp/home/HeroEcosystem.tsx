"use client";

/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */

import Link from "next/link";
import { useEffect, useState } from "react";
import type { EcosystemDivision } from "@/lib/content/home";

const CYCLE_MS = 5600;

/**
 * The landing hero. The five divisions are the navigation: pointing at one
 * (hover, focus or tap) brings its photograph forward, and the index advances
 * on its own until the visitor interacts or asks for reduced motion.
 */
export function HeroEcosystem({ divisions }: { divisions: EcosystemDivision[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // Only the first photograph ships with the page; the rest mount once the
  // page is idle so they never compete with the first paint.
  const [allImages, setAllImages] = useState(false);
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAutoplay(!reduce.matches);
    sync();
    reduce.addEventListener("change", sync);
    const timer = window.setTimeout(() => setAllImages(true), 1400);
    return () => {
      reduce.removeEventListener("change", sync);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!autoplay || paused || !allImages) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % divisions.length),
      CYCLE_MS,
    );
    return () => window.clearInterval(timer);
  }, [autoplay, paused, allImages, divisions.length]);

  const current = divisions[active];

  return (
    <section
      className="xh-hero xp-tone-ink"
      aria-labelledby="home-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="xh-hero-stage" aria-hidden="true">
        {divisions.map((division, index) =>
          index === 0 || allImages ? (
            <img
              key={division.id}
              className={index === active ? "is-active" : undefined}
              src={division.image}
              alt=""
              decoding="async"
              {...(index === 0
                ? { fetchPriority: "high" as const, loading: "eager" as const }
                : { loading: "lazy" as const })}
            />
          ) : null,
        )}
      </div>

      <div className="xh-hero-inner xp-shell">
        <div className="xh-hero-copy">
          <p className="xp-kicker">
            <b>TechM4India</b>
            <span>Hyderabad, India</span>
          </p>
          <h1 className="xp-display" id="home-title">
            Engineering imagination <em>into impact.</em>
          </h1>
          <p className="xh-hero-lede">
            One ecosystem where school students, engineering undergraduates, institutions and
            companies build real technology: from a first working robot to software in production.
          </p>
          <div className="xp-actions">
            <Link className="xp-btn" href="#ecosystem">
              <span>Explore the ecosystem</span>
              <i aria-hidden="true">↓</i>
            </Link>
            <Link className="xp-btn xp-btn--line" href="/contact">
              <span>Partner with us</span>
              <i aria-hidden="true">↗</i>
            </Link>
          </div>
        </div>

        <nav className="xh-hero-index" aria-label="TechM4India divisions">
          <p className="xp-meta">Five divisions, one ecosystem</p>
          <ol>
            {divisions.map((division, index) => (
              <li key={division.id} className={index === active ? "is-active" : undefined}>
                <Link
                  href={division.href}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                >
                  <span className="xh-hero-index-no">{division.index}</span>
                  <span className="xh-hero-index-name">{division.name}</span>
                  <span className="xh-hero-index-line">{division.serves}</span>
                  <i aria-hidden="true">↗</i>
                </Link>
                {index === active && autoplay && !paused && allImages && (
                  <span className="xh-hero-progress" aria-hidden="true" key={"p" + active} />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <p className="xh-hero-caption" aria-live="off">
        <span>{current.imageAlt}</span>
        {current.imageCredit && <span>{current.imageCredit}</span>}
      </p>
    </section>
  );
}
