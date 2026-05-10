import type { Metadata } from "next";
import ContactForm from "@/components/landing/ContactForm";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact - caltodo",
  description: "Get in touch with the caltodo team.",
  alternates: { canonical: "/contact" },
};

/**
 * Contact page — email link plus a simple message form.
 * Form posts to /api/contact (Resend email + DB log).
 * Nav is provided by the (landing) layout so this page only renders content.
 */
export default function ContactPage() {
  return (
    <main className="flex-1 px-6 lg:px-10">
      <div className="max-w-2xl mx-auto pt-12 sm:pt-16 pb-24">
        <h1
          className="text-3xl sm:text-4xl font-bold text-black mb-6 tracking-tight animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          Contact
        </h1>

        {/* Email pill */}
        <a
          href="mailto:cadenchiang@berkeley.edu"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f5f4] hover:bg-[#ecebe8] px-3 py-1.5 text-sm text-black transition-colors mb-6 animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          <span>Email</span>
          <span className="font-semibold underline">cadenchiang@berkeley.edu</span>
          <ArrowUpRight size={14} strokeWidth={2.2} />
        </a>

        <p
          className="text-sm sm:text-xl font-sans font-medium leading-snug text-black mb-10 animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          Email us or fill out the form and we&rsquo;ll get back to you.
        </p>

        {/* Contact form card */}
        <div
          className="rounded-2xl bg-white border border-black/10 px-6 sm:px-8 py-7 animate-fade-up"
          style={{ animationDelay: "280ms" }}
        >
          <h2 className="text-xl font-bold text-black mb-6">
            Get in touch
          </h2>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
