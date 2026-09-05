export const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/engineering", label: "Engineering" },
  { href: "/solutions", label: "Solutions" },
  { href: "/schools", label: "Schools" },
  { href: "/space", label: "Space" },
  { href: "/contact", label: "Contact" },
];

export const divisions = [
  {
    number: "01",
    verb: "Engineer",
    name: "TechM4Engineering",
    shortName: "Engineering",
    href: "/engineering",
    image: "/images/engineering/hero.jpeg",
    description:
      "Hands-on engineering programs that connect academic foundations with industry tools, labs and real implementation.",
  },
  {
    number: "02",
    verb: "Solve",
    name: "TechM4Solutions",
    shortName: "Solutions",
    href: "/solutions",
    image: "/images/solutions/hero.jpeg",
    description:
      "AI, software and digital engineering solutions that move organizations from ambitious ideas to scalable systems.",
  },
  {
    number: "03",
    verb: "Explore",
    name: "TechM4Space",
    shortName: "Space",
    href: "/space",
    image: "/images/space/hero.webp",
    description:
      "Aerospace learning built around satellites, rockets, telemetry and the discipline of real space engineering.",
  },
  {
    number: "04",
    verb: "Innovate",
    name: "TechM4Schools",
    shortName: "Schools",
    href: "/schools",
    image: "/images/schools/hero.jpeg",
    description:
      "Future-ready school ecosystems where students code, build robots, explore AI and learn by making.",
  },
];

export const impactStats = [
  { value: "4", label: "Technology innovation verticals" },
  { value: "7", label: "Engineering disciplines" },
  { value: "6", label: "Aerospace lab formats" },
  { value: "5", label: "School innovation labs" },
];

export type Person = {
  name: string;
  role: string;
  image: string;
  bio: string;
};

export const people: Person[] = [
  {
    name: "Dr. K. Sudheer Reddy",
    role: "Dean — Academics & Planning",
    image: "/images/people/dr-sudheer-reddy.webp",
    bio: "Provides strategic direction so innovation becomes an integral part of education, connecting academic depth with practical application.",
  },
  {
    name: "Mahesh Mannuru",
    role: "Senior Technical Lead, TechM4Schools",
    image: "/images/people/mahesh-mannuru.webp",
    bio: "Brings expertise in embedded systems, cybersecurity, AUTOSAR integration and software development to hands-on learning experiences.",
  },
  {
    name: "Mettu Raja Reddy",
    role: "Senior Technical Lead, TechM4Schools",
    image: "/images/people/mettu-raja-reddy.webp",
    bio: "Builds innovation ecosystems informed by business analysis, product management and entrepreneurship.",
  },
  {
    name: "Elavala Bharath Reddy",
    role: "Senior Technical Lead, TechM4Schools",
    image: "/images/people/elavala-bharath-reddy.webp",
    bio: "Supports scalable educational platforms through Salesforce technologies and digital transformation expertise.",
  },
];

export const founders: Person[] = [
  {
    name: "Thanniru Rammurthy",
    role: "Founder & Chairman",
    image: "/images/founders/rammurthy.webp",
    bio: "Provides the founding vision and long-term direction for the TechM4India ecosystem.",
  },
  {
    name: "Thanniru Mahesh",
    role: "Founder, Managing CEO & Chief Marketing Manager",
    image: "/images/founders/mahesh.webp",
    bio: "Leads the organisation, its growth and the partnerships that carry the work forward.",
  },
  {
    name: "Pardhiv Sangyam",
    role: "HR Manager",
    image: "/images/founders/pardhiv.webp",
    bio: "Supports the people and team culture behind TechM4India's programmes and delivery.",
  },
  {
    name: "Thanneeru Pranay",
    role: "Co-Founder",
    image: "/images/founders/pranay.webp",
    bio: "Contributes to the ecosystem's development and institutional innovation work.",
  },
  {
    name: "Karthikeya Patel",
    role: "Co-Founder",
    image: "/images/founders/karthikeya.webp",
    bio: "Contributes to the ecosystem's development and institutional innovation work.",
  },
  {
    name: "Siripuram Varun",
    role: "Co-Founder",
    image: "/images/founders/varun.webp",
    bio: "Contributes to the ecosystem's development and institutional innovation work.",
  },
  {
    name: "Meghana",
    role: "Co-Founder",
    image: "/images/founders/meghana.webp",
    bio: "Contributes to the ecosystem's development and institutional innovation work.",
  },
];

export const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/techm4india" },
  { label: "Instagram", href: "https://www.instagram.com/techm4india" },
  { label: "Facebook", href: "https://www.facebook.com/TechM4India" },
];

export const contact = {
  generalPhone: "+91 63018 14246",
  generalPhoneHref: "tel:+916301814246",
  hrPhone: "+91 89853 68005",
  hrPhoneHref: "tel:+918985368005",
  email: "info@techm4india.com",
  emailHref: "mailto:info@techm4india.com",
  partnerships: "partnerships@techm4india.com",
  partnershipsHref: "mailto:partnerships@techm4india.com",
  hello: "hello@techm4india.com",
  helloHref: "mailto:hello@techm4india.com",
  ceo: "ceo@techm4india.com",
  ceoHref: "mailto:ceo@techm4india.com",
  hr: "hr@techm4india.com",
  hrHref: "mailto:hr@techm4india.com",
  support: "techm4india@gmail.com",
  supportHref: "mailto:techm4india@gmail.com",
  whatsapp: "https://wa.me/916301814246",
  address: "T-Hub, IIIT Hyderabad Campus, Gachibowli, Hyderabad — 500032, Telangana, India",
};
