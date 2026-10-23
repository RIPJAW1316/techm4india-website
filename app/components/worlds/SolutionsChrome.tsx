"use client";
/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { contact, socialLinks } from "@/lib/site-data";

/**
 * The TechM4Solutions world's own chrome: a contact top bar, a sticky white
 * header with in-page navigation, and a navy footer. The site-wide header and
 * footer are hidden on this route (see tm.css), so the division reads as its
 * own site while the top bar keeps a way back to TechM4India.
 */

export const solutionsNav = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Industries", href: "#industries" },
  { label: "Labs", href: "#labs" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

function Brand({ onDark = false }: { onDark?: boolean }) {
  return (
    <a className="tm-brand" href="#top" aria-label="TechM4Solutions, back to top">
      <img src="/images/brand/logo.png" alt="" width={50} height={50} />
      <span className="tm-brand-word" style={onDark ? { color: "#fff" } : undefined}>
        TechM4<span>Solutions</span>
        <small>A TechM4India division</small>
      </span>
    </a>
  );
}

export function SolutionsHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const burger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const world = document.querySelector(".tm-world--solutions");
    const background = world?.querySelectorAll<HTMLElement>(":scope > .tm-topbar, :scope > .tm-header, :scope > .tm, :scope > .tm-footer");
    const drawer = document.getElementById("tm-drawer");
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
      <div className="tm-topbar tm-chrome">
        <div className="tm-container">
          <ul>
            <li>
              <a href={contact.helloHref}>
                <Mail aria-hidden="true" />
                {contact.hello}
              </a>
            </li>
            <li className="tm-hide-md">
              <a href={contact.generalPhoneHref}>
                <Phone aria-hidden="true" />
                {contact.generalPhone}
              </a>
            </li>
            <li className="tm-hide-md">
              <span>
                <MapPin aria-hidden="true" />
                T-Hub, Gachibowli, Hyderabad
              </span>
            </li>
          </ul>
          <ul>
            <li>
              <Link href="/">
                Part of TechM4India
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <header className={"tm-header tm-chrome" + (scrolled ? " is-scrolled" : "")}>
        <div className="tm-container tm-header-inner">
          <Brand />
          <nav className="tm-nav" aria-label="TechM4Solutions">
            {solutionsNav.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="tm-header-actions">
            <a className="tm-btn tm-btn--sm" href="#contact">
              Discuss a project
              <ArrowRight aria-hidden="true" />
            </a>
            <button
              ref={burger}
              type="button"
              className="tm-burger"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="tm-drawer"
              onClick={() => setOpen(true)}
            >
              <Menu aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div
        id="tm-drawer"
        className={"tm-drawer tm-chrome" + (open ? " is-open" : "")}
        role="dialog"
        aria-modal="true"
        aria-label="TechM4Solutions menu"
      >
        <div className="tm-container tm-drawer-head">
          <Brand />
          <button
            ref={closeButton}
            type="button"
            className="tm-burger"
            style={{ display: "grid" }}
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="tm-container tm-drawer-body">
          <nav className="tm-drawer-nav" aria-label="TechM4Solutions">
            {solutionsNav.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
                <ArrowRight aria-hidden="true" />
              </a>
            ))}
            <Link href="/" onClick={() => setOpen(false)}>
              Back to TechM4India
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </nav>
          <a className="tm-btn" href="#contact" onClick={() => setOpen(false)}>
            Discuss a project
            <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </>
  );
}

export function SolutionsFooter() {
  return (
    <footer className="tm-footer tm-chrome">
      <div className="tm-container tm-footer-grid">
        <div className="tm-footer-about">
          <Brand onDark />
          <p>
            Software products, apps, AI and enterprise systems, designed and shipped by the
            TechM4India software division. Plus pay-and-use labs with Silicon Valley-level
            machines.
          </p>
          <div className="tm-footer-contact">
            <a href={contact.generalPhoneHref}>
              <Phone aria-hidden="true" />
              {contact.generalPhone}
            </a>
            <a href={contact.partnershipsHref}>
              <Mail aria-hidden="true" />
              {contact.partnerships}
            </a>
          </div>
        </div>
        <div>
          <h3>Services</h3>
          <ul>
            <li>
              <a href="#services">AI and agentic AI</a>
            </li>
            <li>
              <a href="#services">Software and SaaS</a>
            </li>
            <li>
              <a href="#services">Mobile apps</a>
            </li>
            <li>
              <a href="#services">Enterprise platforms</a>
            </li>
            <li>
              <a href="#labs">Pay-and-use labs</a>
            </li>
          </ul>
        </div>
        <div>
          <h3>Explore</h3>
          <ul>
            <li>
              <a href="#work">Selected work</a>
            </li>
            <li>
              <Link href="/solutions#work">Featured projects</Link>
            </li>
            <li>
              <a href="#industries">Industries</a>
            </li>
            <li>
              <a href="#process">How we work</a>
            </li>
          </ul>
        </div>
        <div>
          <h3>TechM4India</h3>
          <ul>
            <li>
              <Link href="/">TechM4India home</Link>
            </li>
            <li>
              <Link href="/schools">TechM4Schools</Link>
            </li>
            <li>
              <Link href="/engineering">TechM4Engineering</Link>
            </li>
            <li>
              <Link href="/institutes">TechM4Institutes</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="tm-container tm-footer-bottom">
        <span>© {new Date().getFullYear()} TechM4India Innovations Private Limited</span>
        <div className="tm-socials">
          {socialLinks.map((social) => (
            <a key={social.label} href={social.href} target="_blank" rel="noreferrer">
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
