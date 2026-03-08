import { createClient } from "@/lib/supabase/server";
import Hero from "@/components/landing/Hero";

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
      name: "CalTodo",
      url: "https://caltodo.me",
      logo: "https://caltodo.me/logo.png",
      description:
        "caltodo syncs your bcourses, gradescope, and pensieve assignments into one dashboard. free assignment management platform for berkeley students.",
    },
    {
      "@type": "WebSite",
      "@id": "https://caltodo.me/#website",
      url: "https://caltodo.me",
      name: "CalTodo",
      publisher: { "@id": "https://caltodo.me/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      name: "CalTodo",
      url: "https://caltodo.me",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "free assignment management platform for berkeley students. syncs bcourses, gradescope, and pensieve deadlines into one dashboard with google calendar integration.",
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero loggedIn={!!user} />
    </>
  );
}
