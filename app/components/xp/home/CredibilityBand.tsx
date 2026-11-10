/* eslint-disable @next/next/no-img-element -- Partner logos are local files served with the static export. */
import Link from "next/link";
import { glance } from "@/lib/content/engineering";
import {
  innovateBharath,
  labs,
  validation,
  validationLedger,
} from "@/lib/content/schools";
import { Kicker } from "../Primitives";

type Figure = { value: string; suffix?: string; label: string; source: string };

/**
 * What has been built and who has validated it, in one band under the hero.
 *
 * Nothing here is written by hand. Every figure comes from the content module
 * of the division that publishes it, and each carries that division's name, so
 * a reader (or an investor's analyst) can find the page it came from. The
 * Innovate Bharath numbers show only while that module marks them confirmed,
 * and the validation row shows only confirmed entries, with the wording
 * and scope the Schools page already uses. Do not add a figure here that is not
 * published on a division page.
 */
export function CredibilityBand({ divisionCount }: { divisionCount: number }) {
  const figures: Figure[] = [
    { value: String(divisionCount), label: "divisions in one ecosystem", source: "TechM4India" },
    ...(innovateBharath.figuresConfirmed
      ? innovateBharath.figures.map((figure) => ({
          value: figure.value,
          suffix: figure.suffix,
          label: figure.label,
          source: "TechM4Schools",
        }))
      : []),
    { value: String(labs.length), label: "labs in the Composite Skill Lab", source: "TechM4Schools" },
    { value: String(glance.disciplines), label: "engineering disciplines", source: "TechM4Engineering" },
    { value: String(glance.programmes), label: "hands-on programmes in the catalogue", source: "TechM4Engineering" },
  ];
  const validators = validationLedger.filter((entry) => entry.confirmed && entry.logo);

  return (
    <section className="xp-section xh-cred" id="at-a-glance" aria-labelledby="cred-title">
      <div className="xp-shell">
        <header className="xh-cred-head" data-reveal>
          <Kicker>At a glance</Kicker>
          <h2 className="xh-cred-title" id="cred-title">
            What has been built, <em>and who has validated it.</em>
          </h2>
          <p className="xp-body">Each figure is published on the page of the division it comes from.</p>
        </header>

        <ul className="xh-cred-figures" data-reveal>
          {figures.map((figure) => (
            <li key={figure.source + figure.label}>
              <strong>
                {figure.value}
                {figure.suffix && <sup>{figure.suffix}</sup>}
              </strong>
              <span>{figure.label}</span>
              <small>{figure.source}</small>
            </li>
          ))}
        </ul>

        {validators.length > 0 && (
          <div className="xh-cred-valid" data-reveal>
            <div className="xh-cred-valid-intro">
              <p className="xp-meta">{validation.title}</p>
              <p>{validation.intro}</p>
              <Link className="xp-link" href={validation.cta.href}>
                <span>{validation.cta.label}</span>
                <i aria-hidden="true">↗</i>
              </Link>
            </div>
            <ul className="xh-cred-logos">
              {validators.map((entry) => (
                <li key={entry.name}>
                  <span className={"xh-cred-logo xh-cred-logo--" + entry.logo!.shape}>
                    <img
                      src={entry.logo!.src}
                      alt={entry.logo!.alt}
                      width={entry.logo!.width}
                      height={entry.logo!.height}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <strong>{entry.name}</strong>
                  <small>{entry.detail}</small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
