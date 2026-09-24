import type { Metadata } from "next";
import LegalPage, { LEGAL_LINK, type LegalSection } from "@/components/landing/LegalPage";

/** Shown under the heading; bump whenever the policy text changes. */
const PRIVACY_LAST_UPDATED = "September 23, 2026";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Privacy policy for caltodo: how we collect, use, and protect your data.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy policy | caltodo",
    description: "How caltodo collects, uses, and protects your data.",
    url: "https://caltodo.me/privacy",
  },
};

/** Numbered sections, each its own fade-up block. */
const SECTIONS: LegalSection[] = [
  {
    title: "1. Introduction",
    body: (
      <>
        caltodo (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is a personal task
        management application. This privacy policy explains how we collect, use, and protect
        your information when you use our service at caltodo.me.
      </>
    ),
  },
  {
    title: "2. Information we collect",
    body: (
      <>
        <p>We collect the following information when you use caltodo:</p>
        <ul className="list-disc pl-6 space-y-1.5 mt-3">
          <li>
            <span className="font-semibold">Account information:</span> your name and email
            address from your Google account when you sign in.
          </li>
          <li>
            <span className="font-semibold">Google Calendar data:</span> if you choose to connect
            Google Calendar, we access your calendar events to sync them with your tasks. We only
            read and write to calendars you explicitly select.
          </li>
          <li>
            <span className="font-semibold">Course platform data:</span> if you connect Canvas
            (called bCourses at Berkeley), Gradescope, Pensive, Brightspace, Blackboard, or Google
            Classroom (when available), we access your course list and assignments to import them
            as tasks. For Canvas, Pensive, Brightspace and Blackboard this is the calendar feed
            URL or API token you provide; for Gradescope it is the email and password you provide,
            which we store encrypted.
          </li>
          <li>
            <span className="font-semibold">Syllabus files:</span> if you upload a syllabus (PDF or
            image), we send the file to Anthropic&rsquo;s Claude API to extract assignments and
            due dates. The file is used only for that extraction.
          </li>
          <li>
            <span className="font-semibold">Task data:</span> tasks, due dates, completion status,
            and other information you create within the app.
          </li>
          <li>
            <span className="font-semibold">Usage data:</span> we use PostHog for product
            analytics, including autocapture of page views and clicks, so we can see which
            features are used and where the app breaks.
          </li>
        </ul>
        <p className="mt-3">
          All data is stored per account using unique identifiers. Your tasks, completion history,
          and course data are never reviewed, analyzed, or accessed by caltodo staff for any
          reason other than technical support you explicitly request.
        </p>
      </>
    ),
  },
  {
    title: "3. How we use your information",
    body: (
      <ul className="list-disc pl-6 space-y-1.5">
        <li>To provide and maintain the caltodo service.</li>
        <li>To sync your tasks with Google Calendar and your course platforms.</li>
        <li>To extract assignments from syllabus files you upload.</li>
        <li>To authenticate your identity and manage your account.</li>
        <li>To understand how the product is used and fix problems, through analytics.</li>
      </ul>
    ),
  },
  {
    title: "4. Data storage and security",
    body: (
      <>
        Your data is stored securely using Supabase, which provides encryption at rest and in
        transit. Gradescope passwords and Google Calendar tokens are encrypted before they are
        stored. We do not sell your personal data. Task data is isolated per account and cannot
        be cross-referenced between users. We employ row-level security policies so each user can
        only access their own data: no other user, and no caltodo administrator, can view your
        tasks or personal information through the application.
      </>
    ),
  },
  {
    title: "5. Google API services",
    body: (
      <>
        caltodo&rsquo;s use and transfer of information received from Google APIs adheres to the{" "}
        <a
          href="https://developers.google.com/terms/api-services-user-data-policy"
          target="_blank"
          rel="noopener noreferrer"
          className={LEGAL_LINK}
        >
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements. We only access Google Calendar and Google
        Classroom data that you explicitly authorize, and we do not use this data for advertising
        or any purpose unrelated to providing the caltodo service.
      </>
    ),
  },
  {
    title: "6. Data retention and deletion",
    body: (
      <>
        We retain your data for as long as your account is active. You can request deletion of
        your account and all associated data at any time by contacting us. Upon deletion, all
        your personal data will be permanently removed from our systems.
      </>
    ),
  },
  {
    title: "7. Third-party services",
    body: (
      <>
        <p>We use the following third-party services to run caltodo:</p>
        <ul className="list-disc pl-6 space-y-1.5 mt-3">
          <li>
            <span className="font-semibold">Google:</span> sign-in (OAuth), Google Calendar, and
            Google Classroom when available.
          </li>
          <li>
            <span className="font-semibold">Supabase:</span> data storage and authentication.
          </li>
          <li>
            <span className="font-semibold">Vercel:</span> hosting and web analytics.
          </li>
          <li>
            <span className="font-semibold">PostHog:</span> product analytics, including
            autocapture of page views and clicks.
          </li>
          <li>
            <span className="font-semibold">Anthropic:</span> the Claude API that reads syllabus
            files you upload to extract assignments.
          </li>
          <li>
            <span className="font-semibold">Canvas, Gradescope, Pensive, Brightspace, and
            Blackboard:</span> the course platforms we fetch your assignments from, using the
            credentials or feed URLs you provide.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "8. Changes to this policy",
    body: (
      <>
        We may update this privacy policy from time to time. We will notify users of any material
        changes by updating the &ldquo;Last updated&rdquo; date at the top of this page.
      </>
    ),
  },
  {
    title: "9. Contact",
    body: (
      <>
        If you have questions about this privacy policy or wish to request data deletion, contact
        us at{" "}
        <a href="mailto:cadenchiang@berkeley.edu" className={LEGAL_LINK}>
          cadenchiang@berkeley.edu
        </a>
        .
      </>
    ),
  },
];

/**
 * Privacy policy page. Lives inside the (landing) route group so it inherits
 * the shared nav and footer.
 */
export default function PrivacyPage() {
  return <LegalPage title="Privacy policy" lastUpdated={PRIVACY_LAST_UPDATED} sections={SECTIONS} />;
}
