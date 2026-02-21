"use client";

import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Pencil, Play, Check, X } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import type { IntegrationCredentials, CredentialsSavePayload } from "@/lib/types";

interface CanvasSettingsProps {
  credentials: IntegrationCredentials;
  onUpdate: (updated: IntegrationCredentials) => void;
}

/**
 * Canvas (bCourses) credential settings with edit/cancel toggle.
 * Locked by default — shows masked token and URL as read-only.
 * Unlocked — same layout with editable inputs.
 * Course selection has been moved to the unified ClassesSection.
 *
 * @param credentials - Current integration credentials from parent
 * @param onUpdate - Callback with updated credentials after save
 */
export default function CanvasSettings({ credentials, onUpdate }: CanvasSettingsProps) {
  const { showToast } = useToast();
  const [locked, setLocked] = useState(true);
  const [saving, setSaving] = useState(false);

  const [canvasToken, setCanvasToken] = useState(credentials.canvas_token ?? "");
  const [canvasBaseUrl, setCanvasBaseUrl] = useState(credentials.canvas_base_url || "https://bcourses.berkeley.edu");
  const [showToken, setShowToken] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const serverState = useRef({
    canvasToken: credentials.canvas_token ?? "",
    canvasBaseUrl: credentials.canvas_base_url || "https://bcourses.berkeley.edu",
  });

  // Sync serverState and local form state when credentials prop changes (e.g. after API fetch)
  useEffect(() => {
    serverState.current = {
      canvasToken: credentials.canvas_token ?? "",
      canvasBaseUrl: credentials.canvas_base_url || "https://bcourses.berkeley.edu",
    };
    if (locked) {
      setCanvasToken(credentials.canvas_token ?? "");
      setCanvasBaseUrl(credentials.canvas_base_url || "https://bcourses.berkeley.edu");
    }
  }, [credentials.canvas_token, credentials.canvas_base_url, locked]);

  /**
   * Saves Canvas credentials (token + URL) to the API.
   * Does not handle course selection — that is managed by ClassesSection.
   */
  async function handleSave() {
    setSaving(true);
    const trimmedToken = canvasToken.trim();
    const payload: CredentialsSavePayload = {
      canvas_token: trimmedToken || null,
      canvas_base_url: canvasBaseUrl.trim(),
    };
    try {
      const res = await fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save");
      }
      const updated: IntegrationCredentials = await res.json();
      onUpdate(updated);
      serverState.current = {
        canvasToken: updated.canvas_token ?? "",
        canvasBaseUrl: updated.canvas_base_url,
      };
      setCanvasToken(updated.canvas_token ?? "");
      showToast("bCourses settings saved.");
      setLocked(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  /** Reverts form to server state and re-locks the section. */
  function handleCancel() {
    setCanvasToken(serverState.current.canvasToken);
    setCanvasBaseUrl(serverState.current.canvasBaseUrl);
    setShowToken(false);
    setLocked(true);
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-foreground">bCourses</h2>
        <button
          onClick={() => {
            if (locked) {
              setLocked(false);
              setShowToken(false);
            } else {
              handleCancel();
            }
          }}
          className="flex items-center gap-1.5 text-xs text-subtle-foreground hover:text-secondary-foreground transition-colors"
          aria-label={locked ? "Edit credentials" : "Cancel editing"}
        >
          {locked ? <><Pencil size={12} /> edit</> : <><X size={12} /> cancel</>}
        </button>
      </div>
      <p className="text-xs text-subtle-foreground mb-4">
        Generate a token from{" "}
        <span className="font-medium text-muted-foreground">
          bCourses &gt; Account &gt; Settings &gt; New Access Token
        </span>
        .
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
              watch how to generate a token
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
                src="/bcourses-instructions.mp4"
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
        {/* Token row */}
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors ${
            locked ? "bg-muted border-border" : "bg-card border-input-border"
          }`}
        >
          {locked ? (
            <span className="text-sm text-muted-foreground truncate flex-1">
              {canvasToken ? `••••••••${canvasToken.slice(-6)}` : "No token saved"}
            </span>
          ) : (
            <input
              id="canvas-token"
              type={showToken ? "text" : "password"}
              value={canvasToken}
              onChange={(e) => setCanvasToken(e.target.value)}
              placeholder="Paste your bCourses access token"
              className="flex-1 bg-transparent text-sm text-foreground focus:outline-none min-w-0"
            />
          )}
          {!locked && (
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="text-subtle-foreground hover:text-secondary-foreground transition-colors shrink-0"
              aria-label={showToken ? "Hide token" : "Show token"}
            >
              {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
          {locked && canvasToken && <Check size={14} className="text-emerald-500 shrink-0" />}
        </div>

        {/* URL row */}
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors ${
            locked ? "bg-muted border-border" : "bg-card border-input-border"
          }`}
        >
          {locked ? (
            <span className="text-sm text-muted-foreground truncate flex-1">{canvasBaseUrl}</span>
          ) : (
            <input
              id="canvas-url"
              type="text"
              value={canvasBaseUrl}
              onChange={(e) => setCanvasBaseUrl(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground focus:outline-none min-w-0"
            />
          )}
          {locked && <Check size={14} className="text-emerald-500 shrink-0" />}
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
