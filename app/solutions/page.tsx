/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Brain,
  Building2,
  ChartColumn,
  Clock,
  Cloud,
  Code,
  Cpu,
  Factory,
  Gauge,
  GraduationCap,
  Handshake,
  HeartPulse,
  Landmark,
  Layers,
  Mail,
  MapPin,
  Microscope,
  MonitorCog,
  PenTool,
  Phone,
  Rocket,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Sprout,
  Target,
  Truck,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { EnquiryForm } from "../components/worlds/EnquiryForm";
import { SolutionsFooter, SolutionsHeader } from "../components/worlds/SolutionsChrome";
import { WorkGrid } from "../components/worlds/WorkGrid";
import { SolutionsMotion } from "../components/worlds/SolutionsMotion";
import { StructuredData } from "../components/StructuredData";
import {
  ctaBand,
  edge,
  featured,
  hero,
  industries,
  labs,
  process,
  record,
  services,
  stageLabels,
  techGroups,
  work,
  workSection,
  workStages,
} from "@/lib/content/solutions";
import { contact } from "@/lib/site-data";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "TechM4Solutions | Software, apps, AI and pay-and-use computer labs",
  description:
    "TechM4Solutions designs and builds software products, web and mobile apps, AI solutions and enterprise systems, with pay-and-use labs of Silicon Valley-level computer systems.",
  path: "/solutions",
});

const delay = (ms: number) => ({ "--delay": ms + "ms" }) as CSSProperties;

const SERVICE_ICONS: LucideIcon[] = [Bot, Code, Smartphone, Layers, Cloud, ChartColumn];
const INDUSTRY_ICONS: LucideIcon[] = [GraduationCap, HeartPulse, Sprout, Factory, ShoppingCart, Wallet, Truck, Landmark, Rocket];
const EDGE_ICONS: LucideIcon[] = [Microscope, Brain, Building2, Gauge, Handshake];
const PROCESS_ICONS: LucideIcon[] = [Target, PenTool, Code, Rocket, ShieldCheck];
const LAB_ICONS: LucideIcon[] = [Cpu, Zap, Clock];

const ticker = [
  "Software products",
  "Web and mobile apps",
  "AI and agentic AI",
  "ERP and enterprise systems",
  "Cloud and DevOps",
  "Data and analytics",
  "Pay-and-use computer labs",
];

const heroStack = ["React", "TypeScript", "NestJS", "PostgreSQL", "Python", "PyTorch", "Android"];

const enquiryFields = [
  { name: "name", label: "Your name", required: true, autoComplete: "name" },
  { name: "email", label: "Email", type: "email" as const, required: true, autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel" as const, autoComplete: "tel" },
  { name: "company", label: "Company or institution", autoComplete: "organization" },
  {
    name: "interest",
    label: "I'm interested in",
    type: "select" as const,
    options: [
      "A software product",
      "A web or mobile app",
      "An AI solution",
      "An ERP or enterprise system",
      "Booking lab time",
      "Something else",
    ],
    wide: true,
  },
  { name: "message", label: "Tell us about the project", type: "textarea" as const, required: true },
];

export default function SolutionsPage() {
  const stackTiles = Array.from(new Set(techGroups.flatMap((group) => group.items)));
  const counts = record.figures.slice(1);

  return (
    <div className="tm-world tm-world--solutions">
      <SolutionsMotion />
      <SolutionsHeader />
      <div className="tm-scroll-progress" aria-hidden="true"><span /></div>

      <main className="tm" id="top">
        {/* A working system, drawn as a live signal map rather than stock imagery. */}
        <section className="tm-hero" aria-labelledby="tm-hero-title">
          <span className="tm-hero-glow" aria-hidden="true" />
          <div className="tm-container">
            <div className="tm-hero-overline" aria-hidden="true">
              <span>TechM4Solutions / The software division</span>
              <span><i /> Design → Engineering → Delivery</span>
            </div>
            <div className="tm-hero-grid">
              <div className="tm-hero-copy">
                <p className="tm-eyebrow">Software with real-world momentum</p>
                <h1 className="tm-h1" id="tm-hero-title">
                  <span className="tm-hero-line">{hero.title}</span>
                  <span className="tm-hero-line tm-accent">{hero.titleAccent}</span>
                </h1>
                <p className="tm-lead">We design and build products, apps, AI and enterprise systems, then stay with the work through release and support.</p>
                <div className="tm-actions">
                  <a className="tm-btn" href="#contact">
                    Discuss a project
                    <ArrowRight aria-hidden="true" />
                  </a>
                  <a className="tm-btn tm-btn--ghost" href="#work">
                    See our work
                    <ArrowRight aria-hidden="true" />
                  </a>
                </div>
                <div className="tm-hero-down">
                  <span className="tm-hero-down-rule" aria-hidden="true"><span /></span>
                  <span>Explore what we build</span>
                </div>
              </div>

              <div className="tm-hero-visual" aria-label="The interface, services and data layers of the Company Management ERP">
                <div className="tm-orbit tm-orbit--outer" aria-hidden="true" />
                <div className="tm-orbit tm-orbit--middle" aria-hidden="true" />
                <div className="tm-orbit tm-orbit--inner" aria-hidden="true" />
                <span className="tm-orbit-point tm-orbit-point--one" aria-hidden="true" />
                <span className="tm-orbit-point tm-orbit-point--two" aria-hidden="true" />
                <span className="tm-orbit-label tm-orbit-label--top" aria-hidden="true">AI / intelligence</span>
                <span className="tm-orbit-label tm-orbit-label--side" aria-hidden="true">SYS / infrastructure</span>
                <div className="tm-system-card">
                  <div className="tm-system-bar">
                    <span className="tm-system-dots" aria-hidden="true"><i /><i /><i /></span>
                    <span>techm4 / system architecture</span>
                    <span className="tm-system-live"><i /> Live build</span>
                  </div>
                  <div className="tm-system-body">
                    <div className="tm-system-intro">
                      <span>Featured system / 01</span>
                      <h2>{featured.name}</h2>
                      <p>One operating system. Every division in sync.</p>
                    </div>
                    <ol className="tm-system-layers">
                      {featured.layers.map((layer, index) => (
                        <li key={layer.code} style={delay(index * 110)}>
                          <span className="tm-system-code">{layer.code}</span>
                          <span className="tm-system-layer-copy"><strong>{layer.term}</strong><small>{layer.detail}</small></span>
                          <span className="tm-system-pulse" aria-hidden="true" />
                        </li>
                      ))}
                    </ol>
                    <Link href={featured.cta.href} className="tm-system-link">
                      Explore the system <ArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                </div>
                <div className="tm-orbit-badge" aria-hidden="true"><span>TM4</span><small>Build in motion</small></div>
              </div>
            </div>

            <div className="tm-trust">
              <span>Built with</span>
              <ul>
                {heroStack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* A restrained, continuous index of the division's disciplines. */}
        <div className="tm-ticker" aria-label="What TechM4Solutions does">
          <div className="tm-ticker-track">
            {[0, 1].map((copy) => (
              <ul key={copy} aria-hidden={copy === 1 ? true : undefined}>
                {ticker.map((item) => (
                  <li key={item}>
                    {item}
                    <span aria-hidden="true">✳</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        {/* About: photographs, a floating figure and what you get. */}
        <section className="tm-section tm-about-section" aria-labelledby="tm-about-title">
          <div className="tm-container tm-split">
            <div className="tm-collage" data-reveal>
              <div className="tm-media tm-media--4x5 tm-collage-main">
                <img
                  src="/images/editorial/workshop-lab.jpeg"
                  alt="A TechM4India engineer presenting to a room of people working at rows of monitors"
                  loading="lazy"
                />
              </div>
              <div className="tm-media tm-media--4x3 tm-collage-side">
                <img
                  src="/images/home/hero-engineer.jpeg"
                  alt="An engineer wiring a test panel in an electrical laboratory"
                  loading="lazy"
                />
              </div>
              <div className="tm-float tm-collage-float">
                <span className="tm-icon">
                  <MonitorCog aria-hidden="true" />
                </span>
                <div>
                  <strong>
                    {counts[0].value}
                    {counts[0].suffix} apps
                  </strong>
                  <span>delivered to date</span>
                </div>
              </div>
            </div>
            <div className="tm-about-copy" data-solution-reveal>
              <p className="tm-eyebrow">About TechM4Solutions</p>
              <h2 className="tm-h2" id="tm-about-title">
                One team, from the first brief to <span className="tm-accent">working software.</span>
              </h2>
              <p className="tm-lead">
                We are the software division of TechM4India. We design, build and ship products,
                apps, AI systems and enterprise software, and we stay for the support after
                release.
              </p>
              <ul className="tm-checks">
                {hero.sheet.rows.map((row) => (
                  <li key={row.code}>
                    <BadgeCheck aria-hidden="true" />
                    {row.term}
                  </li>
                ))}
              </ul>
              <a className="tm-call tm-call--onlight" href={contact.generalPhoneHref}>
                <span>
                  <Phone aria-hidden="true" />
                </span>
                <span>
                  <small>Call us now</small>
                  <strong>{contact.generalPhone}</strong>
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Delivery record */}
        <section className="tm-section tm-section--tight tm-bg-soft tm-record-section" id="record" aria-labelledby="tm-record-title">
          <div className="tm-container">
            <div className="tm-head tm-head--split" data-solution-reveal>
              <p className="tm-eyebrow">{record.label}</p>
              <h2 className="tm-h2" id="tm-record-title">
                {record.title} <span className="tm-accent">{record.titleAccent}</span>
              </h2>
            </div>
            <ul className="tm-stats tm-stats--5">
              {record.figures.map((figure, index) => (
                <li className="tm-stat" key={figure.label} data-reveal style={delay(index * 70)}>
                  <strong>
                    {figure.value}
                    <sup>{figure.suffix}</sup>
                  </strong>
                  <span>{figure.label}</span>
                </li>
              ))}
            </ul>
            <p className="tm-small tm-center">{record.note}</p>
          </div>
        </section>

        {/* Core services */}
        <section className="tm-section tm-services" id="services" aria-labelledby="tm-services-title">
          <div className="tm-container tm-services-grid">
            <div className="tm-services-head" data-solution-reveal>
              <p className="tm-eyebrow" id="capabilities">01 / Our disciplines</p>
              <h2 className="tm-h2" id="tm-services-title">
                Everything a product needs, <span className="tm-accent">under one roof.</span>
              </h2>
              <p className="tm-body">
                Most projects draw on two or three of these disciplines. That is why they sit with
                one team and one point of contact.
              </p>
              <a className="tm-btn" href="#contact">
                Start a project
                <ArrowRight aria-hidden="true" />
              </a>
            </div>
            <ol className="tm-services-list">
              {services.map((service, index) => {
                const Icon = SERVICE_ICONS[index] ?? Sparkles;
                return (
                  <li className="tm-service-row" key={service.title} data-reveal style={delay((index % 2) * 80)}>
                    <span className="tm-service-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="tm-icon" aria-hidden="true">
                      <Icon aria-hidden="true" />
                    </span>
                    <div className="tm-service-content">
                      <h3 className="tm-h3">{service.title}</h3>
                      <p className="tm-body">{service.text}</p>
                      <p className="tm-small">{service.items.join(" · ")}</p>
                    </div>
                    <a className="tm-service-arrow" href="#contact" aria-label={`Discuss ${service.title}`}>
                      <ArrowRight aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Why us: a navy band, then the technology wall riding over its edge. */}
        <section className="tm-section tm-bg-dark tm-grid-bg tm-drivers" aria-labelledby="tm-drivers-title">
          <div className="tm-container tm-split tm-split--top">
            <div data-solution-reveal>
              <p className="tm-eyebrow">{edge.label}</p>
              <h2 className="tm-h2" id="tm-drivers-title">
                Practical engineering. <span className="tm-accent">Measurable delivery.</span>
              </h2>
            </div>
            <ul className="tm-drivers-list">
              {edge.items.map((item, index) => {
                const Icon = EDGE_ICONS[index] ?? Sparkles;
                return (
                  <li key={item.title} data-reveal style={delay(index * 70)}>
                    <span className="tm-icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="tm-h3">{item.title}</h3>
                      <p className="tm-body">{item.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
        <section className="tm-wall-wrap" aria-labelledby="tm-wall-title">
          <div className="tm-container">
            <div className="tm-wall">
              <div className="tm-head tm-head--center" data-solution-reveal>
                <p className="tm-eyebrow">Our technologies</p>
                <h2 className="tm-h3" id="tm-wall-title">
                  Named in our own products, roles and repositories
                </h2>
              </div>
              <ul className="tm-wall-grid">
                {stackTiles.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Featured build and selected work */}
        <section className="tm-section tm-bg-soft tm-work-section" id="work" aria-labelledby="tm-work-title">
          <div className="tm-container">
            <div className="tm-head tm-head--split" data-solution-reveal>
              <div>
                <p className="tm-eyebrow">Portfolio</p>
                <h2 className="tm-h2" id="tm-work-title">
                  {workSection.title} <span className="tm-accent">{workSection.titleAccent}</span>
                </h2>
              </div>
              <p className="tm-body">{workSection.lede}</p>
            </div>

            <article className="tm-featured" id="featured" aria-labelledby="tm-featured-title" data-reveal>
              <div className="tm-featured-copy">
                <span className="tm-badge tm-badge--green tm-badge--dot">{featured.label}</span>
                <h3 className="tm-h2" id="tm-featured-title">
                  {featured.title} <span className="tm-accent">{featured.titleAccent}</span>
                </h3>
                <p className="tm-body">{featured.lede}</p>
                <p className="tm-small">{featured.divisionsNote}</p>
                <Link className="tm-btn" href={featured.cta.href}>
                  {featured.cta.label}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
              <div className="tm-featured-modules">
                <p className="tm-small">{featured.modulesTitle}</p>
                <ul className="tm-chips">
                  {featured.modules.map((module) => (
                    <li key={module} className="tm-chip">
                      {module}
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <WorkGrid items={work} stages={workStages} stageLabels={stageLabels} allLabel={workSection.allLabel} />
          </div>
        </section>

        {/* Industries */}
        <section className="tm-section tm-bg-dark tm-grid-bg tm-industries-section" id="industries" aria-labelledby="tm-industries-title">
          <div className="tm-container tm-industries">
            <div className="tm-industries-head" data-solution-reveal>
              <p className="tm-eyebrow">{industries.label}</p>
              <h2 className="tm-h2" id="tm-industries-title">
                {industries.title} <span className="tm-accent">{industries.titleAccent}</span>
              </h2>
              <p className="tm-body">{industries.lede}</p>
            </div>
            <ul className="tm-industry-grid">
              {industries.items.map((industry, index) => {
                const Icon = INDUSTRY_ICONS[index] ?? Sparkles;
                return (
                  <li key={industry.name} data-reveal style={delay((index % 3) * 60)}>
                    <Icon aria-hidden="true" />
                    <div>
                      <h3>{industry.name}</h3>
                      <p>{industry.builds.join(" · ")}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Process */}
        <section className="tm-section tm-process-section" id="process" aria-labelledby="tm-process-title">
          <div className="tm-container">
            <div className="tm-head tm-head--center" data-solution-reveal>
              <p className="tm-eyebrow">{process.label}</p>
              <h2 className="tm-h2" id="tm-process-title">
                {process.title} <span className="tm-accent">{process.titleAccent}</span>
              </h2>
              <p className="tm-body">{process.lede}</p>
            </div>
            <ol className="tm-process">
              {process.steps.map((step, index) => {
                const Icon = PROCESS_ICONS[index] ?? Sparkles;
                return (
                  <li className="tm-card" key={step.name} data-reveal style={delay(index * 80)}>
                    <div className="tm-process-top">
                      <span className="tm-icon">
                        <Icon aria-hidden="true" />
                      </span>
                      <span className="tm-process-no">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="tm-h3">{step.name}</h3>
                    <p className="tm-body">{step.text}</p>
                    <p className="tm-process-receive">
                      <span>{process.receiveLabel}</span>
                      {step.receive}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Pay-and-use labs */}
        <section className="tm-section tm-bg-soft tm-labs-section" id="labs" aria-labelledby="tm-labs-title">
          <div className="tm-container">
            <div className="tm-split">
              <div className="tm-labs-media" data-reveal>
                <div className="tm-media tm-media--4x3">
                  <img src={labs.image.src} alt={labs.image.alt} loading="lazy" />
                </div>
                <div className="tm-float tm-labs-float">
                  <span className="tm-icon tm-icon--red">
                    <Clock aria-hidden="true" />
                  </span>
                  <div>
                    <strong>Pay per hour</strong>
                    <span>for the time you use</span>
                  </div>
                </div>
              </div>
              <div className="tm-labs-copy" data-solution-reveal>
                <p className="tm-eyebrow">{labs.label}</p>
                <h2 className="tm-h2" id="tm-labs-title">
                  {labs.title} <span className="tm-accent">{labs.titleAccent}</span>
                </h2>
                <p className="tm-lead">{labs.lede}</p>
                <ul className="tm-labs-offers">
                  {labs.offers.map((offer, index) => {
                    const Icon = LAB_ICONS[index] ?? Sparkles;
                    return (
                      <li key={offer.title}>
                        <span className="tm-icon">
                          <Icon aria-hidden="true" />
                        </span>
                        <div>
                          <h3 className="tm-h3">{offer.title}</h3>
                          <p className="tm-body">{offer.text}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <h3 className="tm-subhead" id="tm-lab-steps">
              {labs.stepsTitle}
            </h3>
            <ol className="tm-lab-steps" aria-labelledby="tm-lab-steps">
              {labs.steps.map((step, index) => (
                <li key={step.name} data-reveal style={delay(index * 80)}>
                  <span>{index + 1}</span>
                  <h4>{step.name}</h4>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>

            <h3 className="tm-subhead" id="tm-lab-work">
              {labs.workTitle}
            </h3>
            <ul className="tm-grid tm-cols-4" aria-labelledby="tm-lab-work">
              {labs.work.map((item) => (
                <li className="tm-card tm-card--hover" key={item.title} data-reveal>
                  <h4 className="tm-h3">{item.title}</h4>
                  <p className="tm-body">{item.text}</p>
                  <ul className="tm-chips">
                    {item.tools.map((tool) => (
                      <li className="tm-chip" key={tool}>
                        {tool}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>

            <div className="tm-labs-who">
              <div>
                <h3 className="tm-h3">{labs.whoTitle}</h3>
                <ul className="tm-checks">
                  {labs.who.map((item) => (
                    <li key={item}>
                      <BadgeCheck aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="tm-labs-cta">
                <p className="tm-small">{labs.note}</p>
                <a className="tm-btn" href="#contact">
                  {labs.cta.label}
                  <ArrowRight aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="tm-section tm-section--tight" aria-labelledby="tm-cta-title">
          <div className="tm-container">
            <div className="tm-cta" data-solution-reveal>
              <div>
                <h2 id="tm-cta-title">{ctaBand.title}</h2>
                <p>{ctaBand.text}</p>
              </div>
              <div className="tm-cta-actions">
                <a className="tm-btn tm-btn--light" href="#contact">
                  Let&apos;s start your project
                  <ArrowRight aria-hidden="true" />
                </a>
                <a className="tm-call" href={contact.generalPhoneHref}>
                  <span>
                    <Phone aria-hidden="true" />
                  </span>
                  <span>
                    <small>Call us now</small>
                    <strong>{contact.generalPhone}</strong>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="tm-section tm-bg-soft tm-contact" id="contact" aria-labelledby="tm-contact-title">
          <div className="tm-container tm-split tm-split--top">
            <div className="tm-contact-info" data-solution-reveal>
              <p className="tm-eyebrow">Book a discovery call</p>
              <h2 className="tm-h2" id="tm-contact-title">
                Tell us what you are <span className="tm-accent">trying to build.</span>
              </h2>
              <p className="tm-body">
                Projects, products and lab time all start with a short conversation about the
                people, the constraints and the result you need.
              </p>
              <ul className="tm-contact-list">
                <li>
                  <span className="tm-round">
                    <Mail aria-hidden="true" />
                  </span>
                  <span>
                    <small>Email</small>
                    <a href={contact.partnershipsHref}>{contact.partnerships}</a>
                  </span>
                </li>
                <li>
                  <span className="tm-round">
                    <Phone aria-hidden="true" />
                  </span>
                  <span>
                    <small>Phone</small>
                    <a href={contact.generalPhoneHref}>{contact.generalPhone}</a>
                  </span>
                </li>
                <li>
                  <span className="tm-round">
                    <MapPin aria-hidden="true" />
                  </span>
                  <span>
                    <small>Address</small>
                    <span>{contact.address}</span>
                  </span>
                </li>
              </ul>
            </div>
            <div className="tm-card tm-contact-card">
              <EnquiryForm
                formId="tm-enquiry"
                theme="tm"
                title="New TechM4Solutions enquiry"
                fields={enquiryFields}
                submitLabel="Send request"
              />
            </div>
          </div>
        </section>
      </main>

      <SolutionsFooter />

      <StructuredData
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions" },
        ])}
      />
    </div>
  );
}
