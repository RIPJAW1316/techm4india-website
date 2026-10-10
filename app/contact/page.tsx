/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */
import Link from "next/link";
import { ContactForm } from "../components/ContactForm";
import { PageHero, SectionHeading } from "../components/Shared";
import { StructuredData } from "../components/StructuredData";
import { contact, socialLinks } from "@/lib/site-data";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact & Partnerships | Let's Build India's Future Together",
  description:
    "Partner with TechM4India through institutional collaborations, CSR programs, research partnerships, startup collaborations, and student inquiries.",
  path: "/contact",
});

const partnershipTypes = [
  {
    title: "Institutional partnership",
    text: "Install labs, deploy programs and integrate innovation into the academic rhythm.",
  },
  {
    title: "Corporate / industry MoU",
    text: "Bring live briefs, mentorship and a stronger talent pipeline into the relationship.",
  },
  {
    title: "CSR collaboration",
    text: "Fund a lab or student pathway with clear, measurable outcomes.",
  },
  {
    title: "Research partnership",
    text: "Bring a hard problem and build the right student, lab and faculty team around it.",
  },
  {
    title: "Startup collaboration",
    text: "Test technology with real learners and grow through a connected institutional network.",
  },
  {
    title: "Company management ERP",
    text: "Discuss the V1 blueprint for CRM, institutions, programs, projects, finance, assets and CMS.",
  },
  {
    title: "Government / policy",
    text: "Discuss NEP implementation, digital skilling infrastructure and innovation hubs.",
  },
];

export default function ContactPage() {
  return (
    <main className="inner-page contact-page">
      <PageHero
        eyebrow="Open to all partnerships"
        title={
          <>
            Let&apos;s build India&apos;s <em>future together.</em>
          </>
        }
        description="Whether you are an institution leader, a CSR head, a startup founder, a researcher or a student with a question, we want to hear from you."
        image="/images/home/workshop-display.jpeg"
        imageAlt="Students learning with a mentor in an innovation classroom"
        ctaHref="#contact-form"
        ctaLabel="Jump to the form"
      />

      <section className="contact-section section shell" id="contact-form">
        <div className="contact-image image-frame" data-reveal>
          <img
            src="/images/home/mentor-students.jpeg"
            alt="Mentor and students collaborating in a workshop"
            loading="lazy"
          />
          <div>
            <span>Bring the ambition.</span>
            <span>Bring the context.</span>
          </div>
        </div>
        <div className="contact-form-panel" data-reveal>
          <p className="section-kicker">
            <span>01 / Send a message</span>
          </p>
          <h2>
            Start with the <em>question.</em>
          </h2>
          <p>
            Tell us what you are looking to achieve. The more context you give us, the better we can
            prepare.
          </p>
          <ContactForm />
        </div>
      </section>

      <section className="contact-details section shell">
        <div className="contact-detail-column" data-reveal>
          <p className="section-kicker">
            <span>02 / Find us</span>
          </p>
          <h2>
            Good work starts with a <em>conversation.</em>
          </h2>
          <div className="detail-block">
            <span>Headquarters</span>
            <p>
              TechM4India Innovations Private Limited
              <br />
              {contact.address}
            </p>
          </div>
          <div className="detail-block">
            <span>Email</span>
            <a href={contact.emailHref}>{contact.email}</a>
            <a href={contact.partnershipsHref}>{contact.partnerships}</a>
            <a href={contact.helloHref}>{contact.hello}</a>
            <a href={contact.ceoHref}>{contact.ceo}</a>
            <a href={contact.hrHref}>{contact.hr}</a>
            <a href={contact.supportHref}>{contact.support}</a>
          </div>
          <div className="detail-block">
            <span>Call</span>
            <a href={contact.generalPhoneHref}>{contact.generalPhone}</a>
            <a href={contact.hrPhoneHref}>
              {contact.hrPhone} <small>(HR)</small>
            </a>
          </div>
          <div className="detail-block">
            <span>Hours</span>
            <p>
              Monday – Saturday
              <br />
              9:00 AM – 7:00 PM IST
            </p>
          </div>
        </div>
        <div className="contact-side-note" data-reveal>
          <p className="section-kicker">
            <span>03 / A current invitation</span>
          </p>
          <h3>IGNITE AI — Student Registration 2026</h3>
          <p>2-day, 1-night immersive AI bootcamp for undergraduate and postgraduate students.</p>
          <strong>Registration fee: ₹4,099</strong>
          <a
            className="button button-primary"
            href="https://pages.razorpay.com/pl_TJ0yNF4mVuy1kI/view"
            target="_blank"
            rel="noreferrer"
          >
            Register via Razorpay <span aria-hidden="true">↗</span>
          </a>
          <p className="side-caption">
            Please verify availability and details on the registration page before enrolling.
          </p>
        </div>
      </section>

      <section className="opportunities-section section">
        <div className="shell">
          <SectionHeading
            eyebrow="04 / How we work together"
            title={
              <>
                The right partnership creates a <em>ripple.</em>
              </>
            }
            text="TechM4India builds long-term ecosystem partnerships, not one-off events."
          />
          <div className="opportunities-grid">
            {partnershipTypes.map((item, index) => (
              <article key={item.title} data-reveal>
                <span>0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <Link href="#contact-form">
                  Enquire now <i aria-hidden="true">↗</i>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="social-section section shell">
        <div data-reveal>
          <p className="section-kicker">
            <span>05 / Find us online</span>
          </p>
          <h2>
            Follow the TechM4India <em>journey.</em>
          </h2>
          <p>
            Lab builds, student wins, research breakthroughs and the behind-the-scenes of building
            India’s innovation infrastructure.
          </p>
        </div>
        <div className="social-list">
          {socialLinks.map((social, index) => (
            <a key={social.label} href={social.href} target="_blank" rel="noreferrer" data-reveal>
              <span>0{index + 1}</span>
              {social.label}
              <i aria-hidden="true">↗</i>
            </a>
          ))}
          <a href={contact.whatsapp} target="_blank" rel="noreferrer" data-reveal>
            <span>04</span>WhatsApp<i aria-hidden="true">↗</i>
          </a>
        </div>
      </section>

      <StructuredData
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Contact TechM4India",
            url: "https://www.techm4india.com/contact",
            telephone: contact.generalPhone,
            email: contact.email,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Hyderabad",
              addressRegion: "Telangana",
              addressCountry: "IN",
            },
          },
        ]}
      />
    </main>
  );
}
