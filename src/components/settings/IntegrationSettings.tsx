"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Pencil } from "lucide-react";
import type { IntegrationCredentials, CredentialsSavePayload } from "@/lib/types";

/**
 * Settings form for Canvas and Gradescope integration credentials.
 * Credentials are locked once saved — user must click "Edit" to unlock.
 * This prevents accidental overwrites or clears.
 *
 * Canvas token is masked by default with show/hide toggle.
 * Gradescope password is never returned from the API — only a saved status flag.
 */
export default function IntegrationSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [canvasToken, setCanvasToken] = useState("");
  const [canvasBaseUrl, setCanvasBaseUrl] = useState("https://bcourses.berkeley.edu");
  const [gradescopeEmail, setGradescopeEmail] = useState("");
  const [gradescopePassword, setGradescopePassword] = useState("");
  const [hasGradescopePassword, setHasGradescopePassword] = useState(false);
  const [selectedCanvasCourses, setSelectedCanvasCourses] = useState<Array<{ id: number; name: string }> | null>(null);
  const [selectedGradescopeCourses, setSelectedGradescopeCourses] = useState<Array<{ id: string; name: string }> | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Lock state — both locked by default, user clicks Edit to unlock
  const [canvasLocked, setCanvasLocked] = useState(true);
  const [gradescopeLocked, setGradescopeLocked] = useState(true);

  useEffect(() => {
    fetchCredentials();
  }, []);

  /**
   * Fetches credentials from the API and locks fields that have values.
   */
  async function fetchCredentials() {
    setLoading(true);
    try {
      const res = await fetch("/api/credentials");
      if (res.ok) {
        const data: IntegrationCredentials = await res.json();
        setCanvasToken(data.canvas_token ?? "");
        setCanvasBaseUrl(data.canvas_base_url);
        setGradescopeEmail(data.gradescope_email ?? "");
        setHasGradescopePassword(data.has_gradescope_password);
        setSelectedCanvasCourses(data.selected_canvas_courses ?? null);
        setSelectedGradescopeCourses(data.selected_gradescope_courses ?? null);
      }
    } catch {
      setError("Failed to load credentials");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Saves credentials via PUT /api/credentials.
   * Only sends fields from unlocked sections to avoid clearing locked values.
   */
  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload: CredentialsSavePayload = {};

    // Only include Canvas fields if Canvas section is unlocked
    if (!canvasLocked) {
      payload.canvas_token = canvasToken || null;
      payload.canvas_base_url = canvasBaseUrl;
    }

    // Only include Gradescope fields if Gradescope section is unlocked
    if (!gradescopeLocked) {
      payload.gradescope_email = gradescopeEmail || null;
      if (gradescopePassword) {
        payload.gradescope_password = gradescopePassword;
      }
    }

    // Nothing to save if both are locked
    if (canvasLocked && gradescopeLocked) {
      setError("Unlock a section first to make changes.");
      setSaving(false);
      return;
    }

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
      setCanvasToken(updated.canvas_token ?? "");
      setGradescopeEmail(updated.gradescope_email ?? "");
      setHasGradescopePassword(updated.has_gradescope_password);
      setGradescopePassword("");
      setSelectedCanvasCourses(updated.selected_canvas_courses ?? null);
      setSelectedGradescopeCourses(updated.selected_gradescope_courses ?? null);
      setSuccess("Credentials saved successfully.");

      // Re-lock both sections after successful save
      setCanvasLocked(true);
      setGradescopeLocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save credentials");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-8">
      {/* Canvas Section */}
      <section>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-800">bCourses (Canvas)</h2>
          {canvasLocked && (
            <button
              onClick={() => { setCanvasLocked(false); setShowToken(false); }}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Pencil size={12} />
              Edit
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Generate a token from{" "}
          <span className="font-medium text-gray-500">
            bCourses &gt; Account &gt; Settings &gt; New Access Token
          </span>
          . Give it a name like &quot;toodoo&quot; and leave the expiry blank.
        </p>

        {canvasLocked ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
              <Lock size={14} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500 truncate">
                {canvasToken ? `••••••••${canvasToken.slice(-6)}` : "No token saved"}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
              <Lock size={14} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500 truncate">{canvasBaseUrl}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label htmlFor="canvas-token" className="block text-sm font-medium text-gray-600 mb-1">
                Access Token
              </label>
              <div className="relative">
                <input
                  id="canvas-token"
                  type={showToken ? "text" : "password"}
                  value={canvasToken}
                  onChange={(e) => setCanvasToken(e.target.value)}
                  placeholder="Paste your Canvas access token"
                  className="w-full px-3 py-2 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showToken ? "Hide token" : "Show token"}
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="canvas-url" className="block text-sm font-medium text-gray-600 mb-1">
                Canvas URL
              </label>
              <input
                id="canvas-url"
                type="text"
                value={canvasBaseUrl}
                onChange={(e) => setCanvasBaseUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              />
            </div>
          </div>
        )}

        {selectedCanvasCourses && selectedCanvasCourses.length > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-medium text-gray-500 mb-1">Syncing courses:</p>
            <p className="text-sm text-gray-700">
              {selectedCanvasCourses.map((c) => c.name).join(", ")}
            </p>
          </div>
        )}
      </section>

      {/* Gradescope Section */}
      <section>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-800">Gradescope</h2>
          {gradescopeLocked && (
            <button
              onClick={() => { setGradescopeLocked(false); setShowPassword(false); }}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Pencil size={12} />
              Edit
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Enter your Gradescope email and password. CalNet SSO users must set a Gradescope-specific
          password via &quot;Forgot Password&quot; on gradescope.com first.
        </p>

        {gradescopeLocked ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
              <Lock size={14} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500 truncate">
                {gradescopeEmail || "No email saved"}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
              <Lock size={14} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500">
                {hasGradescopePassword ? "Password saved" : "No password saved"}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label htmlFor="gs-email" className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                id="gs-email"
                type="email"
                value={gradescopeEmail}
                onChange={(e) => setGradescopeEmail(e.target.value)}
                placeholder="your-email@berkeley.edu"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              />
            </div>
            <div>
              <label htmlFor="gs-password" className="block text-sm font-medium text-gray-600 mb-1">
                Password
                {hasGradescopePassword && (
                  <span className="ml-2 text-xs text-emerald-500 font-normal">(saved)</span>
                )}
              </label>
              <div className="relative">
                <input
                  id="gs-password"
                  type={showPassword ? "text" : "password"}
                  value={gradescopePassword}
                  onChange={(e) => setGradescopePassword(e.target.value)}
                  placeholder={
                    hasGradescopePassword
                      ? "Leave blank to keep existing password"
                      : "Enter your Gradescope password"
                  }
                  className="w-full px-3 py-2 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedGradescopeCourses && selectedGradescopeCourses.length > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-medium text-gray-500 mb-1">Syncing courses:</p>
            <p className="text-sm text-gray-700">
              {selectedGradescopeCourses.map((c) => c.name).join(", ")}
            </p>
          </div>
        )}
      </section>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl">{error}</div>
      )}
      {success && (
        <div className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-xl">{success}</div>
      )}

      {/* Save Button — only shown when at least one section is unlocked */}
      {(!canvasLocked || !gradescopeLocked) && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {saving ? "Saving..." : "Save Credentials"}
        </button>
      )}
    </div>
  );
}
