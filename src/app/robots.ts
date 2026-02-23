import type { MetadataRoute } from "next";

/**
 * Generates robots.txt for search engine crawlers.
 *
 * Allows crawling of public marketing pages while blocking
 * authenticated app routes, API endpoints, and auth callbacks.
 *
 * @returns MetadataRoute.Robots configuration object.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/", "/api/", "/auth/"],
      },
    ],
    sitemap: "https://caltodo.me/sitemap.xml",
  };
}
