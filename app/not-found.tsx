import type { Metadata } from "next";
import Link from "next/link";
import { Btn, Kicker } from "./components/xp/Primitives";
import { divisions } from "@/lib/site-data";
import "./styles/xp-notfound.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/** Shown for any address the site does not have. Offers the five divisions as ways back in. */
export default function NotFound() {
  return (
    <main className="xp xp-notfound">
      <section className="xp-section xn" aria-labelledby="notfound-title">
        <div className="xp-shell">
          <div className="xn-head">
            <Kicker index="404">Page not found</Kicker>
            <h1 className="xp-title" id="notfound-title">
              We can&rsquo;t find <em>that page.</em>
            </h1>
            <p className="xp-lede">
              The link may be out of date, or the address may have a typo. Start again from the
              homepage, or go straight to a division.
            </p>
            <div className="xp-actions">
              <Btn href="/">Go to the homepage</Btn>
              <Btn href="/contact" variant="line">
                Contact us
              </Btn>
            </div>
          </div>

          <ul className="xn-list" aria-label="TechM4India divisions">
            {divisions.map((division) => (
              <li key={division.href}>
                <Link href={division.href}>
                  <span className="xp-meta">{division.number}</span>
                  <strong>{division.name}</strong>
                  <span className="xn-text">{division.description}</span>
                  <i aria-hidden="true">↗</i>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
