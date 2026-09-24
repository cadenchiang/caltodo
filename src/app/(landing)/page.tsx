import { getCachedAssignmentCount, getCachedUserCount } from "@/lib/landing-counts";
import Hero from "@/components/landing/Hero";

/**
 * Render the marketing homepage statically and refresh at most hourly (ISR).
 *
 * Previously this route called `supabase.auth.getUser()` on every request,
 * which reads cookies and forced fully-dynamic rendering — an auth round-trip
 * on the TTFB of every landing visit. Authenticated users are already
 * redirected away from `/` by the proxy, and the Hero doesn't use the auth
 * state, so the page can be statically generated and edge-cached for an
 * instant first load.
 */
export const revalidate = 3600;

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
