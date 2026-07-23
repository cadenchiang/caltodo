import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - caltodo",
  description: "Privacy policy for caltodo, how we collect, use, and protect your data.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy - caltodo",
    description: "How caltodo collects, uses, and protects your data.",
    url: "https://caltodo.me/privacy",
  },
};

interface Section {
  title: string;
  body: React.ReactNode;
}

/**
 * Each section becomes its own fade-up block. Keeping the structure simple
 * so the animation cascade stays uniform across both legal pages.
 */
const SECTIONS: Section[] = [
  {
    title: "1. Introduction",
    body: (
      <>
        caltodo (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is a personal task
        management application. This Privacy Policy explains how we collect, use, and protect
        your information when you use our service at caltodo.me.
      </>
    ),
  },
  {
    title: "2. Information We Collect",
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
            (bCourses) or Gradescope, we access your course assignments to import them as tasks.
          </li>
          <li>
            <span className="font-semibold">Task data:</span> tasks, due dates, completion status,
            and other information you create within the app.
          </li>
        </ul>
        <p className="mt-3">
          All data is stored per-account using unique identifiers. Your tasks, completion history,
          and course data are never reviewed, analyzed, or accessed by caltodo staff for any
          reason other than technical support you explicitly request.
        </p>
      </>
    ),
  },
  {
    title: "3. How We Use Your Information",
    body: (
      <ul className="list-disc pl-6 space-y-1.5">
        <li>To provide and maintain the caltodo service.</li>
        <li>To sync your tasks with Google Calendar and course platforms.</li>
        <li>To authenticate your identity and manage your account.</li>
      </ul>
    ),
  },
  {
    title: "4. Data Storage and Security",
    body: (
      <>
        Your data is stored securely using Supabase, which provides encryption at rest and in
        transit. We do not sell, share, or distribute your personal data to third parties. Task
        data is isolated per account and cannot be cross-referenced between users. We employ
        row-level security policies so each user can only access their own data — no other user,
        and no caltodo administrator, can view your tasks or personal information through the
        application.
      </>
    ),
  },
  {
    title: "5. Google API Services",
    body: (
      <>
        caltodo&rsquo;s use and transfer of information received from Google APIs adheres to the{" "}
        <a
          href="https://developers.google.com/terms/api-services-user-data-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0e89d6] underline underline-offset-2 hover:text-[#3D8FE8]"
        >
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements. We only access Google Calendar data that you
        explicitly authorize, and we do not use this data for advertising or any purpose unrelated
        to providing the caltodo service.
      </>
    ),
  },
  {
    title: "6. Data Retention and Deletion",
    body: (
      <>
        We retain your data for as long as your account is active. You can request deletion of
        your account and all associated data at any time by contacting us. Upon deletion, all
        your personal data will be permanently removed from our systems.
      </>
    ),
  },
  {
    title: "7. Third-Party Services",
    body: (
      <>
        <p>We use the following third-party services:</p>
        <ul className="list-disc pl-6 space-y-1.5 mt-3">
          <li>
            <span className="font-semibold">Google OAuth:</span> for authentication and calendar access.
          </li>
          <li>
            <span className="font-semibold">Supabase:</span> for data storage and authentication.
          </li>
          <li>
            <span className="font-semibold">Vercel:</span> for hosting and analytics.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "8. Changes to This Policy",
    body: (
      <>
        We may update this Privacy Policy from time to time. We will notify users of any material
        changes by updating the &ldquo;Last updated&rdquo; date at the top of this page.
      </>
    ),
  },
  {
    title: "9. Contact",
    body: (
      <>
        If you have questions about this Privacy Policy or wish to request data deletion, contact
        us at{" "}
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
 * Privacy Policy page. Lives inside the (landing) route group so it inherits
 * the shared LandingNav and renders with the same fade-up choreography as
 * /about and /contact.
 */
export default function PrivacyPage() {
  return (
    <main className="flex-1 px-6 lg:px-10">
      <div className="max-w-2xl mx-auto pt-12 sm:pt-16 pb-24">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-black/50 hover:text-black mb-8 transition-colors animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Back
        </Link>
        <h1
          className="text-3xl sm:text-4xl font-bold text-black mb-2 tracking-tight animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          Privacy Policy
        </h1>
        <p
          className="text-xs sm:text-sm text-black/50 mb-10 animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          Last updated February 19, 2026
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
