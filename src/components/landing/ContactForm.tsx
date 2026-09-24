"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import TextArea from "@/components/ui/TextArea";
import TextField from "@/components/ui/TextField";

/**
 * Contact form for the public /contact page. Collects name, email and a
 * message and posts them to /api/contact. Labels are visible (no gray,
 * all-caps text), and the outcome line is announced to assistive tech.
 */
export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
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
      console.error("[contact] submission failed", err);
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  }

  const sending = status === "sending";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <TextField
        label="Your name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Jane Smith"
        maxLength={100}
        disabled={sending}
        autoComplete="name"
      />
      <TextField
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="jane@berkeley.edu"
        maxLength={200}
        disabled={sending}
        autoComplete="email"
        hint="Optional, so we can reply."
      />
      <TextArea
        label="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="How can we help?"
        rows={4}
        maxLength={2000}
        disabled={sending}
        required
      />

      <div className="flex items-center justify-between gap-3 pt-1">
        <p
          role={status === "error" ? "alert" : "status"}
          aria-live="polite"
          className={status === "error" ? "text-xs text-red-600 dark:text-red-400" : "text-xs text-muted-foreground"}
        >
          {status === "sent" && "Thanks, we got it. We will be in touch soon."}
          {status === "error" && (errorMsg || "Something went wrong. Try again.")}
        </p>
        <Button type="submit" size="lg" className="min-h-11" loading={sending} disabled={!message.trim()}>
          {sending ? "Sending..." : "Send"}
        </Button>
      </div>
    </form>
  );
}
