import { ArrowLink, EditorialList, PageHero, PartnershipCTA, PeopleGrid, SectionHeading, StatRow } from "../components/Shared";
import { StructuredData } from "../components/StructuredData";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "TechM4Solutions | Technology Solutions",
  description:
    "TechM4Solutions delivers enterprise software, AI integration, and digital transformation services for global organizations.",
  path: "/solutions",
});

const services = [
  { title: "AI & agentic AI solutions", text: "Intelligent systems that help teams see patterns, make decisions and act with more context." },
  { title: "Software development", text: "Reliable web platforms and product systems designed around the people who use them." },
  { title: "Mobile app development", text: "Useful, focused mobile experiences that turn a service into a habit." },
  { title: "ERP & enterprise systems", text: "Connect the operations that make an organization move." },
  { title: "Cloud & DevOps", text: "Infrastructure and delivery practices that let good software keep getting better." },
  { title: "Data & analytics", text: "Turn scattered information into a clearer view of the next decision." },
];

const industries = ["Education", "Healthcare", "Agriculture", "Manufacturing", "Retail & ecommerce", "Finance", "Logistics", "Government", "Aerospace & defence"];

const caseStudies = [
  { label: "Learning systems", value: "50K+", text: "students managed through a digital learning environment" },
  { label: "Enterprise resource planning", value: "60%", text: "less manual operations in a mapped workflow" },
  { label: "AI support", value: "80%", text: "faster response in a focused support experience" },
  { label: "Workflow automation", value: "70%", text: "less processing time in a repeatable task" },
];

const products = [
  { title: "Agriculture intelligence", image: "/images/solutions/product-agri.png", text: "Products that make field decisions more visible and actionable." },
  { title: "AI support platforms", image: "/images/solutions/product-ai.png", text: "Calmer, faster experiences for people who need answers." },
  { title: "Enterprise resource planning", image: "/images/solutions/product-erp.png", text: "The connective tissue behind a growing organization." },
  { title: "Learning management", image: "/images/solutions/product-lms.png", text: "Digital learning systems that keep people moving." },
  { title: "Workflow systems", image: "/images/solutions/product-workflow.png", text: "Less friction between a request and a result." },
];

export default function SolutionsPage() {
  return (
    <main className="inner-page solutions-page">
      <PageHero
        eyebrow="TechM4Solutions · Digital engineering"
        title={<>Engineering the future through <em>AI, software & digital innovation.</em></>}
        description="We partner with startups, enterprises, educational institutions, industries and public organizations to design, develop and scale intelligent digital solutions."
        image="/images/solutions/hero.jpeg"
        imageAlt="Two women collaborating around a laptop in a technology workspace"
      />

      <section className="solutions-intro section shell">
        <SectionHeading
          eyebrow="01 / The point of view"
          title={<>Technology should make the <em>next step clearer.</em></>}
          text="The best digital work is both ambitious and legible. It respects the complexity of an organization, then gives people a simpler way to move through it."
        />
        <StatRow items={[
          { value: "50+", label: "Solutions delivered" },
          { value: "10+", label: "Industries served" },
          { value: "AI-first", label: "Development focus" },
          { value: "Global", label: "Delivery capability" },
        ]} />
      </section>

      <section className="services-section section">
        <div className="shell">
          <SectionHeading
            eyebrow="02 / What we do"
            title={<>A technology partner for the <em>whole journey.</em></>}
            text="From a first prototype to an operational system, our services are shaped around outcomes rather than fashionable tools."
          />
          <EditorialList items={services} />
        </div>
      </section>

      <section className="industry-section section shell">
        <div className="industry-intro" data-reveal>
          <p className="section-kicker"><span>03 / Where it matters</span></p>
          <h2>Different contexts. <em>Same care.</em></h2>
          <p>We listen for the constraints of the industry before we recommend the technology.</p>
        </div>
        <div className="industry-list">
          {industries.map((industry, index) => (
            <span key={industry} data-reveal><b>{String(index + 1).padStart(2, "0")}</b>{industry}</span>
          ))}
        </div>
      </section>

      <section className="product-showcase section">
        <div className="shell">
          <SectionHeading
            eyebrow="04 / Featured products"
            title={<>Real systems for <em>real conditions.</em></>}
            text="A glimpse at the product thinking moving through TechM4Solutions."
          />
          <div className="product-showcase-grid">
            {products.map((product, index) => (
              <article className={"showcase-card showcase-card-" + index} key={product.title} data-reveal>
                <div className="showcase-image"><img src={product.image} alt="" loading="lazy" /></div>
                <p>0{index + 1} / Product direction</p>
                <h3>{product.title}</h3>
                <p>{product.text}</p>
                <ArrowLink href="/contact">Discuss a build</ArrowLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="case-studies-section section shell">
        <SectionHeading
          eyebrow="05 / Case study signals"
          title={<>The work should leave a <em>measurable trace.</em></>}
          text="Examples from the current TechM4Solutions portfolio show the kinds of outcomes we design toward."
        />
        <div className="case-study-grid">
          {caseStudies.map((item, index) => (
            <article key={item.label} data-reveal>
              <span>0{index + 1}</span>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="labs-section section">
        <div className="shell labs-layout">
          <div className="labs-copy" data-reveal>
            <p className="section-kicker"><span>06 / Research labs</span></p>
            <h2>Curiosity needs a place to <em>stay unfinished.</em></h2>
            <p>Our labs keep space for exploration alongside delivery: test an idea, challenge the assumption, learn what the system is telling you.</p>
            <ArrowLink href="/contact">Talk to the solutions team</ArrowLink>
          </div>
          <div className="labs-list">
            {["AI lab", "Enterprise innovation lab", "Future technologies lab", "Space technology lab"].map((lab, index) => (
              <div key={lab} data-reveal><span>0{index + 1}</span><h3>{lab}</h3><i aria-hidden="true">↗</i></div>
            ))}
          </div>
        </div>
      </section>

      <section className="delivery-section section shell">
        <SectionHeading
          eyebrow="07 / Global delivery model"
          title={<>Close enough to understand. <em>Wide enough to deliver.</em></>}
        />
        <div className="delivery-map">
          {["North America", "Europe", "Middle East", "India · HQ", "Southeast Asia"].map((region, index) => (
            <div key={region} data-reveal><span>0{index + 1}</span><h3>{region}</h3><p>{index === 3 ? "The context that keeps the work grounded." : "A partner horizon for thoughtful delivery."}</p></div>
          ))}
        </div>
      </section>

      <section className="solutions-team section shell">
        <SectionHeading eyebrow="08 / The team" title={<>Technical depth with a <em>human edge.</em></>} />
        <PeopleGrid compact />
      </section>

      <PartnershipCTA
        eyebrow="Technology partnerships"
        title={<>Bring us the hard problem. <em>Let&apos;s build.</em></>}
        text="Start with a conversation about the people, constraints and outcome. The right technology follows."
      />
      <StructuredData data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Solutions", path: "/solutions" }])} />
    </main>
  );
}
