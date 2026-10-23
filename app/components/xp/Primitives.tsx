/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared building blocks for the landing, Schools and Solutions pages.
 * Styles live in app/styles/xp-foundation.css.
 */

const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href);

/** Internal routes go through the router; everything else is a plain anchor. */
export function SmartLink({
  href,
  className,
  children,
  ...rest
}: {
  href: string;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
  "data-home-reveal"?: string;
}) {
  if (isExternal(href)) {
    const newTab = href.startsWith("http");
    return (
      <a
        className={className}
        href={href}
        {...(newTab ? { target: "_blank", rel: "noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link className={className} href={href} {...rest}>
      {children}
    </Link>
  );
}

export function Kicker({ index, children }: { index?: string; children: ReactNode }) {
  return (
    <p className="xp-kicker">
      {index && <b>{index}</b>}
      <span>{children}</span>
    </p>
  );
}

export function SectionHead({
  index,
  label,
  title,
  lede,
  id,
  stack = false,
}: {
  index?: string;
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  /** Sets the id on the h2 so the section can use aria-labelledby. */
  id?: string;
  stack?: boolean;
}) {
  return (
    <header className={"xp-head" + (stack ? " xp-head--stack" : "")} data-reveal>
      <div>
        <Kicker index={index}>{label}</Kicker>
        <h2 className="xp-title" id={id}>
          {title}
        </h2>
      </div>
      {lede && <p className="xp-lede">{lede}</p>}
    </header>
  );
}

export function Btn({
  href,
  children,
  variant = "solid",
}: {
  href: string;
  children: ReactNode;
  variant?: "solid" | "line" | "light";
}) {
  const className = "xp-btn" + (variant === "solid" ? "" : " xp-btn--" + variant);
  return (
    <SmartLink className={className} href={href}>
      <span>{children}</span>
      <i aria-hidden="true">↗</i>
    </SmartLink>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <SmartLink className="xp-link" href={href}>
      <span>{children}</span>
      <i aria-hidden="true">↗</i>
    </SmartLink>
  );
}

export function Plate({
  src,
  alt,
  caption,
  note,
  ratio = "4x3",
  priority = false,
  className = "",
  sizes,
}: {
  src: string;
  alt: string;
  /** Left side of the caption strip, e.g. what the photograph shows. */
  caption?: string;
  /** Right side of the caption strip, e.g. a place or a credit. */
  note?: string;
  ratio?: "4x3" | "3x2" | "16x9" | "4x5" | "1x1" | "free";
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  return (
    <figure
      className={("xp-plate " + (ratio === "free" ? "" : "xp-ratio-" + ratio) + " " + className).trim()}
    >
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        {...(priority ? { fetchPriority: "high" as const } : {})}
      />
      {(caption || note) && (
        <figcaption>
          <span>{caption}</span>
          {note && <span>{note}</span>}
        </figcaption>
      )}
    </figure>
  );
}

export type FigureItem = {
  value: string;
  /** Rendered as a superscript after the value, e.g. "+". */
  suffix?: string;
  label: string;
  note?: string;
};

export function Figures({ items }: { items: FigureItem[] }) {
  return (
    <ul className="xp-figures">
      {items.map((item) => (
        <li className="xp-figure" key={item.label} data-reveal>
          <strong>
            {item.value}
            {item.suffix && <sup>{item.suffix}</sup>}
          </strong>
          <span>{item.label}</span>
          {item.note && <small>{item.note}</small>}
        </li>
      ))}
    </ul>
  );
}

export type ClosePath = { label: string; title: string; text: string; href: string; image?: string; imageAlt?: string };

export function ClosingPaths({
  id = "next-step",
  label,
  title,
  lede,
  paths,
}: {
  id?: string;
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  paths: ClosePath[];
}) {
  return (
    <section className="xp-close xp-tone-ink" aria-labelledby={id + "-title"} id={id}>
      <div className="xp-shell">
        <header className="xp-head" data-reveal>
          <div>
            <Kicker>{label}</Kicker>
            <h2 className="xp-title" id={id + "-title"}>
              {title}
            </h2>
          </div>
          {lede && <p className="xp-lede">{lede}</p>}
        </header>
        <div className="xp-close-paths">
          {paths.map((path) => (
            <SmartLink className="xp-close-path" href={path.href} key={path.title} data-home-reveal="">
              {path.image && (
                <span className="xp-close-media">
                  <img src={path.image} alt={path.imageAlt ?? ""} loading="lazy" decoding="async" />
                </span>
              )}
              <span>{path.label}</span>
              <strong>{path.title}</strong>
              <small>
                {path.text}
                <i aria-hidden="true">↗</i>
              </small>
            </SmartLink>
          ))}
        </div>
      </div>
    </section>
  );
}
