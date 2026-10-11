"use client";
/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */

import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { contact, socialLinks } from "@/lib/site-data";
import { tracks } from "@/lib/content/engineering";
import { findProgrammes } from "./EngineeringFinder";

/** Division navigation and footer for the Engineering page. */

export const engineeringNav = [
  { label: "Disciplines", href: "#disciplines" },
  { label: "Programmes", href: "#programmes" },
  { label: "Method", href: "#method" },
  { label: "Labs", href: "#labs" },
  { label: "Campus", href: "#campus" },
  { label: "FAQ", href: "#faq" },
];

function Brand() {
  return (
    <a className="en-brand" href="#top" aria-label="TechM4Engineering, back to top">
      <img src="/images/brand/logo.png" alt="" width={44} height={44} />
      <span>
        <strong>
          TechM4<span>Engineering</span>
        </strong>
        <small>A TechM4India division</small>
      </span>
    </a>
  );
}

export function EngineeringHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState("");
  const burger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section in the middle of the screen.
  useEffect(() => {
    const sections = engineeringNav
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((node): node is HTMLElement => Boolean(node));
    // Sections crossing the middle band of the screen, kept across callbacks
    // so leaving every section (the hero, the contact form) clears the link.
    const inBand = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        });
        const first = sections.find((section) => inBand.has(section.id));
        setCurrent(first ? first.id : "");
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const world = document.querySelector(".en-world");
    const background = world?.querySelectorAll<HTMLElement>(":scope > .en-topbar, :scope > .en-header, :scope > .en, :scope > .en-footer");
    const drawer = document.getElementById("en-drawer");

    if (open) {
      wasOpen.current = true;
      closeButton.current?.focus();
      background?.forEach((node) => node.setAttribute("inert", ""));
    } else if (wasOpen.current) {
      background?.forEach((node) => node.removeAttribute("inert"));
      burger.current?.focus();
    }
    document.body.style.overflow = open ? "hidden" : "";

    const onKey = (event: KeyboardEvent) => {
      if (!open) return;
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !drawer) return;
      const items = [...drawer.querySelectorAll<HTMLElement>("a, button")].filter((item) => !item.hasAttribute("disabled"));
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      background?.forEach((node) => node.removeAttribute("inert"));
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div className="en-topbar">
        <div className="en-container en-topbar-inner">
          <p>Industry-ready engineering programmes and institute labs</p>
          <nav aria-label="Quick links">
            <a href={contact.generalPhoneHref}>
              <Phone aria-hidden="true" />
              {contact.generalPhone}
            </a>
            <a href={contact.partnershipsHref}>
              <Mail aria-hidden="true" />
              {contact.partnerships}
            </a>
            <Link href="/" className="en-topbar-back">
              <ArrowLeft aria-hidden="true" />
              TechM4India
            </Link>
          </nav>
        </div>
      </div>

      <header className={"en-header" + (scrolled ? " is-scrolled" : "")}>
        <div className="en-container en-header-inner">
          <Brand />
          <nav className="en-nav" aria-label="TechM4Engineering">
            {engineeringNav.map((item) => {
              const here = current === item.href.slice(1);
              return (
                <a key={item.href} href={item.href} className={here ? "is-active" : undefined} aria-current={here ? "location" : undefined}>
                  {item.label}
                </a>
              );
            })}
          </nav>
          <div className="en-header-actions">
            <a className="en-btn en-btn--cream en-btn--sm" href="#contact">
              Enquire now
            </a>
            <button
              ref={burger}
              type="button"
              className="en-burger"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="en-drawer"
              onClick={() => setOpen(true)}
            >
              <Menu aria-hidden="true" />
            </button>
          </div>
        </div>
        <span className="en-progress" aria-hidden="true" />
      </header>

      <div
        id="en-drawer"
        className={"en-drawer" + (open ? " is-open" : "")}
        role="dialog"
        aria-modal="true"
        aria-label="TechM4Engineering menu"
      >
        <div className="en-container en-drawer-head">
          <Brand />
          <button ref={closeButton} type="button" className="en-burger is-close" aria-label="Close menu" onClick={() => setOpen(false)}>
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="en-container en-drawer-body">
          <nav aria-label="TechM4Engineering">
            {engineeringNav.map((item, index) => (
              <a key={item.href} href={item.href} style={{ "--k": index } as CSSProperties} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
            <Link href="/" style={{ "--k": engineeringNav.length } as CSSProperties} onClick={() => setOpen(false)}>
              Back to TechM4India
            </Link>
          </nav>
          <a className="en-btn en-btn--cream" href="#contact" onClick={() => setOpen(false)}>
            Enquire now
          </a>
        </div>
      </div>
    </>
  );
}

export function EngineeringFooter() {
  return (
    <footer className="en-footer">
      <div className="en-container en-footer-grid">
        <div className="en-footer-brand">
          <Brand />
          <p>
            Industry tools, real projects and institute-level labs for engineering students across seven
            disciplines. A TechM4India division.
          </p>
          <div className="en-socials">
            {socialLinks.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noreferrer">
                {social.label}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3>Disciplines</h3>
          <ul>
            {tracks.map((track) => (
              <li key={track.id}>
                <button type="button" onClick={() => findProgrammes({ track: track.id })}>
                  {track.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Explore</h3>
          <ul>
            {engineeringNav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
            <li>
              <Link href="/">TechM4India home</Link>
            </li>
            <li>
              <Link href="/solutions">TechM4Solutions</Link>
            </li>
            <li>
              <Link href="/schools">TechM4Schools</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3>Contact</h3>
          <address>
            <span>
              <MapPin aria-hidden="true" />
              {contact.address}
            </span>
            <a href={contact.generalPhoneHref}>
              <Phone aria-hidden="true" />
              {contact.generalPhone}
            </a>
            <a href={contact.partnershipsHref}>
              <Mail aria-hidden="true" />
              {contact.partnerships}
            </a>
          </address>
        </div>
      </div>
      <div className="en-footer-bottom">
        <div className="en-container">
          <span>© {new Date().getFullYear()} TechM4India Innovations Private Limited</span>
          <span>TechM4Engineering · Hyderabad, Telangana</span>
        </div>
      </div>
    </footer>
  );
}
