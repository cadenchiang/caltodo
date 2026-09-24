"use client";

import { useId, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { useCredentials } from "@/components/settings/IntegrationSettings";
import type { IntegrationCredentials } from "@/lib/types";
import { FIELD_INPUT, FIELD_LABEL } from "@/components/ui/field-recipe";
import { HOURS, formatHour, localHourToUtc, utcHourToLocal } from "@/lib/notifications/digest-hour";
import SettingsSwitch from "./SettingsSwitch";

/**
 * The daily email digest: on/off and the local hour it arrives. Both write
 * the email_digest_* columns through PUT /api/credentials.
 *
 * @remarks The hour is stored in UTC; the select shows local hours and
 *          converts using the device's current offset.
 */
export default function EmailDigestSettings() {
  const { showToast } = useToast();
  const { credentials, handleUpdate } = useCredentials();
  const hourId = useId();
  const [saving, setSaving] = useState<"enabled" | "hour" | null>(null);

  const offset = new Date().getTimezoneOffset();
  const localHour = utcHourToLocal(credentials.email_digest_hour, offset);

  /**
   * Writes one or both digest columns.
   *
   * @param patch - Fields to persist
   * @param field - Which control is saving, for its spinner
   */
  async function save(patch: Partial<Pick<IntegrationCredentials, "email_digest_enabled" | "email_digest_hour">>, field: "enabled" | "hour") {
    setSaving(field);
    try {
      const res = await fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Save failed: ${res.status}`);
      }
      handleUpdate((await res.json()) as IntegrationCredentials);
    } catch (err) {
      console.error("EmailDigestSettings: save failed", {
        patch,
        error: err instanceof Error ? err.message : String(err),
        impact: "the digest setting is unchanged",
      });
      showToast(err instanceof Error ? err.message : "Failed to save email digest", { variant: "error" });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-3">
      <SettingsSwitch
        label="Daily email digest"
        description={`A summary of what is due, sent every day at ${formatHour(localHour)}.`}
        checked={credentials.email_digest_enabled}
        onChange={(next) => save({ email_digest_enabled: next }, "enabled")}
        busy={saving === "enabled"}
      />
      {credentials.email_digest_enabled && (
        <div className="px-4">
          <label htmlFor={hourId} className={FIELD_LABEL}>
            Send at
          </label>
          <select
            id={hourId}
            value={localHour}
            disabled={saving !== null}
            onChange={(e) => save({ email_digest_hour: localHourToUtc(Number(e.target.value), offset) }, "hour")}
            className={`${FIELD_INPUT} max-w-[10rem]`}
          >
            {HOURS.map((hour) => (
              <option key={hour} value={hour}>
                {formatHour(hour)}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">Your local time.</p>
        </div>
      )}
    </div>
  );
}
