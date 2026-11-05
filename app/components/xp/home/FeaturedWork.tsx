/* eslint-disable @next/next/no-img-element -- These editorial assets are served locally. */
import Link from "next/link";
import { SectionHead } from "../Primitives";

/** The clearest examples of work, with their different stages made explicit. */
export function FeaturedWork() {
  return (
    <section className="xp-section xh-featured" id="featured-work" aria-labelledby="featured-work-title">
      <div className="xp-shell">
        <SectionHead
          index="03"
          label="Selected work"
          id="featured-work-title"
          title={<>A few things worth <em>looking closer at.</em></>}
          lede="A student innovation programme and a campus AI experience. Each has a different place in the ecosystem."
        />

        <div className="xh-featured-grid">
          <article className="xh-featured-story xh-featured-story--schools" data-home-reveal>
            <div className="xh-featured-story-media">
              <img src="/images/schools/robotics-team.webp" alt="Illustrative photograph of students and an educator building a robotics project" loading="lazy" decoding="async" />
              <span>Illustrative student project photography</span>
            </div>
            <div className="xh-featured-story-copy">
              <p className="xh-featured-eyebrow"><span>01 / Student innovation</span><span>Earlier edition</span></p>
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
              <p className="xh-featured-eyebrow"><span>02 / Campus bootcamp</span><span>2026 edition</span></p>
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
