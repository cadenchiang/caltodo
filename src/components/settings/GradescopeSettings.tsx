"use client";

import { useState, useRef } from "react";
import { Eye, EyeOff, Lock, LockOpen, Play, Check } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import type { IntegrationCredentials, CredentialsSavePayload } from "@/lib/types";

interface GradescopeSettingsProps {
  credentials: IntegrationCredentials;
  onUpdate: (updated: IntegrationCredentials) => void;
}

/**
 * Gradescope credential settings with lock/unlock icon toggle.
 * Locked by default — shows email and masked password with Lock icons.
 * Unlocked — same layout with editable inputs and LockOpen icons.
 * Course selection has been moved to the unified ClassesSection.
 *
 * @param credentials - Current integration credentials from parent
 * @param onUpdate - Callback with updated credentials after save
 */
export default function GradescopeSettings({ credentials, onUpdate }: GradescopeSettingsProps) {
  const { showToast } = useToast();
  const [locked, setLocked] = useState(true);
  const [saving, setSaving] = useState(false);

  const [gradescopeEmail, setGradescopeEmail] = useState(credentials.gradescope_email ?? "");
  const [gradescopePassword, setGradescopePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const serverState = useRef({
    gradescopeEmail: credentials.gradescope_email ?? "",
  });

  /**
   * Saves Gradescope credentials (email + optional password) to the API.
   * Does not handle course selection — that is managed by ClassesSection.
   */
  async function handleSave() {
    setSaving(true);
    const payload: CredentialsSavePayload = {
      gradescope_email: gradescopeEmail || null,
    };
    if (gradescopePassword) {
      payload.gradescope_password = gradescopePassword;
    }
    try {
      const res = await fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      const updated: IntegrationCredentials = await res.json();
      onUpdate(updated);
      serverState.current.gradescopeEmail = updated.gradescope_email ?? "";
      setGradescopeEmail(updated.gradescope_email ?? "");
      setGradescopePassword("");
      showToast("Gradescope settings saved.");
      setLocked(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  /** Reverts form to server state and re-locks the section. */
  function handleCancel() {
    setGradescopeEmail(serverState.current.gradescopeEmail);
    setGradescopePassword("");
    setShowPassword(false);
    setLocked(true);
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-foreground">Gradescope</h2>
        <button
          onClick={() => {
            if (locked) {
              setLocked(false);
              setShowPassword(false);
            } else {
              handleCancel();
            }
          }}
          className="flex items-center gap-1.5 text-xs text-subtle-foreground hover:text-secondary-foreground transition-colors"
          aria-label={locked ? "Unlock credentials" : "Lock credentials"}
        >
          {locked ? <Lock size={12} /> : <LockOpen size={12} />}
        </button>
      </div>
      <p className="text-xs text-subtle-foreground mb-4">
        If you use CalNet SSO, you&apos;ll need to create a Gradescope-specific password first.
        Go to{" "}
        <a
          href="https://www.gradescope.com/reset_password"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline"
        >
          Reset Password
        </a>{" "}
        and enter your Berkeley email — this won&apos;t affect your CalNet login.
      </p>

      {/* Video tutorial with smooth expand/collapse */}
      <div className="mb-4">
        <div
          className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-500"
          style={{
            gridTemplateRows: videoExpanded ? "0fr" : "1fr",
            opacity: videoExpanded ? 0 : 1,
            transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)",
          }}
        >
          <div className="min-h-0 overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setVideoExpanded(true);
                setTimeout(() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play().catch(() => {});
                  }
                }, 400);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 active:scale-[0.98] transition-all duration-150"
            >
              <Play size={14} />
              watch how to sign in
            </button>
          </div>
        </div>

        <div
          className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-500"
          style={{
            gridTemplateRows: videoExpanded ? "1fr" : "0fr",
            opacity: videoExpanded ? 1 : 0,
            transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)",
          }}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="rounded-xl overflow-hidden shadow-lg mb-3">
              <video
                ref={videoRef}
                src="/gradescope-instructions.mp4"
                loop
                muted
                playsInline
                controls
                className="w-full"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setVideoExpanded(false);
                videoRef.current?.pause();
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              hide video
            </button>
          </div>
        </div>
      </div>

      {/* Credential fields — unified layout for locked/unlocked */}
      <div className="space-y-3">
        {/* Email row */}
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors ${
            locked ? "bg-muted border-border" : "bg-card border-input-border"
          }`}
        >
          {locked ? (
            <Lock size={14} className="text-subtle-foreground shrink-0" />
          ) : (
            <LockOpen size={14} className="text-subtle-foreground shrink-0" />
          )}
          {locked ? (
            <span className="text-sm text-muted-foreground truncate flex-1">
              {gradescopeEmail || "No email saved"}
            </span>
          ) : (
            <input
              id="gs-email"
              type="email"
              value={gradescopeEmail}
              onChange={(e) => setGradescopeEmail(e.target.value)}
              placeholder="your-email@berkeley.edu"
              className="flex-1 bg-transparent text-sm text-foreground focus:outline-none min-w-0"
            />
          )}
          {locked && gradescopeEmail && <Check size={14} className="text-emerald-500 shrink-0" />}
        </div>

        {/* Password row */}
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors ${
            locked ? "bg-muted border-border" : "bg-card border-input-border"
          }`}
        >
          {locked ? (
            <Lock size={14} className="text-subtle-foreground shrink-0" />
          ) : (
            <LockOpen size={14} className="text-subtle-foreground shrink-0" />
          )}
          {locked ? (
            <span className="text-sm text-muted-foreground flex-1">
              {credentials.has_gradescope_password ? "••••••••••••" : "No password saved"}
            </span>
          ) : (
            <input
              id="gs-password"
              type={showPassword ? "text" : "password"}
              value={gradescopePassword}
              onChange={(e) => setGradescopePassword(e.target.value)}
              placeholder={
                credentials.has_gradescope_password
                  ? "Leave blank to keep existing"
                  : "Enter your Gradescope password"
              }
              className="flex-1 bg-transparent text-sm text-foreground focus:outline-none min-w-0"
            />
          )}
          {!locked && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-subtle-foreground hover:text-secondary-foreground transition-colors shrink-0"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
          {locked && credentials.has_gradescope_password && (
            <Check size={14} className="text-emerald-500 shrink-0" />
          )}
        </div>

        {/* Save / Cancel — only when unlocked */}
        {!locked && (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60 transition-all"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
