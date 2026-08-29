/**
 * Shared types for the /guides content collection.
 *
 * Guides are plain data rather than MDX so they can be unit tested, rendered
 * by a single template, and enumerated by sitemap.ts without a build step.
 */

/** One titled section within a guide. */
export interface GuideSection {
  /** Section heading, rendered as an <h2>. */
  heading: string;
  /** Prose paragraphs for the section. */
  body: string[];
  /** Optional ordered steps rendered as an <ol> beneath the prose. */
  steps?: string[];
}

/** A published guide page at /guides/{slug}. */
export interface Guide {
  /** URL slug, unique across the collection. */
  slug: string;
  /** Page <title> and <h1>; also the search result title. */
  title: string;
  /** Meta description, kept under 160 characters for full SERP display. */
  description: string;
  /** ISO date (YYYY-MM-DD) the content was last reviewed. */
  updated: string;
  /** Lead paragraph shown above the first section. */
  intro: string;
  /** Body sections in reading order. */
  sections: GuideSection[];
}
