import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import Hero from "@/components/landing/Hero";

/**
 * Render the marketing homepage statically and refresh at most hourly (ISR).
 *
 * Previously this route called `supabase.auth.getUser()` on every request,
 * which reads cookies and forced fully-dynamic rendering — an auth round-trip
 * on the TTFB of every landing visit. Authenticated users are already
 * redirected away from `/` by middleware, and the Hero doesn't use the auth
 * state, so the page can be statically generated and edge-cached for an
 * instant first load.
 */
export const revalidate = 3600;

/**
 * Cached total user count for the "Trusted by N+" badge.
 *
 * The Supabase admin listUsers() call is a server-to-server HTTP round-trip
 * that previously ran on every landing-page request, blocking SSR and adding
 * 200-500ms of latency. Caching it for one hour cuts that to a single hit
 * per region per hour. Returns 0 on failure — the Hero hides the count when
 * it's 0, so the page still renders cleanly if Supabase is down.
 */
const getCachedUserCount = unstable_cache(
  async (): Promise<number> => {
    try {
      const admin = createAdminClient();
      const { data } = await admin.auth.admin.listUsers({ perPage: 1, page: 1 });
      return (data as { total?: number; users: unknown[] }).total ?? data.users.length;
    } catch {
      return 0;
    }
  },
  ["landing-user-count"],
  { revalidate: 3600, tags: ["landing-user-count"] },
);

/**
 * JSON-LD structured data for the homepage.
 * Includes Organization and WebSite schemas to help search engines
 * understand the site identity and improve rich result eligibility.
 */
/**
 * Total assignments caltodo has synced, cached for an hour.
 *
 * A head count says nothing about what the product does; the number of
 * deadlines it has pulled in does. Counted with head+exact so no rows travel.
 * Returns 0 on failure, and the Hero falls back to the product name.
 */
const getCachedAssignmentCount = unstable_cache(
  async (): Promise<number> => {
    try {
      const admin = createAdminClient();
      const { count } = await admin
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .not("source", "is", null)
        .is("dismissed_at", null);
      return count ?? 0;
    } catch {
      return 0;
    }
  },
  ["landing-assignment-count"],
  { revalidate: 3600, tags: ["landing-assignment-count"] },
);

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://caltodo.me/#organization",
      name: "caltodo",
      url: "https://caltodo.me",
      logo: "https://caltodo.me/logo.png",
      description:
        "sync your classes, upload your syllabus, and manage every deadline in one place. free for students.",
    },
    {
      "@type": "WebSite",
      "@id": "https://caltodo.me/#website",
      url: "https://caltodo.me",
      name: "caltodo",
      publisher: { "@id": "https://caltodo.me/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      name: "caltodo",
      url: "https://caltodo.me",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "sync your classes, upload your syllabus, and manage every deadline in one place. free for students.",
    },
  ],
};

/**
 * Root page that shows Hero landing for unauthenticated users
 * and redirects authenticated users to /app/inbox.
 */
export default async function HomePage() {
  const [userCount, assignmentCount] = await Promise.all([
    getCachedUserCount(),
    getCachedAssignmentCount(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero initialUserCount={userCount} initialAssignmentCount={assignmentCount} />
    </>
  );
}
