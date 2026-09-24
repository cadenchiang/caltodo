"use client";

import { useState } from "react";

/**
 * Simple contact form for the public /contact page.
 * Collects name, email, and message; posts to /api/contact.
 */
export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending" || !message.trim()) return;
    setStatus("sending");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Anonymous",
          email: email.trim() || null,
          message: message.trim(),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Submission failed");
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="block">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Smith"
          maxLength={100}
          disabled={status === "sending"}
          className="mt-1.5 w-full rounded-xl bg-[#f6f5f4] px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0e89d6]/30 disabled:opacity-50"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@berkeley.edu"
          maxLength={200}
          disabled={status === "sending"}
          className="mt-1.5 w-full rounded-xl bg-[#f6f5f4] px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0e89d6]/30 disabled:opacity-50"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help?"
          rows={4}
          maxLength={2000}
          disabled={status === "sending"}
          required
          className="mt-1.5 w-full rounded-xl bg-[#f6f5f4] px-4 py-3 text-sm text-black placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#0e89d6]/30 disabled:opacity-50"
        />
      </label>

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-xs text-gray-500">
          {status === "sent" && "Thanks — we got it. We'll be in touch soon."}
          {status === "error" && (errorMsg || "Something went wrong. Try again.")}
        </p>
        <button
          type="submit"
          disabled={status === "sending" || !message.trim()}
          className="px-5 py-2.5 rounded-lg bg-[#0e89d6] text-white text-sm font-medium hover:bg-[#3D8FE8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "sending" ? "Sending..." : "Submit"}
        </button>
      </div>
    </form>
  );
}
