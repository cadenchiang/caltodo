import type { MetadataRoute } from "next";

/**
 * Generates sitemap.xml listing all public, indexable pages.
 *
 * Excludes /share (redirect-only, no content) and all authenticated
 * routes under /app/, /api/, and /auth/.
 *
 * @returns Array of sitemap entries with URL, lastModified, and priority.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://caltodo.me";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
