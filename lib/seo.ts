import type { Metadata } from "next";

export const siteUrl = "https://www.techm4india.com";

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const canonical = new URL(path, siteUrl).toString();

  return {
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: canonical,
      siteName: "TechM4India",
      title,
      description,
      images: [{
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "TechM4India — engineering imagination into impact",
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, siteUrl).toString(),
    })),
  };
}
