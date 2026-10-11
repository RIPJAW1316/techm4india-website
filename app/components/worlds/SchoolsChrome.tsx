"use client";
/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */

import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { contact, socialLinks } from "@/lib/site-data";
import { EnquiryForm } from "./EnquiryForm";

/**
 * The TechM4Schools world's own chrome, after the client's reference
 * (pallaviinternationalschool.com): a white header with small-caps links and
 * a green "Enquire now" pill, an enquiry pop-up, and a green footer under a
 * blue curve. The site-wide header and footer are hidden on this route.
 */

const OPEN_EVENT = "sc:enquire";

export const schoolsNav = [
  { label: "About", href: "#about" },
  { label: "Innovate Bharath", href: "#innovate-bharath" },
  { label: "Labs", href: "#labs" },
  { label: "Platforms", href: "#platforms" },
  { label: "Programmes", href: "#programmes" },
  { label: "Journey", href: "#journey" },
  { label: "Partners", href: "#partners" },
];

const schoolEnquiryFields = [
  { name: "name", label: "Your name", required: true, autoComplete: "name" },
  { name: "phone", label: "Phone number", type: "tel" as const, required: true, autoComplete: "tel" },
  { name: "email", label: "Email", type: "email" as const, autoComplete: "email" },
  { name: "school", label: "School name", autoComplete: "organization" },
  {
    name: "role",
    label: "I am a",
    type: "select" as const,
    options: ["Student", "Parent", "Teacher", "School leader", "Institutional partner"],
  },
  {
    name: "interest",
    label: "Interested in",
    type: "select" as const,
    options: ["Composite Skill Lab", "Innovate Bharath", "CareerBuddy", "SchoolOS", "Innovation kits", "Student programmes"],
  },
  { name: "message", label: "Message", type: "textarea" as const },
];

/** Any button on the page can open the pop-up. */
export function EnquireButton({ children, className = "sc-btn" }: { children: ReactNode; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      {children}
    </button>
  );
}

function Brand({ onDark = false }: { onDark?: boolean }) {
  return (
    <a className="sc-brand" href="#top" aria-label="TechM4Schools, back to top">
      <img src="/images/brand/logo.png" alt="" width={48} height={48} />
      <span>
        <strong>
          TechM4<span>Schools</span>
        </strong>
        <small style={onDark ? { color: "#cfeedd" } : undefined}>Learn · Build · Lead</small>
      </span>
    </a>
  );
}

export function SchoolsHeader() {
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
    if (open) {
      wasOpen.current = true;
      closeButton.current?.focus();
    } else if (wasOpen.current) {
      burger.current?.focus();
    }
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className={"sc-header" + (scrolled ? " is-scrolled" : "")}>
        <div className="sc-container sc-header-inner">
          <Brand />
          <nav className="sc-nav" aria-label="TechM4Schools">
            {schoolsNav.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="sc-header-actions">
            <Link className="sc-back" href="/">
              <ArrowLeft aria-hidden="true" />
              <span>TechM4India</span>
            </Link>
            <EnquireButton>Enquire now</EnquireButton>
            <button
              ref={burger}
              type="button"
              className="sc-burger"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="sc-drawer"
              onClick={() => setOpen(true)}
            >
              <Menu aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div
        id="sc-drawer"
        className={"sc-drawer" + (open ? " is-open" : "")}
        role="dialog"
        aria-modal="true"
        aria-label="TechM4Schools menu"
      >
        <div className="sc-container sc-drawer-head">
          <Brand />
          <button
            ref={closeButton}
            type="button"
            className="sc-burger"
            style={{ display: "grid" }}
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="sc-container sc-drawer-body">
          <nav aria-label="TechM4Schools">
            {schoolsNav.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
            <Link href="/" onClick={() => setOpen(false)}>
              Back to TechM4India
            </Link>
          </nav>
          <EnquireButton>Enquire now</EnquireButton>
        </div>
      </div>
    </>
  );
}

/**
 * The enquiry pop-up. Opens when any EnquireButton is pressed, and once per
 * visit on its own after a short delay, as on the reference site. A native
 * <dialog> gives focus trapping, Escape and focus return.
 */
export function EnquiryModal() {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    const open = () => {
      if (!node.open) node.showModal();
    };
    const onBackdrop = (event: MouseEvent) => {
      if (event.target === node) node.close();
    };
    window.addEventListener(OPEN_EVENT, open);
    node.addEventListener("click", onBackdrop);

    let timer: number | undefined;
    try {
      if (!window.sessionStorage.getItem("sc-enquiry-shown")) {
        timer = window.setTimeout(() => {
          try {
            window.sessionStorage.setItem("sc-enquiry-shown", "1");
          } catch {
            /* storage unavailable: the pop-up simply may show again */
          }
          open();
        }, 9000);
      }
    } catch {
      /* storage blocked: skip the automatic pop-up */
    }

    return () => {
      window.removeEventListener(OPEN_EVENT, open);
      node.removeEventListener("click", onBackdrop);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return (
    <dialog ref={dialog} className="sc-modal" aria-labelledby="sc-modal-title">
      <button type="button" className="sc-modal-close" aria-label="Close enquiry form" onClick={() => dialog.current?.close()}>
        <X aria-hidden="true" />
      </button>
      <div className="sc-modal-inner">
        <h2 id="sc-modal-title">Enquiry form</h2>
        <p className="sc-modal-sub">Bring TechM4Schools labs, kits and programmes to your school.</p>
        <EnquiryForm
          formId="sc-modal"
          theme="sc"
          title="New TechM4Schools enquiry"
          fields={schoolEnquiryFields}
          submitLabel="Submit"
        />
      </div>
    </dialog>
  );
}

export { schoolEnquiryFields };

export function SchoolsFooter() {
  return (
    <footer className="sc-footer">
      <div className="sc-container sc-footer-grid">
        <div>
          <Brand onDark />
          <p>
            Labs, kits, mentors and programmes that turn a student&apos;s curiosity about
            technology into real skills. A TechM4India division.
          </p>
          <div className="sc-socials">
            {socialLinks.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noreferrer">
                {social.label}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3>Quick links</h3>
          <ul>
            {schoolsNav.slice(0, 4).map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Explore</h3>
          <ul>
            {schoolsNav.slice(4).map((item) => (
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
          </ul>
        </div>
        <div>
          <h3>Contact</h3>
          <address>
            <span>
              <MapPin aria-hidden="true" style={{ width: 15, height: 15, marginRight: 6, verticalAlign: -2 }} />
              {contact.address}
            </span>
            <a href={contact.generalPhoneHref}>
              <Phone aria-hidden="true" style={{ width: 15, height: 15, marginRight: 6, verticalAlign: -2 }} />
              {contact.generalPhone}
            </a>
            <a href={contact.partnershipsHref}>
              <Mail aria-hidden="true" style={{ width: 15, height: 15, marginRight: 6, verticalAlign: -2 }} />
              {contact.partnerships}
            </a>
          </address>
        </div>
      </div>
      <div className="sc-footer-bottom">
        <div className="sc-container">
          <span>© {new Date().getFullYear()} TechM4India Innovations Private Limited</span>
          <span>TechM4Schools · Hyderabad, Telangana</span>
        </div>
      </div>
    </footer>
  );
}
