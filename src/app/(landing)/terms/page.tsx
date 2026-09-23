import type { Metadata } from "next";
import LegalPage, { LEGAL_LINK, type LegalSection } from "@/components/landing/LegalPage";

/** Shown under the heading; bump whenever the terms text changes. */
const TERMS_LAST_UPDATED = "September 23, 2026";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "Terms of service for caltodo, rules and guidelines for using the service.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of service | caltodo",
    description: "Rules and guidelines for using caltodo.",
    url: "https://caltodo.me/terms",
  },
};

/** Numbered sections, each its own fade-up block. */
const SECTIONS: LegalSection[] = [
  {
    title: "1. Acceptance of terms",
    body: (
      <>
        By accessing or using caltodo (&ldquo;the Service&rdquo;), you agree to be bound by these
        terms of service. If you do not agree, please do not use the Service.
      </>
    ),
  },
  {
    title: "2. Description of service",
    body: (
      <>
        caltodo is a personal task management application that helps you organize assignments and
        tasks. It integrates with Google Calendar, Canvas, Gradescope, Pensive, Brightspace,
        Blackboard, and Google Classroom (when available) to sync your academic deadlines and
        events, and can extract assignments from syllabus files you upload.
      </>
    ),
  },
  {
    title: "3. User accounts",
    body: (
      <ul className="list-disc pl-6 space-y-1.5">
        <li>You must sign in with a valid Google account to use the Service.</li>
        <li>You are responsible for maintaining the security of your account.</li>
        <li>You must provide accurate information when creating your account.</li>
      </ul>
    ),
  },
  {
    title: "4. Acceptable use",
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
    title: "6. Intellectual property",
    body: (
      <>
        The Service and its original content, features, and functionality are owned by caltodo and
        are protected by applicable intellectual property laws. Your task data and personal
        content remain yours.
      </>
    ),
  },
  {
    title: "7. Third-party integrations and services",
    body: (
      <>
        The Service integrates with third-party platforms including Google (Calendar and, when
        available, Classroom), Canvas, Gradescope, Pensive, Brightspace, and Blackboard. Your use
        of these integrations is subject to the respective third-party terms of service. Syllabus
        files you upload are processed by Anthropic&rsquo;s Claude API, and product analytics are
        collected through PostHog, as described in our privacy policy. We are not responsible for
        the availability or content of third-party services.
      </>
    ),
  },
  {
    title: "8. Disclaimer of warranties",
    body: (
      <>
        The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
        warranties of any kind, either express or implied. We do not guarantee that the Service
        will be uninterrupted, error-free, or secure.
      </>
    ),
  },
  {
    title: "9. Limitation of liability",
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
    title: "11. Changes to terms",
    body: (
      <>
        We reserve the right to modify these terms at any time. Changes will be effective upon
        posting to this page with an updated &ldquo;Last updated&rdquo; date. Continued use of
        the Service constitutes acceptance of the revised terms.
      </>
    ),
  },
  {
    title: "12. Contact",
    body: (
      <>
        If you have questions about these terms, contact us at{" "}
        <a href="mailto:cadenchiang@berkeley.edu" className={LEGAL_LINK}>
          cadenchiang@berkeley.edu
        </a>
        .
      </>
    ),
  },
];

/**
 * Terms of service page. Lives inside the (landing) route group so it
 * inherits the shared nav and footer.
 */
export default function TermsPage() {
  return <LegalPage title="Terms of service" lastUpdated={TERMS_LAST_UPDATED} sections={SECTIONS} />;
}
