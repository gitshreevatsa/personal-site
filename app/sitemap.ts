import type { MetadataRoute } from "next";

const SITE = "https://shreyaspadmakiran.com";

const BLOG_SLUGS = [
  "room-protocol",
  "concurrency-control",
  "stateless-single-redis",
  "typed-context",
  "mcp-as-transport",
  "multi-tenant-one-redis",
  "vector-search",
  "oss-burnout-radar",
  "pacifica-nexus",
  "wallet-stack",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/resume`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/who`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = BLOG_SLUGS.map((slug) => ({
    url: `${SITE}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
