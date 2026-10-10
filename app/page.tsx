/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */
import { ActivityBoard } from "./components/xp/home/ActivityBoard";
import { DivisionExplorer } from "./components/xp/home/DivisionExplorer";
import { HeroEcosystem } from "./components/xp/home/HeroEcosystem";
import { UpdatesFeed } from "./components/xp/home/UpdatesFeed";
import { Btn, ClosingPaths, Kicker, Plate, SectionHead, TextLink } from "./components/xp/Primitives";
import { ProfileDialog } from "./components/xp/ProfileDialog";
import { StructuredData } from "./components/StructuredData";
import { activities, ecosystem, leads, updates, updatesReviewedOn } from "@/lib/content/home";
import { contact } from "@/lib/site-data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "TechM4India | Schools, Engineering, Solutions, Space & Institutes",
  description:
    "TechM4India is an innovation ecosystem across five divisions: TechM4Schools, TechM4Engineering, TechM4Solutions, TechM4Space and TechM4Institutes.",
  path: "/",
});

const principles = [
  {
    title: "Experiential learning",
    text: "Students do not just read about technology. They build, test, fail, refine and present work that is theirs.",
  },
  {
    title: "Industry alignment",
    text: "Programmes are shaped around the tools and habits real teams use.",
  },
  {
    title: "NEP 2020 alignment",
    text: "Curriculum and credit pathways can meet institutions where they are.",
  },
];

export default function Home() {
  const buildDate = new Date().toISOString().slice(0, 10);

  return (
    <main className="xp xp-home">
      <HeroEcosystem divisions={ecosystem} />

      <section className="xp-section xh-idea" aria-labelledby="idea-title">
        <div className="xp-shell xh-idea-grid">
          <div className="xh-idea-side" data-reveal>
            <Kicker index="01">The idea</Kicker>
            <Plate
              src="/images/home/mentor-students.jpeg"
              alt="A TechM4India mentor talking with two students in a maker lab"
              caption="Learning by making"
              note="Hyderabad"
              ratio="4x5"
            />
          </div>
          <div className="xh-idea-copy" data-reveal>
            <h2 className="xh-statement" id="idea-title">
              TechM4India is a technology and learning ecosystem for the people who will make the
              future <em>tangible.</em>
            </h2>
            <p className="xp-lede">
              We connect institutions, educators, industry and students through work that has
              somewhere to go beyond the classroom.
            </p>
            <ul className="xh-principles">
              {principles.map((item, index) => (
                <li key={item.title}>
                  <span className="xp-meta">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <TextLink href="/about">Read our story</TextLink>
          </div>
        </div>
      </section>

      <section className="xp-section xp-tone-tint xh-eco" id="ecosystem" aria-labelledby="eco-title">
        <div className="xp-shell">
          <SectionHead
            index="02"
            label="The ecosystem"
            id="eco-title"
            title={
              <>
                Five divisions. <em>One way of working.</em>
              </>
            }
            lede="From a first robot at school to software in production: each division picks up where the last one leaves off. Choose one to see what is inside it, what its people work with, and where to go next."
          />

          <DivisionExplorer divisions={ecosystem} />
        </div>
      </section>

      <section className="xp-section xh-events" id="events" aria-labelledby="events-title">
        <div className="xp-shell">
          <SectionHead
            index="03"
            label="Events and activities"
            id="events-title"
            title={
              <>
                What has happened, and <em>what is open now.</em>
              </>
            }
            lede="Bootcamps, cohorts, challenges and sessions across the ecosystem. Dated events move from Upcoming to Past on their own."
          />
          <ActivityBoard activities={activities} buildDate={buildDate} />
        </div>
      </section>

      <section
        className="xp-section xp-tone-ink xh-roles"
        id="opportunities"
        aria-labelledby="roles-title"
      >
        <div className="xp-shell">
          <SectionHead
            index="04"
            label="Internship and placement updates"
            id="roles-title"
            title={
              <>
                Work on things that <em>ship.</em>
              </>
            }
            lede="Internships, fellowships, roles and placement news across every division, newest first. Apply through the contact form or write to the HR team."
          />

          <div className="xh-roles-grid">
            <UpdatesFeed updates={updates} reviewedOn={updatesReviewedOn} />

            <aside className="xh-roles-side" aria-label="How to apply">
              <div className="xh-roles-apply" data-reveal>
                <p className="xp-meta">How to apply</p>
                <p className="xp-subtitle">Send your profile to the HR team.</p>
                <p className="xp-body">
                  Tell us the track you are interested in and share a CV or portfolio. The team
                  replies with current availability and next steps.
                </p>
                <div className="xh-roles-contacts">
                  <a className="xp-link" href={contact.hrHref}>
                    <span>{contact.hr}</span>
                    <i aria-hidden="true">↗</i>
                  </a>
                  <a className="xp-link" href={contact.hrPhoneHref}>
                    <span>{contact.hrPhone}</span>
                    <i aria-hidden="true">↗</i>
                  </a>
                </div>
                <Btn href="/contact#contact-form" variant="light">
                  Apply through the contact form
                </Btn>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="xp-section xh-leads" id="leadership" aria-labelledby="leads-title">
        <div className="xp-shell">
          <SectionHead
            index="05"
            label="The leads"
            id="leads-title"
            title={
              <>
                Led by people who <em>stay close to the work.</em>
              </>
            }
            lede="Academic depth, technical fluency and a bias toward building shape the programme team. Select a profile to read more."
          />
          <ul className="xh-leads-grid">
            {leads.map((lead, index) => (
              <li key={lead.id} data-reveal>
                <ProfileDialog
                  id={"profile-" + lead.id}
                  triggerClassName="xh-lead"
                  triggerLabel={"Open profile: " + lead.name + ", " + lead.role}
                  title={lead.name}
                  trigger={
                    <>
                      <span className="xh-lead-photo">
                        <img src={lead.image} alt="" loading="lazy" decoding="async" />
                        <span className="xp-meta">{String(index + 1).padStart(2, "0")}</span>
                      </span>
                      <span className="xh-lead-name">{lead.name}</span>
                      <span className="xh-lead-role">{lead.role}</span>
                      <span className="xh-lead-more">
                        Read profile <i aria-hidden="true">+</i>
                      </span>
                    </>
                  }
                >
                  <div className="xh-profile">
                    <div className="xh-profile-photo">
                      <img src={lead.image} alt={"Portrait of " + lead.name} />
                    </div>
                    <div className="xh-profile-copy">
                      <p className="xp-meta">{lead.role}</p>
                      <p className="xp-lede">{lead.background}</p>
                      <h4 className="xp-meta">Contribution to TechM4India</h4>
                      <dl className="xh-profile-contrib">
                        {lead.contributions.map((item) => (
                          <div key={item.division}>
                            <dt>{item.division}</dt>
                            <dd>{item.text}</dd>
                          </div>
                        ))}
                      </dl>
                      <h4 className="xp-meta">Areas of focus</h4>
                      <ul className="xh-profile-focus">
                        {lead.focus.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </ProfileDialog>
              </li>
            ))}
          </ul>
          <div className="xh-leads-foot">
            <TextLink href="/about">Meet the founders and the wider team</TextLink>
          </div>
        </div>
      </section>

      <ClosingPaths
        label="Where to start"
        title={
          <>
            Pick the door that <em>fits your question.</em>
          </>
        }
        lede="Every conversation starts with the people, the constraints and the outcome you need. The right division follows."
        paths={[
          {
            label: "For schools",
            title: "Bring an innovation lab to your school",
            text: "See TechM4Schools",
            href: "/schools",
          },
          {
            label: "For organisations",
            title: "Get software designed and built",
            text: "See TechM4Solutions",
            href: "/solutions",
          },
          {
            label: "For colleges and universities",
            title: "Build programmes into the degree",
            text: "See TechM4Institutes",
            href: "/institutes",
          },
          {
            label: "For students",
            title: "Find an internship or a role",
            text: "See the updates",
            href: "#opportunities",
          },
        ]}
      />

      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": "https://www.techm4india.com/#divisions",
          name: "TechM4India divisions",
          numberOfItems: ecosystem.length,
          itemListElement: ecosystem.map((division, index) => ({
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
