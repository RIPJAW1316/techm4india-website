/* eslint-disable @next/next/no-img-element -- These editorial assets are served locally. */
import Link from "next/link";
import { SectionHead } from "../Primitives";

/** The three clearest examples of work, with their different stages made explicit. */
export function FeaturedWork() {
  return (
    <section className="xp-section xh-featured" id="featured-work" aria-labelledby="featured-work-title">
      <div className="xp-shell">
        <SectionHead
          index="03"
          label="Selected work"
          id="featured-work-title"
          title={<>A few things worth <em>looking closer at.</em></>}
          lede="A digital engineering foundry, a student innovation programme, and a campus AI experience. Each has a different place in the ecosystem."
        />

        <div className="xh-featured-grid">
          <article className="xh-featured-erp" data-home-reveal>
            <div className="xh-featured-erp-copy">
              <p className="xh-featured-eyebrow"><span>01 / Software engineering</span><span>Solutions division</span></p>
              <h3>Software &amp;<br />Digital <em>Foundry.</em></h3>
              <p>Custom web and mobile apps, AI-powered systems, enterprise platforms, and pay-and-use engineering compute labs.</p>
              <Link className="xh-featured-link" href="/solutions">Explore TechM4Solutions <span aria-hidden="true">↗</span></Link>
            </div>
            <figure className="xh-featured-system" aria-label="Illustrative architecture of TechM4Solutions digital systems">
              <div className="xh-system-top"><span>TECHM4INDIA / SOLUTIONS</span><span>01 — 05</span></div>
              <div className="xh-system-core"><span>Engineered<br />software</span><svg className="xh-system-flow" viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="4" y="5" width="17" height="14" rx="3" /><rect x="43" y="5" width="17" height="14" rx="3" /><rect x="23.5" y="45" width="17" height="14" rx="3" /><path d="M21 12h22M12.5 19v8a5 5 0 0 0 5 5H32m19.5-13v8a5 5 0 0 1-5 5H32m0 0v13" /><circle cx="32" cy="32" r="3" /></svg></div>
              <div className="xh-system-modules" aria-hidden="true">
                <span>AI Systems</span><span>Web &amp; Mobile</span><span>Platforms</span><span>DevOps</span><span>Compute Labs</span>
              </div>
              <figcaption>Modern software architectures · Production-ready engineering</figcaption>
            </figure>
          </article>

          <article className="xh-featured-story xh-featured-story--schools" data-home-reveal>
            <div className="xh-featured-story-media">
              <img src="/images/schools/robotics-team.webp" alt="Illustrative photograph of students and an educator building a robotics project" loading="lazy" decoding="async" />
              <span>Illustrative student project photography</span>
            </div>
            <div className="xh-featured-story-copy">
              <p className="xh-featured-eyebrow"><span>02 / Student innovation</span><span>Earlier edition</span></p>
              <h3>Innovate Bharath</h3>
              <p>Students put forward ideas of their own. More than 1,200 took part; eight unique ideas were selected and funded.</p>
              <Link className="xh-featured-link" href="/schools#innovate-bharath">See the programme <span aria-hidden="true">↗</span></Link>
            </div>
          </article>

          <article className="xh-featured-story xh-featured-story--ignite" data-home-reveal>
            <div className="xh-featured-story-media">
              <img src="/images/events/ignite-ai-poster.jpg" alt="Official IGNITE AI Campus Transformation Program poster" loading="lazy" decoding="async" />
              <span>Programme poster</span>
            </div>
            <div className="xh-featured-story-copy">
              <p className="xh-featured-eyebrow"><span>03 / Campus bootcamp</span><span>2026 edition</span></p>
              <h3>IGNITE AI</h3>
              <p>An immersive, two-day campus programme introducing undergraduate and postgraduate students to current AI tools through hands-on sessions.</p>
              <Link className="xh-featured-link" href="/institutes#bootcamps">Explore IGNITE AI <span aria-hidden="true">↗</span></Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
