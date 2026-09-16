import Link from "next/link";
import {
  ArrowLink,
  PartnershipCTA,
  PeopleGrid,
  SectionHeading,
  StatRow,
} from "./components/Shared";
import { StructuredData } from "./components/StructuredData";
import { divisions, impactStats } from "@/lib/site-data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "TechM4India | Innovation Across Engineering, Schools, Solutions & Space",
  description:
    "Discover TechM4India, a leading innovation ecosystem spanning TechM4Engineering, TechM4Solutions, TechM4Schools, and TechM4Space.",
  path: "/",
});

const products = [
  {
    tag: "Company operations",
    title: "Company Management ERP V1",
    text: "A modular operating system for people, leads, institutions, programs, projects and content.",
    href: "/solutions/erp",
  },
  {
    tag: "Industrial intelligence",
    title: "AirGuard Pro",
    text: "Turning complex industrial signals into clearer decisions.",
    href: "/solutions",
  },
  {
    tag: "AI quality",
    title: "AcoustiCast",
    text: "Practical intelligence for teams building better products.",
    href: "/solutions",
  },
  {
    tag: "AgriTech",
    title: "FoodSpectra",
    text: "Making essential systems more visible, measurable and resilient.",
    href: "/solutions",
  },
  {
    tag: "FinTech & SaaS",
    title: "ITCMax",
    text: "Digital tools that make everyday enterprise work lighter.",
    href: "/solutions",
  },
  {
    tag: "Student innovation",
    title: "IGNITE AI",
    text: "A bridge from emerging technology to real student capability.",
    href: "/solutions",
  },
  {
    tag: "School ecosystems",
    title: "CareerBuddy",
    text: "Helping students connect curiosity with a future pathway.",
    href: "/solutions",
  },
];

const news = [
  {
    date: "Program note",
    title: "IGNITE AI brings an immersive technology experience to students.",
    text: "A focused 2-day, 1-night bootcamp for undergraduate and postgraduate learners.",
    href: "/contact",
  },
  {
    date: "Inside the ecosystem",
    title: "Labs turn curriculum into something students can touch, test and improve.",
    text: "From coding and robotics to aerospace systems, the work starts with a real brief.",
    href: "/schools",
  },
  {
    date: "Technology pathways",
    title: "Build satellites. Understand propulsion. Think in missions.",
    text: "TechM4Space brings the discipline of aerospace engineering into institutions.",
    href: "/space",
  },
];

export default function Home() {
  return (
    <main className="home-page">
      <section className="hero-slice" aria-labelledby="home-title">
        <div className="hero-shade" />
        <div className="hero-grain" />
        <div className="hero-content shell">
          <p className="eyebrow">
            <span /> India · Engineering · Innovation
          </p>
          <h1 id="home-title">
            India&apos;s most ambitious
            <em>innovation ecosystem.</em>
          </h1>
          <div className="hero-bottom">
            <p>
              Empowering students, institutions and industries to build, engineer and innovate for
              the future of India.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="#ecosystem">
                Explore TechM4India <span aria-hidden="true">↗</span>
              </Link>
              <Link className="button button-ghost" href="/contact">
                Partner with us <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="scroll-cue" aria-hidden="true">
          <span>Discover</span>
          <i />
        </div>
      </section>

      <section className="manifesto section shell">
        <div className="manifesto-intro" data-reveal>
          <p className="section-kicker">
            <span>01 / The idea</span>
          </p>
          <p className="manifesto-number">01</p>
        </div>
        <div className="manifesto-copy" data-reveal>
          <h2>
            Building India&apos;s next generation of <em>innovators, engineers and creators.</em>
          </h2>
          <p>
            TechM4India is a technology and learning ecosystem for the people who will make the
            future tangible. We connect institutions, educators, industry and students through work
            that has somewhere to go beyond the classroom.
          </p>
          <ArrowLink href="/about">Read our story</ArrowLink>
        </div>
        <div className="manifesto-image image-frame" data-reveal>
          <img
            src="/images/home/mentor-students.jpeg"
            alt="A mentor working with students in a TechM4India workshop"
            loading="lazy"
          />
          <span>Learning by making</span>
        </div>
      </section>

      <section className="ecosystem-section section" id="ecosystem">
        <div className="shell">
          <SectionHeading
            eyebrow="02 / Our ecosystem"
            title={
              <>
                Four ways to move an idea <em>forward.</em>
              </>
            }
            text="One mission, expressed through four distinct divisions. Each one starts with a real need and ends with something people can use."
          />
          <div className="division-editorial-grid">
            {divisions.map((division, index) => (
              <Link
                href={division.href}
                className={"division-editorial division-editorial-" + index}
                key={division.href}
                data-reveal
              >
                <div className="division-image">
                  <img src={division.image} alt={division.name} loading="lazy" />
                  <span>{division.number}</span>
                </div>
                <div className="division-meta">
                  <p>{division.verb}</p>
                  <h3>{division.name}</h3>
                  <span className="division-arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
                <p className="division-description">{division.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="impact-section section">
        <div className="shell">
          <SectionHeading
            eyebrow="03 / The ecosystem at a glance"
            title={
              <>
                A connected system for <em>serious making.</em>
              </>
            }
            text="These are the disciplines, pathways and lab formats that make the TechM4India ecosystem tangible."
          />
          <StatRow items={impactStats} />
        </div>
      </section>

      <section className="mission-section section">
        <div className="mission-image image-frame" data-reveal>
          <img
            src="/images/home/workshop-display.jpeg"
            alt="Students learning with technology in an innovation lab"
            loading="lazy"
          />
          <span>Hyderabad · India</span>
        </div>
        <div className="mission-panel" data-reveal>
          <p className="section-kicker section-kicker-light">
            <span>04 / The mission</span>
          </p>
          <h2>
            Our mission is not small. <em>Neither should India&apos;s future be.</em>
          </h2>
          <p>
            India has the talent, the hunger and the intelligence to lead the world in technology.
            It needs an ecosystem that makes that potential easier to access, practise and share. We
            are building it.
          </p>
          <div className="mission-links">
            <ArrowLink href="/engineering" light>
              Engineering education
            </ArrowLink>
            <ArrowLink href="/solutions" light>
              AI product platforms
            </ArrowLink>
            <ArrowLink href="/space" light>
              Aerospace innovation
            </ArrowLink>
            <ArrowLink href="/schools" light>
              School innovation
            </ArrowLink>
          </div>
        </div>
      </section>

      <section className="products-section section shell">
        <SectionHeading
          eyebrow="05 / Products, platforms & programmes"
          title={
            <>
              Ideas are useful when they <em>leave the room.</em>
            </>
          }
          text="A selection of products, learning platforms and programmes moving through the TechM4India ecosystem."
        />
        <div className="product-editorial-grid">
          {products.map((product, index) => (
            <article
              className={"product-editorial product-editorial-" + index}
              key={product.title}
              data-reveal
            >
              <span className="product-index">0{index + 1}</span>
              <p>{product.tag}</p>
              <h3>{product.title}</h3>
              <p>{product.text}</p>
              <ArrowLink href={product.href || "/solutions"}>
                {product.href === "/solutions/erp" ? "Explore the ERP" : "Explore the work"}
              </ArrowLink>
            </article>
          ))}
        </div>
      </section>

      <section className="matters-section section">
        <div className="shell matters-layout">
          <SectionHeading
            eyebrow="06 / What matters at TechM4India"
            title={
              <>
                The conditions that make <em>progress possible.</em>
              </>
            }
            text="A serious innovation ecosystem is designed around people, practice and the courage to keep improving."
          />
          <div className="matters-feature" data-reveal>
            <div className="matters-image">
              <img
                src="/images/about/classroom.jpeg"
                alt="Students learning in a technology-enabled classroom"
                loading="lazy"
              />
            </div>
            <div className="matters-copy">
              <span>01</span>
              <h3>Experiential learning</h3>
              <p>
                Students do not just read about technology. They build, test, fail, refine and
                present work that is theirs.
              </p>
              <ArrowLink href="/schools" light>
                See the learning ecosystem
              </ArrowLink>
            </div>
          </div>
          <div className="matters-list">
            <div>
              <span>02</span>
              <h3>Industry alignment</h3>
              <p>Programs are shaped around the tools and habits real teams use.</p>
            </div>
            <div>
              <span>03</span>
              <h3>NEP 2020 alignment</h3>
              <p>Curriculum and credit pathways can meet institutions where they are.</p>
            </div>
            <div>
              <span>04</span>
              <h3>Future readiness</h3>
              <p>Curiosity, confidence and practical fluency belong together.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="people-section section shell">
        <SectionHeading
          eyebrow="07 / The people"
          title={
            <>
              The work is led by people who <em>stay close to it.</em>
            </>
          }
          text="Academic depth, technical fluency and a bias toward building shape the programme team behind TechM4India."
        />
        <PeopleGrid compact />
        <div className="section-action">
          <ArrowLink href="/about">Meet the wider team</ArrowLink>
        </div>
      </section>

      <section className="trust-section section">
        <div className="shell">
          <SectionHeading
            eyebrow="08 / Institution-ready by design"
            title={
              <>
                Built to belong in <em>serious institutions.</em>
              </>
            }
            text="Our programs are designed around the practical conditions that help academic innovation keep working after launch day."
            align="center"
          />
          <div className="trust-grid">
            {[
              "Curriculum integration",
              "Faculty enablement",
              "Hands-on infrastructure",
              "Project development",
              "Research pathways",
            ].map((item, index) => (
              <div className="trust-item" key={item} data-reveal>
                <span>0{index + 1}</span>
                <strong>{item}</strong>
                <i aria-hidden="true">↗</i>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="news-section section shell">
        <SectionHeading
          eyebrow="09 / Inside TechM4India"
          title={
            <>
              What&apos;s new is often what&apos;s <em>being built.</em>
            </>
          }
          text="Program updates, learning stories and the ideas moving through our ecosystem."
        />
        <div className="news-grid">
          {news.map((item, index) => (
            <article className="news-card" key={item.title} data-reveal>
              <div className="news-image">
                <img
                  src={
                    [
                      "/images/home/workshop-crowd.jpeg",
                      "/images/schools/robotics.jpeg",
                      "/images/space/assembly.jpeg",
                    ][index]
                  }
                  alt=""
                  loading="lazy"
                />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <p>{item.date}</p>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <ArrowLink href={item.href}>Read more</ArrowLink>
            </article>
          ))}
        </div>
      </section>

      <PartnershipCTA />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": "https://www.techm4india.com/#divisions",
          name: "TechM4India divisions",
          numberOfItems: 4,
          itemListElement: divisions.map((division, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: division.name,
            url: "https://www.techm4india.com" + division.href,
          })),
        }}
      />
    </main>
  );
}
