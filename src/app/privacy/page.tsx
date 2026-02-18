import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - caltodo",
  description: "Privacy policy for caltodo",
};

/**
 * Privacy Policy page for caltodo.
 * Required for Google OAuth verification.
 */
export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-black">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="caltodo" className="h-6" />
          <span className="text-lg font-bold tracking-tight text-black">caltodo</span>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: February 18, 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">1. Introduction</h2>
            <p>
              caltodo (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is a personal task management
              application. This Privacy Policy explains how we collect, use, and protect your
              information when you use our service at caltodo.me.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect the following information when you use caltodo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account information:</strong> Your name and email address from your Google
                account when you sign in.
              </li>
              <li>
                <strong>Google Calendar data:</strong> If you choose to connect Google Calendar, we
                access your calendar events to sync them with your tasks. We only read and write to
                calendars you explicitly select.
              </li>
              <li>
                <strong>Course platform data:</strong> If you connect Canvas (bCourses) or
                Gradescope, we access your course assignments to import them as tasks.
              </li>
              <li>
                <strong>Task data:</strong> Tasks, due dates, completion status, and other
                information you create within the app.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain the caltodo service.</li>
              <li>To sync your tasks with Google Calendar and course platforms.</li>
              <li>To authenticate your identity and manage your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using Supabase, which provides encryption at rest and in
              transit. We do not sell, share, or distribute your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">5. Google API Services</h2>
            <p>
              caltodo&apos;s use and transfer of information received from Google APIs adheres to
              the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements. We only access Google Calendar data that you
              explicitly authorize, and we do not use this data for advertising or any purpose
              unrelated to providing the caltodo service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">6. Data Retention and Deletion</h2>
            <p>
              We retain your data for as long as your account is active. You can request deletion of
              your account and all associated data at any time by contacting us. Upon deletion, all
              your personal data will be permanently removed from our systems.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">7. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google OAuth:</strong> For authentication and calendar access.</li>
              <li><strong>Supabase:</strong> For data storage and authentication.</li>
              <li><strong>Vercel:</strong> For hosting and analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify users of any
              material changes by updating the &quot;Last updated&quot; date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">9. Contact</h2>
            <p>
              If you have questions about this Privacy Policy or wish to request data deletion,
              please contact us at{" "}
              <a href="mailto:cadenchiang@berkeley.edu" className="text-blue-600 underline">
                cadenchiang@berkeley.edu
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
