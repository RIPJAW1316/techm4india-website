/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { people, type Person } from "@/lib/site-data";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  className = "",
  credit,
  ctaHref = "/contact",
  ctaLabel = "Start a partnership",
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  image: string;
  imageAlt: string;
  className?: string;
  credit?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <section className={"page-hero " + className.trim()} aria-labelledby="page-title">
      <img className="page-hero-image" src={image} alt={imageAlt} />
      <div className="page-hero-shade" />
      <div className="page-hero-content shell">
        <p className="eyebrow">
          <span /> {eyebrow}
        </p>
        <h1 id="page-title">{title}</h1>
        <div className="page-hero-bottom">
          <p>{description}</p>
          <Link className="button button-primary" href={ctaHref}>
            {ctaLabel} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      {credit && <small className="image-credit">{credit}</small>}
      <div className="scroll-cue" aria-hidden="true">
        <span>Discover</span>
        <i />
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  text?: string;
  align?: "left" | "center";
}) {
  return (
    <header className={"section-heading section-heading-" + align} data-reveal>
      <p className="section-kicker">
        <span>{eyebrow}</span>
      </p>
      <h2>{title}</h2>
      {text && <p className="section-copy">{text}</p>}
    </header>
  );
}

export function ArrowLink({
  href,
  children,
  light = false,
}: {
  href: string;
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <Link className={"arrow-link" + (light ? " arrow-link-light" : "")} href={href}>
      <span>{children}</span>
      <i aria-hidden="true">{"↗︎"}</i>
    </Link>
  );
}

export function StatRow({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div className="stat-row">
      {items.map((item) => (
        <div className="stat-item" key={item.value + item.label} data-reveal>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function PeopleGrid({
  compact = false,
  members = people,
}: {
  compact?: boolean;
  members?: Person[];
}) {
  return (
    <div className={"people-grid" + (compact ? " people-grid-compact" : "")}>
      {members.map((person, index) => (
        <article
          className="person-card"
          key={person.name}
          data-reveal
          style={{ "--delay": index * 80 + "ms" } as CSSProperties}
        >
          <div className="person-image">
            <img src={person.image} alt={"Portrait of " + person.name} loading="lazy" />
            <span>{String(index + 1).padStart(2, "0")}</span>
          </div>
          <p>{person.role}</p>
          <h3>{person.name}</h3>
          {!compact && (
            <div className="person-bio">
              <p>{person.bio}</p>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

export function PartnershipCTA({
  eyebrow = "Institution partnerships",
  title,
  text = "Build a long-term innovation ecosystem with programs, labs, mentorship and measurable student outcomes designed around your institution.",
}: {
  eyebrow?: string;
  title?: ReactNode;
  text?: string;
}) {
  return (
    <section className="partnership-cta">
      <div className="partnership-image">
        <img
          src="/images/home/workshop-crowd.jpeg"
          alt="TechM4India workshop with students collaborating"
          loading="lazy"
        />
      </div>
      <div className="partnership-panel">
        <div className="panel-motif" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <p className="section-kicker section-kicker-light">
          <span>{eyebrow}</span>
        </p>
        <h2>
          {title || (
            <>
              Your institution&apos;s <em>innovation era</em> starts today.
            </>
          )}
        </h2>
        <p>{text}</p>
        <ArrowLink href="/contact" light>
          Partner with TechM4India
        </ArrowLink>
      </div>
    </section>
  );
}

export function EditorialList({
  items,
  numbered = true,
}: {
  items: { title: string; text: string }[];
  numbered?: boolean;
}) {
  return (
    <div className="editorial-list">
      {items.map((item, index) => (
        <article key={item.title} data-reveal>
          {numbered && <span>{String(index + 1).padStart(2, "0")}</span>}
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}
