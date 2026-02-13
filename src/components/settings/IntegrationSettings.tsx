"use client";

import { useState, useEffect } from "react";
import type { IntegrationCredentials } from "@/lib/types";
import CanvasSettings from "./CanvasSettings";
import GradescopeSettings from "./GradescopeSettings";

/**
 * Container for Canvas and Gradescope integration settings.
 * Fetches credentials once and passes to self-contained section components.
 * Each section manages its own Edit/Save/Cancel flow independently.
 */
export default function IntegrationSettings() {
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState<IntegrationCredentials | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchCredentials();
  }, []);

  /**
   * Fetches integration credentials from the API.
   * Called once on mount; individual sections handle their own saves.
   */
  async function fetchCredentials() {
    setLoading(true);
    try {
      const res = await fetch("/api/credentials");
      if (res.ok) {
        setCredentials(await res.json());
      } else {
        setFetchError("Failed to load credentials");
      }
    } catch {
      setFetchError("Failed to load credentials");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
        Loading settings...
      </div>
    );
  }

  if (fetchError || !credentials) {
    return (
      <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl">
        {fetchError || "Failed to load credentials"}
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-8">
      <CanvasSettings credentials={credentials} onUpdate={setCredentials} />
      <GradescopeSettings credentials={credentials} onUpdate={setCredentials} />
    </div>
  );
}
