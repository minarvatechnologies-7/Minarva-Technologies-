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
  const staticPages = [
    { url: base, priority: 1 },
    { url: `${base}/products`, priority: 0.8 },
    { url: `${base}/business`, priority: 0.8 },
    { url: `${base}/cctv-planner`, priority: 0.8 },
    { url: `${base}/ai`, priority: 0.7 },
    { url: `${base}/login`, priority: 0.3 },
  ];

  return [
    ...staticPages.map(({ url, priority }) => ({
      url,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority,
    })),
    ...serviceSlugs.map((slug) => ({
      url: `${base}/services/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
