"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { contact, divisions, navigation, socialLinks } from "@/lib/site-data";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.classList.toggle("menu-is-open", open);
    if (open) closeButton.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("menu-is-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <aside className="announcement" aria-label="TechM4India announcements">
        <span className="announcement-label">TechM4India update</span>
        <div className="announcement-marquee" aria-hidden="true">
          <div>
            <span>Institution innovation partnerships</span><i>✦</i>
            <span>Hands-on engineering programs</span><i>✦</i>
            <span>Future-ready school labs</span><i>✦</i>
            <span>Aerospace learning pathways</span><i>✦</i>
            <span>Institution innovation partnerships</span><i>✦</i>
            <span>Hands-on engineering programs</span><i>✦</i>
          </div>
        </div>
        <Link href="/contact">Partner with us <span aria-hidden="true">↗</span></Link>
      </aside>

      <header className="floating-header">
        <Link className="brand" href="/" aria-label="TechM4India home">
          <img src="/images/brand/logo.png" alt="" width="48" height="48" />
          <span className="brand-type">TECHM4<span>INDIA</span></span>
        </Link>
        <p className="header-prompt">Engineering imagination into impact.</p>
        <button
          className="menu-trigger"
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen(true)}
        >
          <span>Menu</span>
          <i aria-hidden="true" />
        </button>
      </header>

      <div
        id="site-menu"
        className={"menu-overlay" + (open ? " is-open" : "")}
        aria-hidden={!open}
      >
        <div className="menu-motif" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="menu-top shell">
          <Link className="menu-brand" href="/" onClick={() => setOpen(false)}>
            <img src="/images/brand/logo.png" alt="" width="50" height="50" />
            <span>TechM4India</span>
          </Link>
          <button
            ref={closeButton}
            className="menu-close"
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
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
                    {item.label}<i aria-hidden="true">↗</i>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          <div className="menu-aside">
            <div>
              <p className="menu-label">Our ecosystem</p>
              <ul>
                {divisions.map((division) => (
                  <li key={division.href}>
                    <Link href={division.href} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>
                      {division.name}<span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="menu-contact">
              <p className="menu-label">Start a conversation</p>
              <a href={contact.emailHref} tabIndex={open ? 0 : -1}>{contact.email}</a>
              <a href={contact.generalPhoneHref} tabIndex={open ? 0 : -1}>{contact.generalPhone}</a>
              <div>
                {socialLinks.map((social) => (
                  <a key={social.label} href={social.href} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1}>
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
