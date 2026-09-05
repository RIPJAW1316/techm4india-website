import type { MetadataRoute } from "next";

const siteUrl = "https://www.techm4india.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl + "/", priority: 1, changeFrequency: "monthly" },
    { url: siteUrl + "/about", priority: 0.8, changeFrequency: "monthly" },
    { url: siteUrl + "/engineering", priority: 0.9, changeFrequency: "monthly" },
    { url: siteUrl + "/solutions", priority: 0.9, changeFrequency: "monthly" },
    { url: siteUrl + "/solutions/erp", priority: 0.85, changeFrequency: "monthly" },
    { url: siteUrl + "/schools", priority: 0.9, changeFrequency: "monthly" },
    { url: siteUrl + "/space", priority: 0.9, changeFrequency: "monthly" },
    { url: siteUrl + "/contact", priority: 0.8, changeFrequency: "monthly" },
  ];
}
