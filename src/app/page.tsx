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
