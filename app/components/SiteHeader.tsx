"use client";

/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { contact, divisions, navigation, socialLinks } from "@/lib/site-data";

/** The header's inline links. Home is the logo and Contact is the button beside them. */
const primaryLinks = navigation.filter((item) => item.href !== "/" && item.href !== "/contact");

/**
 * Where the header sits. "rest" is its place at the top of the page. Once that
 * has scrolled away it becomes fixed: "parked" and "hidden" keep it off screen,
 * "shown" brings it back while the reader scrolls up.
 */
type Pin = "rest" | "parked" | "hidden" | "shown";

/** Matches `top` on `.floating-header[data-pin]` in site-polish.css. */
const PINNED_TOP = 10;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState<Pin>("rest");
  const pathname = usePathname();
  const header = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuOverlay = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const node = header.current;
    if (!node) return;
    let state: Pin = "rest";
    let restTop = node.offsetTop;
    let last = window.scrollY;
    let frame = 0;

    const apply = (next: Pin) => {
      if (next === state) return;
      state = next;
      setPin(next);
    };
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - last;
      last = y;
      if (state === "rest") {
        restTop = node.offsetTop;
        // Take over only after the resting header is out of view, so nothing jumps.
        if (y > restTop + node.offsetHeight + 40) apply("parked");
        return;
      }
      // At this scroll position the fixed header sits exactly where it rests in the page.
      if (y <= restTop - PINNED_TOP) apply("rest");
      else if (delta < -4) apply("shown");
      else if (delta > 4 && state === "shown") apply("hidden");
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-is-open", open);
    const page = document.getElementById("main-content");
    if (open) page?.setAttribute("inert", "");
    else page?.removeAttribute("inert");

    let focusTimer: number | undefined;
    if (open) {
      wasOpen.current = true;
      focusTimer = window.setTimeout(() => closeButton.current?.focus(), 40);
    } else if (wasOpen.current) {
      menuButton.current?.focus();
      wasOpen.current = false;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!open) return;
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        menuOverlay.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => !element.hasAttribute("disabled"));
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      if (focusTimer) window.clearTimeout(focusTimer);
      page?.removeAttribute("inert");
      document.body.classList.remove("menu-is-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <aside className="announcement" aria-label="About TechM4India">
        <span className="announcement-label">TechM4India Innovations Pvt. Ltd.</span>
        <p>Hyderabad, India · Schools · Engineering · Solutions · Space · Institutes</p>
        <a href="/login">
          ERP login <span aria-hidden="true">↗</span>
        </a>
      </aside>

      <header
        ref={header}
        className="floating-header"
        data-pin={pin === "rest" ? undefined : pin}
      >
        <Link className="brand" href="/" aria-label="TechM4India home">
          <img src="/images/brand/logo.png" alt="" width="48" height="48" />
          <span className="brand-type">
            TECHM4<span>INDIA</span>
          </span>
        </Link>
        <nav className="header-nav" aria-label="Main">
          <ul>
            {primaryLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "page"
                      : undefined
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="header-prompt">Engineering imagination into impact.</p>
        <div className="header-actions">
          <Link className="header-cta" href="/contact">
            <span className="header-cta-long">Partner with us</span>
            <span className="header-cta-short">Contact</span>
            <i aria-hidden="true">↗</i>
          </Link>
          <button
            ref={menuButton}
            className="menu-trigger"
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="site-menu"
            tabIndex={open ? -1 : 0}
            onClick={() => setOpen(true)}
          >
            <span>Menu</span>
            <i aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        ref={menuOverlay}
        id="site-menu"
        className={"menu-overlay" + (open ? " is-open" : "")}
        aria-hidden={!open}
        aria-modal={open ? "true" : undefined}
        role="dialog"
        aria-label="Site navigation"
      >
        <div className="menu-motif" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="menu-top shell">
          <Link
            className="menu-brand"
            href="/"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            <img src="/images/brand/logo.png" alt="" width="50" height="50" />
            <span>TechM4India</span>
          </Link>
          <button
            ref={closeButton}
            className="menu-close"
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            tabIndex={open ? 0 : -1}
          >
            Close <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="menu-body shell">
          <nav aria-label="Primary navigation">
            <p className="menu-label">Navigate</p>
            <ol>
              {navigation.map((item, index) => (
                <li key={item.href}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <Link href={item.href} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>
                    {item.label}
                    <i aria-hidden="true">↗</i>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          <div className="menu-aside">
            <div className="menu-erp-access">
              <p className="menu-label">Internal workspace</p>
              <a href="/login" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>
                Sign in to ERP <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div>
              <p className="menu-label">Our ecosystem</p>
              <ul>
                {divisions.map((division) => (
                  <li key={division.href}>
                    <Link
                      href={division.href}
                      tabIndex={open ? 0 : -1}
                      onClick={() => setOpen(false)}
                    >
                      {division.name}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="menu-contact">
              <p className="menu-label">Start a conversation</p>
              <a href={contact.emailHref} tabIndex={open ? 0 : -1}>
                {contact.email}
              </a>
              <a href={contact.generalPhoneHref} tabIndex={open ? 0 : -1}>
                {contact.generalPhone}
              </a>
              <div>
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    tabIndex={open ? 0 : -1}
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
