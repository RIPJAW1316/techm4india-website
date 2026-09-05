import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { Footer } from "./components/Footer";
import { MotionController } from "./components/MotionController";
import { SiteHeader } from "./components/SiteHeader";
import { StructuredData } from "./components/StructuredData";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.techm4india.com"),
  title: {
    default: "TechM4India | Innovation Across Engineering, Schools, Solutions & Space",
    template: "%s | TechM4India",
  },
  description:
    "Discover TechM4India, a leading innovation ecosystem spanning TechM4Engineering, TechM4Solutions, TechM4Schools, and TechM4Space.",
  keywords: [
    "TechM4India",
    "engineering innovation",
    "AI education",
    "space technology education",
    "school innovation labs",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "TechM4India",
    title: "TechM4India | Innovation Across Engineering, Schools, Solutions & Space",
    description:
      "Discover TechM4India, a leading innovation ecosystem spanning TechM4Engineering, TechM4Solutions, TechM4Schools, and TechM4Space.",
    url: "https://www.techm4india.com/",
    images: [{
      url: "/og.png",
      width: 1200,
      height: 630,
      alt: "TechM4India — engineering imagination into impact",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TechM4India | Innovation Across Engineering, Schools, Solutions & Space",
    description:
      "Discover TechM4India, a leading innovation ecosystem spanning TechM4Engineering, TechM4Solutions, TechM4Schools, and TechM4Space.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${newsreader.variable}`}>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <SiteHeader />
        <div id="main-content" tabIndex={-1}>{children}</div>
        <Footer />
        <MotionController />
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": "https://www.techm4india.com/#website",
                url: "https://www.techm4india.com/",
                name: "TechM4India",
                inLanguage: "en-IN",
              },
              {
                "@type": "Organization",
                "@id": "https://www.techm4india.com/#organization",
                name: "TechM4India",
                legalName: "TechM4India Innovations Private Limited",
                url: "https://www.techm4india.com/",
                logo: "https://www.techm4india.com/images/brand/logo.png",
                address: {
                  "@type": "PostalAddress",
                  addressCountry: "IN",
                  addressRegion: "Telangana",
                  addressLocality: "Hyderabad",
                },
                contactPoint: {
                  "@type": "ContactPoint",
                  contactType: "customer support",
                  telephone: "+916301814246",
                  email: "info@techm4india.com",
                  areaServed: "IN",
                },
                sameAs: [
                  "https://www.linkedin.com/company/techm4india",
                  "https://www.instagram.com/techm4india",
                  "https://www.facebook.com/TechM4India",
                  "https://wa.me/916301814246",
                ],
                subOrganization: [
                  { "@type": "Organization", name: "TechM4Engineering", url: "https://www.techm4india.com/engineering" },
                  { "@type": "Organization", name: "TechM4Solutions", url: "https://www.techm4india.com/solutions" },
                  { "@type": "Organization", name: "TechM4Schools", url: "https://www.techm4india.com/schools" },
                  { "@type": "Organization", name: "TechM4Space", url: "https://www.techm4india.com/space" },
                ],
              },
            ],
          }}
        />
      </body>
    </html>
  );
}
