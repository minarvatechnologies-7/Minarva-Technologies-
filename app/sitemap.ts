import type { MetadataRoute } from "next";

const serviceSlugs = [
  "computer-sales-service",
  "cctv-installation",
  "home-automation",
  "gate-automation",
  "solar-solutions",
  "inverter-solutions",
  "erp-software",
  "website-development",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.minarvatechnologies.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...serviceSlugs.map((slug) => ({ url: `${base}/services/${slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${base}/ai`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];
}
