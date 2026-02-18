import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - caltodo",
  description: "Terms of service for caltodo",
};

/**
 * Terms of Service page for caltodo.
 * Required for Google OAuth verification.
 */
export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-black">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="caltodo" className="h-6" />
          <span className="text-lg font-bold tracking-tight text-black">caltodo</span>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: February 18, 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using caltodo (&quot;the Service&quot;), you agree to be bound by
              these Terms of Service. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">2. Description of Service</h2>
            <p>
              caltodo is a personal task management application that helps you organize assignments
              and tasks. It integrates with Google Calendar, Canvas (bCourses), and Gradescope to
              sync your academic deadlines and events.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must sign in with a valid Google account to use the Service.</li>
              <li>You are responsible for maintaining the security of your account.</li>
              <li>You must provide accurate information when creating your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any unlawful purpose.</li>
              <li>Attempt to gain unauthorized access to the Service or its systems.</li>
              <li>Interfere with or disrupt the Service or its infrastructure.</li>
              <li>Use the Service to transmit malicious code or content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">5. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by caltodo
              and are protected by applicable intellectual property laws. Your task data and personal
              content remain yours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">6. Third-Party Integrations</h2>
            <p>
              The Service integrates with third-party platforms including Google, Canvas, and
              Gradescope. Your use of these integrations is also subject to the respective
              third-party terms of service. We are not responsible for the availability or content
              of third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">7. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without
              warranties of any kind, either express or implied. We do not guarantee that the
              Service will be uninterrupted, error-free, or secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, caltodo shall not be liable for any indirect,
              incidental, special, or consequential damages arising from your use of the Service,
              including but not limited to missed deadlines, lost data, or inability to access the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">9. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service at any time, with or without
              cause. You may stop using the Service at any time. Upon termination, your right to use
              the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be effective upon
              posting to this page with an updated &quot;Last updated&quot; date. Continued use of
              the Service constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">11. Contact</h2>
            <p>
              If you have questions about these Terms, please contact us at{" "}
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
