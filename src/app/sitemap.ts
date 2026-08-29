import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/seo/guides";
import { SCHOOLS } from "@/lib/seo/schools";

const BASE_URL = "https://caltodo.me";

/**
 * Generates sitemap.xml listing all public, indexable pages.
 *
 * Static marketing pages are declared inline; guide and school pages are read
 * from their registries so a new entry in either list is advertised here
 * automatically and cannot drift out of sync with the routes.
 *
 * Excludes /share (redirect-only, no content) and all authenticated
 * routes under /app/, /api/, and /auth/.
 *
 * @returns Array of sitemap entries with URL, lastModified, and priority.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/login`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/guides`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];

  const guidePages: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: `${BASE_URL}/guides/${g.slug}`,
    lastModified: new Date(g.updated),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const schoolPages: MetadataRoute.Sitemap = SCHOOLS.map((s) => ({
    url: `${BASE_URL}/for/${s.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticPages, ...guidePages, ...schoolPages];
}
