"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import GoogleCalendarSettings from "@/components/settings/GoogleCalendarSettings";
import IntegrationSettings, { useCredentials } from "@/components/settings/IntegrationSettings";
import SyllabusSettings from "@/components/settings/SyllabusSettings";
import IntegrationHealthBanner from "@/components/settings/IntegrationHealthBanner";
import McpSettings from "@/components/settings/McpSettings";
import GoogleClassroomSettings from "@/components/settings/GoogleClassroomSettings";

/**
 * Inline Google Calendar logo SVG for the add-integration dropdown.
 */
function GCalDropdownIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 122.88 122.88" className="shrink-0">
      <polygon points="93.78,29.1 29.1,29.1 29.1,93.78 93.78,93.78" fill="#fff" />
      <polygon points="93.78,122.88 122.88,93.78 93.78,93.78" fill="#EA4335" />
      <polygon points="122.88,29.1 93.78,29.1 93.78,93.78 122.88,93.78" fill="#FBBC04" />
      <polygon points="93.78,93.78 29.1,93.78 29.1,122.88 93.78,122.88" fill="#34A853" />
      <path d="M0,93.78v19.4c0,5.36,4.34,9.7,9.7,9.7h19.4v-29.1H0z" fill="#188038" />
      <path d="M122.88,29.1V9.7c0-5.36-4.34-9.7-9.7-9.7h-19.4v29.1H122.88z" fill="#1967D2" />
      <path d="M93.78,0H9.7C4.34,0,0,4.34,0,9.7v84.08h29.1V29.1h64.67V0z" fill="#4285F4" />
      <path d="M42.37,79.27c-2.42-1.63-4.09-4.02-5-7.17l5.61-2.31c0.51,1.94,1.4,3.44,2.67,4.51c1.26,1.07,2.8,1.59,4.59,1.59c1.84,0,3.41-0.56,4.73-1.67c1.32-1.12,1.98-2.54,1.98-4.26c0-1.76-0.7-3.2-2.09-4.32c-1.39-1.12-3.14-1.67-5.22-1.67H46.4v-5.55h2.91c1.79,0,3.31-0.48,4.54-1.46c1.23-0.97,1.84-2.3,1.84-3.99c0-1.5-0.55-2.7-1.65-3.6s-2.49-1.35-4.18-1.35c-1.65,0-2.96,0.44-3.93,1.32c-0.97,0.88-1.7,2-2.12,3.24l-5.55-2.31c0.74-2.09,2.09-3.93,4.07-5.52c1.98-1.59,4.51-2.39,7.58-2.39c2.27,0,4.32,0.44,6.13,1.32c1.81,0.88,3.23,2.1,4.26,3.65c1.03,1.56,1.54,3.31,1.54,5.25c0,1.98-0.48,3.65-1.43,5.03c-0.95,1.37-2.13,2.43-3.52,3.16v0.33c1.79,0.74,3.36,1.96,4.51,3.52c1.17,1.58,1.76,3.46,1.76,5.66c0,2.2-0.56,4.16-1.67,5.88c-1.12,1.72-2.66,3.08-4.62,4.07c-1.96,0.99-4.17,1.49-6.62,1.49C47.41,81.72,44.79,80.91,42.37,79.27z" fill="#1A73E8" />
      <path d="M76.83,51.43l-6.16,4.45l-3.08-4.67l11.05-7.97h4.24v37.6h-6.05V51.43z" fill="#1A73E8" />
    </svg>
  );
}

/** Platform options shown in the "Add integration" dropdown. Always visible. */
const ADD_OPTIONS: Array<{
  id: string;
  label: string;
  description: string;
  logo: React.ReactNode;
  route: string;
}> = [
  {
    id: "gcal",
    label: "Google Calendar",
    description: "Sync tasks to Google Calendar",
    logo: <GCalDropdownIcon size={15} />,
    route: "/api/gcal/auth",
  },
  {
    id: "canvas",
    label: "bCourses",
    description: "UC Berkeley Canvas LMS",
    logo: <img src="/bcourses-logo.png" alt="" className="w-4 h-4" />,
    route: "/app/onboarding?setup=canvas",
  },
  {
    id: "canvas-add",
    label: "Canvas",
    description: "Sync all your Canvas assignments",
    logo: <img src="/canvas-logo.png" alt="" className="w-5 h-5 object-contain" />,
    route: "/app/onboarding?setup=canvas-add",
  },
  {
    id: "gradescope",
    label: "Gradescope",
    description: "Sync deadlines from Gradescope",
    logo: <img src="/gradescope-logo.png" alt="" className="w-4 h-4" />,
    route: "/app/onboarding?setup=gradescope",
  },
  {
    id: "pensieve",
    label: "Pensive",
    description: "Sync CS/DS assignments",
    logo: <img src="/pensieve-logo.png" alt="" className="w-4 h-4" />,
    route: "/app/onboarding?setup=pensieve",
  },
  {
    id: "brightspace",
    label: "Brightspace",
    description: "Assignments from your D2L calendar",
    logo: <span className="w-4 h-4 rounded-sm bg-white flex items-center justify-center overflow-hidden"><img src="/brightspace-logo.svg" alt="" className="w-full h-full object-contain" /></span>,
    route: "/app/onboarding?setup=brightspace",
  },
  {
    id: "classroom",
    label: "Google Classroom",
    description: "Coursework and due dates",
    logo: <img src="/classroom-logo.png" alt="" className="w-4 h-4 object-contain" />,
    route: "/app/onboarding?setup=classroom",
  },
  {
    id: "syllabus",
    label: "Syllabus",
    description: "Import assignments from a syllabus",
    logo: <FileText size={15} className="text-purple-500" />,
    route: "/app/onboarding?setup=syllabus",
  },
];

/**
 * Integrations settings section.
 * Renders Google Calendar, Canvas, Gradescope, and Pensieve cards.
 * Header includes a "+" button that opens a dropdown to add any integration.
 * Must be rendered inside an IntegrationProvider.
 */
export default function IntegrationsSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Close on any click outside the container
  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  return (
    <section>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-foreground">Integrations</h2>
        <div className="relative" ref={containerRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            aria-label="Add integration"
          >
            <Plus size={18} />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-xl shadow-lg z-50 p-1 origin-top-right overflow-hidden animate-popover-in">
              {ADD_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setOpen(false);
                    if (opt.id === "gcal") {
                      window.location.href = opt.route;
                    } else {
                      router.push(opt.route);
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left hover:bg-accent transition-colors cursor-pointer rounded-lg"
                >
                  <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                    {opt.logo}
                  </div>
                  <p className="text-[13px] font-medium text-foreground">{opt.label}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-subtle-foreground mb-4">
        Connect your accounts to sync assignments and events.
      </p>
      <IntegrationHealthBanner />
      <div className="space-y-3">
        <GoogleCalendarSettings />
        <IntegrationSettings />
        <SyllabusSettings />
        <GoogleClassroomSettings />
      </div>
      <div className="mt-8 pt-6 border-t border-border">
        <McpSettings />
      </div>
      <RequestPlatformForm />
    </section>
  );
}

/**
 * Trigger button + popup modal letting users request a platform their
 * school uses that caltodo doesn't yet integrate with.
 * Submits via /api/contact prefixed with [Platform request] so it can be filtered.
 */
function RequestPlatformForm() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="mt-6 pt-5 border-t border-border">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-dashed border-border bg-card hover:bg-accent hover:border-foreground/30 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0 text-left">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Plus size={16} className="text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Request a platform
              </p>
              <p className="text-xs text-subtle-foreground truncate">
                Don&apos;t see one your school offers? Tell us.
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-[#0e89d6] shrink-0">Submit</span>
        </button>
      </div>
      <RequestPlatformModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** Duration the exit animation runs (matches .animate-announce-card-out in globals.css). */
const CLOSE_ANIM_MS = 220;

/**
 * Centered popup modal with the platform-request form. Matches the Contact Us
 * modal's size + open/close animation for visual consistency.
 * Closes on Escape, on backdrop click, and after a successful submission.
 * Submits to /api/contact with a "[Platform request]" prefix so it emails via
 * Resend with a dedicated subject.
 */
function RequestPlatformModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [closing, setClosing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /** Play the exit animation, then call the parent's onClose. */
  const requestClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, CLOSE_ANIM_MS);
  }, [closing, onClose]);

  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
    if (!open) {
      setMessage("");
      setStatus("idle");
      setClosing(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") requestClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, requestClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Platform request",
          email: null,
          message: `[Platform request] ${message.trim()}`,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("sent");
      setTimeout(requestClose, 800);
    } catch {
      setStatus("error");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${closing ? "animate-announce-backdrop-out" : "animate-announce-backdrop-in"}`}
        onClick={requestClose}
      />
      <div
        className={`relative w-full w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-6 ${closing ? "animate-announce-card-out" : "animate-announce-card-in"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-foreground mb-1">
          Don&apos;t see a platform your school offers?
        </h3>
        <p className="text-xs text-subtle-foreground mb-4">
          Tell us which one and we&apos;ll add it.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Schoology, Brightspace, Moodle..."
            rows={4}
            maxLength={2000}
            disabled={status === "sending"}
            className="w-full rounded-xl border border-input-border bg-transparent px-3.5 py-3 text-sm text-foreground placeholder:text-subtle-foreground resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-50"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-subtle-foreground">
              {status === "sent" && "Thanks, we got it."}
              {status === "error" && "Something went wrong. Try again."}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={requestClose}
                className="px-4 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!message.trim() || status === "sending"}
                className="px-4 py-1.5 rounded-lg bg-[#0e89d6] text-white text-sm font-medium hover:bg-[#3D8FE8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "sending" ? "Sending..." : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
