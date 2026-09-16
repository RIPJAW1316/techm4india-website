import {
  ArrowLink,
  EditorialList,
  PageHero,
  PartnershipCTA,
  SectionHeading,
  StatRow,
} from "../../components/Shared";
import { StructuredData } from "../../components/StructuredData";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "TechM4India Company Management ERP V1",
  description:
    "A modular company management ERP blueprint for TechM4India: CRM, institutions, programs, projects, finance, inventory, assets and website CMS in one operating system.",
  path: "/solutions/erp",
});

const modules = [
  {
    title: "Company management",
    text: "Organization, divisions, departments, branches and company documents.",
    priority: "Essential",
  },
  {
    title: "Employee management",
    text: "Employee profiles, status, attendance, leave, documents, assignments and performance notes.",
    priority: "Essential",
  },
  {
    title: "CRM & leads",
    text: "A validated pipeline for website, school, college, university, corporate, government, CSR and partner enquiries.",
    priority: "Essential",
  },
  {
    title: "Institutions",
    text: "Profiles for schools, colleges, universities, clients and partners with relationship history.",
    priority: "Essential",
  },
  {
    title: "Programs",
    text: "Published program descriptions, curriculum, outcomes, eligibility, fees, capacity, media and SEO metadata.",
    priority: "Essential",
  },
  {
    title: "Projects",
    text: "Internal, R&D and client projects with teams, tasks, budgets, documents and progress.",
    priority: "Essential",
  },
  {
    title: "Basic finance",
    text: "Operational visibility for invoices, payments, income, expenses and outstanding balances.",
    priority: "Important",
  },
  {
    title: "Inventory & assets",
    text: "Stock movements, low-stock alerts, equipment, kits, assignments, warranties and locations.",
    priority: "Important",
  },
  {
    title: "Website CMS",
    text: "Authorized publishing for divisions, programs, projects, blogs, events, FAQs, team and careers.",
    priority: "Essential",
  },
  {
    title: "Dashboard & reports",
    text: "Management views for leads, institutions, programs, projects, finance, assets and inventory.",
    priority: "Essential",
  },
  {
    title: "Documents, notifications & audit",
    text: "Traceable files, operational reminders and a durable history of sensitive changes.",
    priority: "Essential",
  },
];

const workflows = [
  {
    title: "Website enquiry",
    text: "Visitor → contact form → validation and duplicate detection → CRM lead → assignment → follow-up.",
  },
  {
    title: "Institution relationship",
    text: "Qualified lead → institution profile → programs and projects → documents, invoices, payments and relationship history.",
  },
  {
    title: "Program publishing",
    text: "Content manager → draft program → review → publish → public website API.",
  },
  {
    title: "Payment verification",
    text: "Website → backend order → Razorpay → verified webhook → payment record → invoice update.",
  },
  {
    title: "Project delivery",
    text: "Project creation → manager → team → tasks → progress → deliverables → completion.",
  },
  {
    title: "Lead lifecycle",
    text: "New → contacted → qualified → meeting → proposal → negotiation → won or lost.",
  },
];

const roles = [
  "SUPER_ADMIN",
  "DIRECTOR",
  "DIVISION_HEAD",
  "HR_MANAGER",
  "SALES_MANAGER",
  "SALES_EXECUTIVE",
  "FINANCE_MANAGER",
  "PROJECT_MANAGER",
  "EMPLOYEE",
  "CONTENT_MANAGER",
  "VIEWER",
];

const integrations = [
  {
    title: "Divisions",
    text: "CMS/API-driven division pages for TechM4Schools, TechM4Engineering, TechM4Solutions and TechM4Space.",
  },
  {
    title: "Programs",
    text: "Published program records replace hardcoded website content incrementally.",
  },
  {
    title: "Projects",
    text: "Public project content can be exposed where the project is approved for publication.",
  },
  {
    title: "Blogs, events & FAQs",
    text: "Content managers can publish the stories, events and answers that keep the site current.",
  },
  {
    title: "Team & careers",
    text: "People and opportunity pages become controlled, reviewable CMS content.",
  },
  {
    title: "Contact",
    text: "Website enquiries are designed to become validated CRM leads for follow-up.",
  },
];

const security = [
  "JWT access and refresh tokens with rotation and revocation",
  "Backend-enforced RBAC with granular permissions",
  "Input validation and rate limiting for authentication and public lead endpoints",
  "Signed, authorized access to private documents",
  "Razorpay webhook signature verification",
  "Audit history for logins, publishing, payments, permission changes and sensitive records",
];

export default function ErpPage() {
  return (
    <main className="inner-page erp-page">
      <PageHero
        eyebrow="TechM4Solutions · ERP V1 blueprint"
        title={
          <>
            One operating system for a more <em>inventive company.</em>
          </>
        }
        description="The TechM4India Company Management ERP connects the public website to the operational work behind it: people, leads, institutions, programs, projects, finance, assets and content."
        image="/images/solutions/hero.jpeg"
        imageAlt="Two colleagues collaborating around a laptop in a technology workspace"
        ctaHref="#erp-modules"
        ctaLabel="Explore the modules"
      />

      <section className="erp-intro section shell">
        <div className="erp-intro-copy" data-reveal>
          <p className="section-kicker">
            <span>01 / Product definition</span>
          </p>
          <h2>
            Keep the public experience open. Put the <em>operating system behind it.</em>
          </h2>
          <p>
            V1 is intentionally smaller than a traditional enterprise ERP. It gives management one
            practical place to run the company while keeping the architecture ready for education
            ERP, advanced HR, finance analytics and mobile applications later.
          </p>
          <ArrowLink href="/contact">Discuss the ERP roadmap</ArrowLink>
        </div>
        <StatRow
          items={[
            { value: "11", label: "V1 operating modules" },
            { value: "4", label: "Connected divisions" },
            { value: "6", label: "Core workflows" },
            { value: "1", label: "Shared operational source" },
          ]}
        />
      </section>

      <section className="erp-architecture section">
        <div className="shell">
          <SectionHeading
            eyebrow="02 / Modular architecture"
            title={
              <>
                A focused V1 with room to <em>grow.</em>
              </>
            }
            text="The recommended foundation is a modular monolith: one coherent system for the first operational release, without prematurely splitting the work into microservices."
          />
          <div className="erp-architecture-rail" data-reveal>
            <span>Existing React + TypeScript website</span>
            <i aria-hidden="true">→</i>
            <span>NestJS + TypeScript API</span>
            <i aria-hidden="true">→</i>
            <span>Prisma + PostgreSQL</span>
            <small>
              Redis / BullMQ for jobs · S3-compatible storage · Razorpay payments · email / WhatsApp
              / SMS adapters
            </small>
          </div>
        </div>
      </section>

      <section className="erp-modules section" id="erp-modules">
        <div className="shell">
          <SectionHeading
            eyebrow="03 / The V1 modules"
            title={
              <>
                Everything the company needs to <em>move with clarity.</em>
              </>
            }
            text="Each module has a clear operational job. Together they create a traceable relationship between the company, its people, its work and the website."
          />
          <div className="erp-module-grid">
            {modules.map((module, index) => (
              <article key={module.title} className="erp-module-card" data-reveal>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <small>{module.priority}</small>
                <h3>{module.title}</h3>
                <p>{module.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="erp-workflows section shell">
        <SectionHeading
          eyebrow="04 / Key business workflows"
          title={
            <>
              From first enquiry to <em>long-term relationship.</em>
            </>
          }
          text="The ERP is organized around the moments where work changes hands. These flows are the connective tissue between the public website and internal operations."
        />
        <EditorialList items={workflows} />
      </section>

      <section className="erp-roles section">
        <div className="shell erp-roles-layout">
          <div data-reveal>
            <p className="section-kicker section-kicker-light">
              <span>05 / Roles & permissions</span>
            </p>
            <h2>
              Visibility is useful. <em>Authorization is essential.</em>
            </h2>
            <p>
              Frontend visibility is only a convenience. Access must be enforced by the backend,
              with role-based permissions and an audit trail for sensitive actions.
            </p>
          </div>
          <div className="erp-role-grid" data-reveal>
            {roles.map((role, index) => (
              <span key={role}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="erp-integration section shell">
        <SectionHeading
          eyebrow="06 / Existing website integration"
          title={
            <>
              The public website stays recognizable while the content becomes <em>operational.</em>
            </>
          }
          text="The ERP connects to the current public experience incrementally. The visual direction remains intact; authorized content managers gain a dependable publishing path."
        />
        <div className="erp-integration-grid">
          {integrations.map((item, index) => (
            <article key={item.title} data-reveal>
              <span>0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="erp-security section">
        <div className="shell erp-security-layout">
          <div data-reveal>
            <p className="section-kicker">
              <span>07 / Security baseline</span>
            </p>
            <h2>
              Build trust into <em>the foundation.</em>
            </h2>
            <p>Security, compliance and traceability are part of V1, not a later polish pass.</p>
          </div>
          <div className="erp-security-list">
            {security.map((item, index) => (
              <div key={item} data-reveal>
                <span>0{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PartnershipCTA
        eyebrow="ERP implementation roadmap"
        title={
          <>
            Start with the <em>operational truth.</em>
          </>
        }
        text="The next step is an audit of the existing frontend, an approved architecture and a database model that can grow with the company."
      />
      <StructuredData
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Solutions", path: "/solutions" },
            { name: "Company Management ERP V1", path: "/solutions/erp" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "TechM4India Company Management ERP V1",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "A modular operational ERP blueprint connecting TechM4India's website, company, CRM, institutions, programs, projects, finance, inventory, assets and CMS.",
            url: "https://www.techm4india.com/solutions/erp",
            publisher: { "@id": "https://www.techm4india.com/#organization" },
          },
        ]}
      />
    </main>
  );
}
