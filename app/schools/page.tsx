/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Bot,
  Brain,
  ChevronRight,
  CircuitBoard,
  Code,
  Compass,
  FlaskConical,
  GraduationCap,
  Handshake,
  Layers,
  Lightbulb,
  Medal,
  Plane,
  Presentation,
  Puzzle,
  School,
  Sparkles,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { MindMap } from "../components/xp/schools/MindMap";
import { EnquiryForm } from "../components/worlds/EnquiryForm";
import { BannerCarousel, ScrollRow } from "../components/worlds/SchoolCarousels";
import {
  EnquireButton,
  EnquiryModal,
  SchoolsFooter,
  SchoolsHeader,
  schoolEnquiryFields,
} from "../components/worlds/SchoolsChrome";
import { StructuredData } from "../components/StructuredData";
import { leads } from "@/lib/content/home";
import {
  audiences,
  hero,
  heroInside,
  implementation,
  innovateBharath,
  journey,
  journeyIntro,
  kits,
  kitsIntro,
  labRoom,
  labs,
  labsIntro,
  mindMap,
  nep,
  outcomes,
  outcomesIntro,
  pillars,
  platforms,
  platformsIntro,
  programmes,
  programmesIntro,
  transformation,
  validation,
  validationLedger,
} from "@/lib/content/schools";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "TechM4Schools | Labs, kits and programmes that turn curiosity into capability",
  description:
    "TechM4Schools brings a five-lab Composite Skill Lab, innovation kits, CareerBuddy, SchoolOS and the Innovate Bharath programme into schools. 1,200+ students, 8 ideas funded.",
  path: "/schools",
});

const delay = (ms: number) => ({ "--delay": ms + "ms" }) as CSSProperties;

const LAB_LOOK: { icon: LucideIcon; a: string; b: string }[] = [
  { icon: Code, a: "#1f4f9f", b: "#0f2c63" },
  { icon: Bot, a: "#0b7d3e", b: "#075a2d" },
  { icon: Plane, a: "#1a8fc7", b: "#0f5f8c" },
  { icon: Brain, a: "#6a3fb5", b: "#43237f" },
  { icon: Lightbulb, a: "#e9493c", b: "#a8261d" },
];
const KIT_ICONS: LucideIcon[] = [Bot, CircuitBoard, Plane, Puzzle];
const OUTCOME_ICONS: LucideIcon[] = [Puzzle, Zap, Brain, Lightbulb, Users, Compass];
const PILLAR_ICONS: LucideIcon[] = [BookOpen, FlaskConical, Layers, Handshake];
const AUDIENCE_ICONS: LucideIcon[] = [GraduationCap, Users, School, Presentation, Handshake];
const AWARD_ICONS: LucideIcon[] = [Award, Medal, Trophy];

const confirmedValidation = validationLedger.filter((entry) => entry.confirmed && entry.detail);

export default function SchoolsPage() {
  const [ibStudents, ibIdeas] = innovateBharath.figures;

  const slides = [
    <div className="sc-slide sc-slide--cutout" key="curiosity">
      <div className="sc-slide-bg" aria-hidden="true" />
      <img
        className="sc-cutout"
        src="/images/schools/pallavi-student-robotics-cutout.webp"
        alt="A school student in uniform smiling at a small robot he holds up"
        fetchPriority="high"
      />
      <div className="sc-container">
        <div className="sc-slide-copy">
          <span className="sc-slide-tag">{hero.kicker}</span>
          <h1>
            {hero.title}, <em>{hero.titleAccent}</em>
          </h1>
          <p>{hero.lede}</p>
          <div className="sc-actions">
            <EnquireButton className="sc-btn sc-btn--yellow">Bring it to your school</EnquireButton>
            <a className="sc-btn sc-btn--outline" href="#journey">
              Follow the student journey
            </a>
          </div>
        </div>
      </div>
    </div>,
    <div className="sc-slide" key="innovate">
      <div className="sc-slide-bg" aria-hidden="true">
        <img src="/images/schools/hero.jpeg" alt="" loading="lazy" />
      </div>
      <div className="sc-container">
        <div className="sc-slide-copy">
          <span className="sc-slide-tag">{innovateBharath.label}</span>
          <h2>
            {ibStudents.value}
            {ibStudents.suffix} students. <em>{ibIdeas.value} ideas selected and funded.</em>
          </h2>
          <p>{innovateBharath.body}</p>
          <div className="sc-actions">
            <a className="sc-btn" href="#innovate-bharath">
              About Innovate Bharath
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>,
    <div className="sc-slide" key="labs">
      <div className="sc-slide-bg" aria-hidden="true">
        <img src={labRoom.image} alt="" loading="lazy" />
      </div>
      <div className="sc-container">
        <div className="sc-slide-copy">
          <span className="sc-slide-tag">{labsIntro.label}</span>
          <h2>
            {labsIntro.title} <em>{labsIntro.titleAccent}</em>
          </h2>
          <p>{labsIntro.lede}</p>
          <div className="sc-actions">
            <a className="sc-btn" href="#labs">
              Explore the labs
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>,
    <div className="sc-slide" key="kits">
      <div className="sc-slide-bg" aria-hidden="true">
        <img src={kitsIntro.image} alt="" loading="lazy" />
      </div>
      <div className="sc-container">
        <div className="sc-slide-copy">
          <span className="sc-slide-tag">{kitsIntro.label}</span>
          <h2>
            {kitsIntro.title} <em>{kitsIntro.titleAccent}</em>
          </h2>
          <p>{kitsIntro.body}</p>
          <div className="sc-actions">
            <a className="sc-btn" href="#kits">
              See the kits
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>,
  ];

  return (
    <div className="sc-world">
      <SchoolsHeader />

      <main id="top">
        <BannerCarousel slides={slides} label="TechM4Schools highlights" />

        {/* Figures strip overlapping the banner */}
        <div className="sc-container">
          <ul className="sc-stats" aria-label={heroInside.label}>
            {heroInside.items.map((item) => (
              <li key={item.label}>
                <a href={item.href}>
                  <strong>
                    {item.value}
                    {item.suffix && <sup>{item.suffix}</sup>}
                  </strong>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Why choose */}
        <section className="sc-section" id="about" aria-labelledby="sc-about-title">
          <div className="sc-container sc-split">
            <div className="sc-blob" data-reveal>
              <img src={transformation.image} alt={transformation.imageAlt} loading="lazy" />
              <span className="sc-blob-credit">{transformation.imageNote}</span>
              <span className="sc-doodle-mark" style={{ top: "-6%", left: "4%" }} aria-hidden="true">
                <Sparkles />
              </span>
            </div>
            <div className="sc-why-copy" data-reveal>
              <h2 className="sc-title" id="sc-about-title">
                Why choose <em>TechM4Schools?</em>
              </h2>
              <p>
                TechM4Schools brings structured innovation ecosystems, experiential learning
                environments and career-oriented technology programmes directly into schools, so
                students practise technology instead of only reading about it.
              </p>
              <ul className="sc-why-grid">
                {pillars.map((pillar, index) => {
                  const Icon = PILLAR_ICONS[index] ?? BadgeCheck;
                  return (
                    <li className="sc-tick" key={pillar.title}>
                      <Icon aria-hidden="true" />
                      <div>
                        <strong>{pillar.title}</strong>
                        <span>{pillar.text}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="sc-actions">
                <EnquireButton>Enquire now</EnquireButton>
                <a className="sc-btn sc-btn--navy" href="#programmes">
                  Our programmes
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Innovate Bharath */}
        <section className="sc-band" id="innovate-bharath" aria-labelledby="sc-ib-title">
          <div className="sc-container sc-ib">
            <div className="sc-ib-copy" data-reveal>
              <h2 className="sc-title" id="sc-ib-title">
                {innovateBharath.label}: <em>ideas that get funded</em>
              </h2>
              <p className="sc-sub">{innovateBharath.body}</p>
              {innovateBharath.figuresConfirmed && (
                <ul className="sc-ib-figures">
                  {innovateBharath.figures.map((figure) => (
                    <li key={figure.label}>
                      <strong>
                        {figure.value}
                        {figure.suffix}
                      </strong>
                      <span>{figure.label}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="sc-ib-note">{innovateBharath.note}</p>
              <div className="sc-actions">
                <EnquireButton className="sc-btn sc-btn--yellow">Ask about Innovate Bharath</EnquireButton>
              </div>
            </div>
            <ol className="sc-ib-steps">
              {innovateBharath.steps.map((step, index) => (
                <li key={step.title} data-reveal style={delay(index * 90)}>
                  <span>{index + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Transformation */}
        <section className="sc-section" id="transformation" aria-labelledby="sc-shift-title">
          <div className="sc-container">
            <div className="sc-head sc-head--center">
              <h2 className="sc-title sc-title--center" id="sc-shift-title">
                The same student, <em>a different way of learning</em>
              </h2>
              <p className="sc-sub">{transformation.lede}</p>
            </div>
            <div className="sc-shift-head" aria-hidden="true">
              <span />
              <span>{transformation.beforeLabel}</span>
              <span />
              <span>{transformation.afterLabel}</span>
            </div>
            <ul className="sc-shift">
              {transformation.shifts.map((shift, index) => (
                <li key={shift.aspect} data-reveal style={delay(index * 60)}>
                  <span className="sc-shift-aspect">{shift.aspect}</span>
                  <span className="sc-shift-before">
                    <span className="sr-only">Before: </span>
                    {shift.before}
                  </span>
                  <span className="sc-shift-arrow" aria-hidden="true">
                    <ChevronRight />
                  </span>
                  <span className="sc-shift-after">
                    <span className="sr-only">With TechM4Schools: </span>
                    {shift.after}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Composite Skill Lab: the "facilities" row */}
        <section className="sc-section sc-soft" id="labs" aria-labelledby="sc-labs-title">
          <div className="sc-container">
            <div className="sc-head">
              <h2 className="sc-title" id="sc-labs-title">
                {labsIntro.label}: <em>{labsIntro.title.toLowerCase()} {labsIntro.titleAccent}</em>
              </h2>
              <p className="sc-sub">{labsIntro.lede.replace(" Choose a lab to see what students do there.", "")}</p>
            </div>
            <ScrollRow label="The five labs">
              {labs.map((lab, index) => {
                const look = LAB_LOOK[index] ?? LAB_LOOK[0];
                const Icon = look.icon;
                return (
                  <li key={lab.id}>
                    <article
                      className="sc-card sc-lab"
                      style={{ "--lab-a": look.a, "--lab-b": look.b } as CSSProperties}
                      aria-labelledby={"sc-lab-" + lab.id}
                    >
                      <div className="sc-lab-top">
                        <Icon aria-hidden="true" />
                        <span>Lab {index + 1}</span>
                        <h3 id={"sc-lab-" + lab.id}>{lab.name}</h3>
                      </div>
                      <div className="sc-lab-body">
                        <p>{lab.description}</p>
                        <ul>
                          {lab.activities.map((activity) => (
                            <li key={activity}>{activity}</li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ScrollRow>
            <div className="sc-room" data-reveal>
              <img src={labRoom.image} alt={labRoom.imageAlt} loading="lazy" />
              <div>
                <h3 className="sc-h3">{labRoom.title}</h3>
                <ul className="sc-room-list">
                  {labRoom.items.map((item) => (
                    <li className="sc-tick" key={item}>
                      <BadgeCheck aria-hidden="true" />
                      <strong>{item}</strong>
                    </li>
                  ))}
                </ul>
                <p className="sc-small" style={{ marginTop: 14 }}>
                  {labRoom.note}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Platforms: the curriculum-card layout */}
        <section className="sc-section" id="platforms" aria-labelledby="sc-platforms-title">
          <div className="sc-container">
            <div className="sc-head">
              <h2 className="sc-title" id="sc-platforms-title">
                Our learning <em>platforms</em>
              </h2>
              <p className="sc-sub">{platformsIntro.lede}</p>
            </div>
            <div className="sc-platforms">
              <div className="sc-frame" data-reveal>
                <img src={hero.image} alt={hero.imageAlt} loading="lazy" />
              </div>
              {platforms.map((platform, index) => (
                <article className="sc-card sc-platform" id={platform.id} key={platform.id} data-reveal style={delay(index * 90)}>
                  <span className={"sc-icon" + (index ? " sc-icon--green" : "")}>
                    {index ? <Layers aria-hidden="true" /> : <Compass aria-hidden="true" />}
                  </span>
                  <h3 className="sc-h3">{platform.name}</h3>
                  <p className="sc-small">{platform.kind}</p>
                  <p>{platform.description}</p>
                  <ul>
                    {platform.features.map((feature) => (
                      <li className="sc-tick" key={feature}>
                        <BadgeCheck aria-hidden="true" />
                        <strong style={{ fontSize: 13.5, fontWeight: 500 }}>{feature}</strong>
                      </li>
                    ))}
                  </ul>
                  <EnquireButton className="sc-btn sc-btn--navy sc-btn--sm">Request a demo</EnquireButton>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Kits */}
        <section className="sc-section sc-soft" id="kits" aria-labelledby="sc-kits-title">
          <div className="sc-container">
            <div className="sc-head sc-head--center">
              <h2 className="sc-title sc-title--center" id="sc-kits-title">
                Innovation <em>kits</em>
              </h2>
              <p className="sc-sub">{kitsIntro.body}</p>
            </div>
            <ul className="sc-grid sc-cols-4">
              {kits.map((kit, index) => {
                const Icon = KIT_ICONS[index] ?? Puzzle;
                return (
                  <li className="sc-card" key={kit.name} data-reveal style={delay(index * 70)}>
                    <span className={"sc-icon" + (["", " sc-icon--green", " sc-icon--yellow", " sc-icon--red"][index] ?? "")}>
                      <Icon aria-hidden="true" />
                    </span>
                    <h3 className="sc-h3">{kit.name}</h3>
                    <p>{kit.text}</p>
                  </li>
                );
              })}
            </ul>
            <p className="sc-small" style={{ marginTop: 20, textAlign: "center" }}>
              {kitsIntro.note}
            </p>
          </div>
        </section>

        {/* Programmes: the "mark the date" board */}
        <section className="sc-band" id="programmes" aria-labelledby="sc-programmes-title">
          <div className="sc-container">
            <div className="sc-head">
              <h2 className="sc-title" id="sc-programmes-title">
                {programmesIntro.title} <em>{programmesIntro.titleAccent}</em>
              </h2>
              <p className="sc-sub">{programmesIntro.lede}</p>
            </div>
            <div className="sc-board">
              <div className="sc-board-card" data-reveal>
                <h3>Through the year</h3>
                <ul className="sc-rhythm">
                  {programmes.map((programme) => (
                    <li key={programme.name}>
                      <strong>{programme.rhythm}</strong>
                      <span>{programme.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="sc-board-card" data-reveal>
                <h3>Programme buzz</h3>
                <div className="sc-buzz">
                  <div className="sc-buzz-col">
                    <p>In school</p>
                    <ul>
                      {programmes.slice(0, 3).map((programme) => (
                        <li key={programme.name}>
                          <strong>{programme.name}</strong>
                          <span>{programme.rhythm}</span>
                          <em>{programme.text}</em>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="sc-buzz-col">
                    <p>Projects and competitions</p>
                    <ul>
                      {programmes.slice(3).map((programme) => (
                        <li key={programme.name}>
                          <strong>{programme.name}</strong>
                          <span>{programme.rhythm}</span>
                          <em>{programme.text}</em>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Outcomes */}
        <section className="sc-section" aria-labelledby="sc-outcomes-title">
          <div className="sc-container">
            <div className="sc-head sc-head--center">
              <h2 className="sc-title sc-title--center" id="sc-outcomes-title">
                What every student <em>takes away</em>
              </h2>
              <p className="sc-sub">{outcomesIntro.note}</p>
            </div>
            <ul className="sc-grid sc-cols-3">
              {outcomes.map((outcome, index) => {
                const Icon = OUTCOME_ICONS[index] ?? Sparkles;
                return (
                  <li className="sc-card" key={outcome.title} data-reveal style={delay((index % 3) * 70)}>
                    <span className="sc-icon sc-icon--green">
                      <Icon aria-hidden="true" />
                    </span>
                    <h3 className="sc-h3">{outcome.title}</h3>
                    <p>{outcome.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Student journey */}
        <section className="sc-section sc-soft" id="journey" aria-labelledby="sc-journey-title">
          <div className="sc-container">
            <div className="sc-head sc-head--center">
              <h2 className="sc-title sc-title--center" id="sc-journey-title">
                The student <em>journey</em>
              </h2>
              <p className="sc-sub">{journeyIntro.lede}</p>
            </div>
            <ol className="sc-journey">
              {journey.map((stage, index) => (
                <li key={stage.id} data-reveal style={delay(index * 80)}>
                  <span className="sc-journey-no">{index + 1}</span>
                  <h3>{stage.title}</h3>
                  <p>{stage.happens}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Mind map */}
        <section className="sc-band" id="where-it-leads" aria-labelledby="sc-map-title">
          <div className="sc-container">
            <div className="sc-head">
              <h2 className="sc-title" id="sc-map-title">
                {mindMap.title} <em>{mindMap.titleAccent}</em>
              </h2>
              <p className="sc-sub">{mindMap.lede}</p>
            </div>
            <MindMap center={mindMap.center} branches={mindMap.branches} />
            <div className="sc-map-foot">
              <p>{mindMap.note}</p>
              <EnquireButton className="sc-btn sc-btn--yellow">{mindMap.cta.label}</EnquireButton>
            </div>
          </div>
        </section>

        {/* Leaders */}
        <section className="sc-section" aria-labelledby="sc-leaders-title">
          <div className="sc-container">
            <div className="sc-head sc-head--center">
              <h2 className="sc-title sc-title--center" id="sc-leaders-title">
                Mentors who <em>understand education</em>
              </h2>
              <p className="sc-sub">The people behind the programme.</p>
            </div>
            <ul className="sc-leaders">
              {leads.map((lead, index) => (
                <li className="sc-leader" key={lead.id} data-reveal style={delay(index * 80)}>
                  <div className="sc-leader-photo">
                    <img src={lead.image} alt={"Portrait of " + lead.name} loading="lazy" />
                  </div>
                  <div className="sc-leader-body">
                    <strong>{lead.name}</strong>
                    <span>{lead.role}</span>
                    <p>{lead.contributions[0]?.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Partners: validation, implementation and NEP alignment */}
        <section className="sc-section sc-soft" id="partners" aria-labelledby="sc-partners-title">
          <div className="sc-container">
            <div className="sc-head sc-head--center">
              <h2 className="sc-title sc-title--center" id="sc-partners-title">
                {validation.title} <em>academia and industry</em>
              </h2>
              <p className="sc-sub">{validation.intro}</p>
            </div>
            {confirmedValidation.length > 0 && (
              <ul className="sc-awards">
                {confirmedValidation.map((entry, index) => {
                  const Icon = AWARD_ICONS[index] ?? Award;
                  return (
                    <li className="sc-card sc-award" key={entry.name} data-reveal style={delay(index * 80)}>
                      <span className={"sc-icon" + (["", " sc-icon--green", " sc-icon--yellow"][index] ?? "")}>
                        <Icon aria-hidden="true" />
                      </span>
                      <strong>{entry.name}</strong>
                      <p>{entry.detail}</p>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="sc-grid sc-cols-2" style={{ marginTop: 32 }}>
              <div className="sc-card" data-reveal>
                <h3 className="sc-h3">{implementation.title} for every partner school</h3>
                <ul className="sc-room-list">
                  {implementation.items.map((item) => (
                    <li className="sc-tick" key={item}>
                      <BadgeCheck aria-hidden="true" />
                      <strong>{item}</strong>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="sc-card" data-reveal>
                <span className="sc-icon sc-icon--yellow">
                  <BookOpen aria-hidden="true" />
                </span>
                <h3 className="sc-h3">{nep.label}</h3>
                <p>{nep.text}</p>
                <p className="sc-small">
                  Curriculum aligned with NEP 2020 and CBSE and State board requirements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enquire */}
        <section className="sc-section" id="enquire" aria-labelledby="sc-enquire-title">
          <div className="sc-container">
            <div className="sc-head sc-head--center">
              <h2 className="sc-title sc-title--center" id="sc-enquire-title">
                Bring TechM4Schools <em>to your school</em>
              </h2>
              <p className="sc-sub">
                Tell us about your school, your grades and the space you have, and the team will
                plan a programme with you.
              </p>
            </div>
            <div className="sc-visit">
              <div className="sc-card" style={{ padding: "clamp(22px, 3vw, 34px)" }}>
                <EnquiryForm
                  formId="sc-page"
                  theme="sc"
                  title="New TechM4Schools enquiry"
                  fields={schoolEnquiryFields}
                  submitLabel="Submit enquiry"
                />
              </div>
              <div className="sc-paths">
                {audiences.map((path, index) => {
                  const Icon = AUDIENCE_ICONS[index] ?? Users;
                  const external = /^(https?:|mailto:)/.test(path.href);
                  const href = path.href.startsWith("/contact") ? "#enquire" : path.href;
                  return external ? (
                    <a key={path.audience} href={href} target={path.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                      <span className="sc-icon">
                        <Icon aria-hidden="true" />
                      </span>
                      <span>
                        <strong>For {path.audience.toLowerCase()}</strong>
                        <span>{path.title}</span>
                      </span>
                      <ChevronRight aria-hidden="true" />
                    </a>
                  ) : (
                    <a key={path.audience} href={href}>
                      <span className="sc-icon">
                        <Icon aria-hidden="true" />
                      </span>
                      <span>
                        <strong>For {path.audience.toLowerCase()}</strong>
                        <span>{path.title}</span>
                      </span>
                      <ChevronRight aria-hidden="true" />
                    </a>
                  );
                })}
                <Link href="/" className="sc-small" style={{ marginTop: 6 }}>
                  ← Back to TechM4India
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SchoolsFooter />
      <EnquiryModal />

      <StructuredData
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Schools", path: "/schools" },
        ])}
      />
    </div>
  );
}
