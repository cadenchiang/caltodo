import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - caltodo",
  description: "Terms of service for caltodo, rules and guidelines for using the service.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service - caltodo",
    description: "Rules and guidelines for using caltodo.",
    url: "https://caltodo.me/terms",
  },
};

interface Section {
  title: string;
  body: React.ReactNode;
}

/**
 * Each section becomes its own fade-up block to match the Privacy / About
 * cascading entrance animation.
 */
const SECTIONS: Section[] = [
  {
    title: "1. Acceptance of Terms",
    body: (
      <>
        By accessing or using caltodo (&ldquo;the Service&rdquo;), you agree to be bound by these
        Terms of Service. If you do not agree, please do not use the Service.
      </>
    ),
  },
  {
    title: "2. Description of Service",
    body: (
      <>
        caltodo is a personal task management application that helps you organize assignments and
        tasks. It integrates with Google Calendar, Canvas, and Gradescope to sync your academic
        deadlines and events.
      </>
    ),
  },
  {
    title: "3. User Accounts",
    body: (
      <ul className="list-disc pl-6 space-y-1.5">
        <li>You must sign in with a valid Google account to use the Service.</li>
        <li>You are responsible for maintaining the security of your account.</li>
        <li>You must provide accurate information when creating your account.</li>
      </ul>
    ),
  },
  {
    title: "4. Acceptable Use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1.5 mt-3">
          <li>Use the Service for any unlawful purpose.</li>
          <li>Attempt to gain unauthorized access to the Service or its systems.</li>
          <li>Interfere with or disrupt the Service or its infrastructure.</li>
          <li>Use the Service to transmit malicious code or content.</li>
        </ul>
      </>
    ),
  },
  {
    title: "5. Pricing",
    body: (
      <>
        caltodo is free for students, forever. Every feature is available at no cost, with no
        subscription, trial, or payment required. If this ever changes, we will give you prior
        notice on this page.
      </>
    ),
  },
  {
    title: "6. Intellectual Property",
    body: (
      <>
        The Service and its original content, features, and functionality are owned by caltodo and
        are protected by applicable intellectual property laws. Your task data and personal
        content remain yours.
      </>
    ),
  },
  {
    title: "7. Third-Party Integrations",
    body: (
      <>
        The Service integrates with third-party platforms including Google, Canvas, and Gradescope.
        Your use of these integrations is subject to the respective third-party terms
        of service. We are not responsible for the availability or content of third-party services.
      </>
    ),
  },
  {
    title: "8. Disclaimer of Warranties",
    body: (
      <>
        The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
        warranties of any kind, either express or implied. We do not guarantee that the Service
        will be uninterrupted, error-free, or secure.
      </>
    ),
  },
  {
    title: "9. Limitation of Liability",
    body: (
      <>
        To the fullest extent permitted by law, caltodo shall not be liable for any indirect,
        incidental, special, or consequential damages arising from your use of the Service,
        including but not limited to missed deadlines, lost data, or inability to access the
        Service.
      </>
    ),
  },
  {
    title: "10. Termination",
    body: (
      <>
        We may suspend or terminate your access to the Service at any time, with or without
        cause. You may stop using the Service at any time. Upon termination, your right to use
        the Service ceases immediately.
      </>
    ),
  },
  {
    title: "11. Changes to Terms",
    body: (
      <>
        We reserve the right to modify these Terms at any time. Changes will be effective upon
        posting to this page with an updated &ldquo;Last updated&rdquo; date. Continued use of
        the Service constitutes acceptance of the revised Terms.
      </>
    ),
  },
  {
    title: "12. Contact",
    body: (
      <>
        If you have questions about these Terms, contact us at{" "}
        <a
          href="mailto:cadenchiang@berkeley.edu"
          className="text-[#0e89d6] underline underline-offset-2 hover:text-[#3D8FE8]"
        >
          cadenchiang@berkeley.edu
        </a>
        .
      </>
    ),
  },
];

/**
 * Terms of Service page. Lives inside the (landing) route group so it
 * inherits the shared LandingNav and renders with the same fade-up
 * choreography as the rest of the marketing site.
 */
export default function TermsPage() {
  return (
    <main className="flex-1 px-6 lg:px-10">
      <div className="max-w-2xl mx-auto pt-12 sm:pt-16 pb-24">
        <h1
          className="text-3xl sm:text-4xl font-bold text-black mb-2 tracking-tight animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          Terms of Service
        </h1>
        <p
          className="text-xs sm:text-sm text-black/50 mb-10 animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          Last updated May 10, 2026
        </p>

        <div className="space-y-7 text-sm sm:text-base text-black/80 leading-relaxed">
          {SECTIONS.map((section, i) => (
            <section
              key={section.title}
              className="animate-fade-up"
              style={{ animationDelay: `${160 + i * 80}ms` }}
            >
              <h2 className="text-base sm:text-lg font-bold text-black mb-2 tracking-tight">
                {section.title}
              </h2>
              <div>{section.body}</div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
