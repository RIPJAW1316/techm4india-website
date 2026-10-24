"use client";

/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */
import { usePathname } from "next/navigation";
import Link from "next/link";
import { contact, divisions, navigation, socialLinks } from "@/lib/site-data";

export function Footer() {
  const pathname = usePathname();

  // Suppress public marketing footer on enterprise workspaces
  if (
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/hrms") ||
    pathname?.startsWith("/erp")
  ) {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="footer-motif" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="shell footer-intro">
        <p className="footer-kicker">One ecosystem. Five divisions.</p>
        <h2>
          Engineering a more <em>inventive India.</em>
        </h2>
        <Link className="button button-primary" href="/contact">
          Start a partnership <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Link href="/" aria-label="TechM4India home">
            <img src="/images/brand/logo.png" alt="" width="58" height="58" />
            <span>
              TECHM4<span>INDIA</span>
            </span>
          </Link>
          <p>
            Building India&apos;s next-generation technology and innovation ecosystem across
            schools, engineering, solutions, space and institutes.
          </p>
          <a href={contact.generalPhoneHref}>{contact.generalPhone}</a>
          <a href={contact.emailHref}>{contact.email}</a>
        </div>
        <div>
          <h3>Divisions</h3>
          <ul>
            {divisions.map((division) => (
              <li key={division.href}>
                <Link href={division.href}>{division.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Company</h3>
          <ul>
            {navigation
              .filter((item) => ["/", "/about", "/contact"].includes(item.href))
              .map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            <li>
              <a href={contact.partnershipsHref}>Partnerships</a>
            </li>
          </ul>
        </div>
        <div>
          <h3>Connect</h3>
          <ul>
            {socialLinks.map((social) => (
              <li key={social.label}>
                <a href={social.href} target="_blank" rel="noreferrer">
                  {social.label} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
            <li>
              <a href={contact.whatsapp} target="_blank" rel="noreferrer">
                WhatsApp <span aria-hidden="true">↗</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} TechM4India Innovations Private Limited</span>
        <span>Hyderabad · Telangana · India</span>
      </div>
    </footer>
  );
}
