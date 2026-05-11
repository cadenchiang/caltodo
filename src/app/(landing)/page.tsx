import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Hero from "@/components/landing/Hero";

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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userCount = await getCachedUserCount();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero loggedIn={!!user} initialUserCount={userCount} />
    </>
  );
}
