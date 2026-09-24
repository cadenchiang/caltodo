"use client";

import { useId, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import Button from "@/components/ui/Button";
import { FIELD_INPUT, FIELD_LABEL } from "@/components/ui/field-recipe";
import {
  BEFORE_DEADLINE_PRESETS,
  type CreateRuleInput,
  type NotificationKind,
  type NotificationRule,
} from "@/lib/notifications/types";

/** Default preset when the form opens. */
const DEFAULT_MINUTES = 60;

/** Default digest time when the form opens. */
const DEFAULT_TIME = "08:00";

/**
 * Builds the POST body for a new rule.
 *
 * @param kind - Rule type
 * @param minutes - Minutes before the deadline (before_deadline only)
 * @param timeOfDay - HH:MM local time (daily_digest only)
 * @param timezone - IANA timezone the time is read in
 * @returns The request body the rules route validates
 */
export function buildRuleInput(
  kind: NotificationKind,
  minutes: number,
  timeOfDay: string,
  timezone: string
): CreateRuleInput {
  return kind === "before_deadline"
    ? { kind, minutes_before: minutes, timezone }
    : { kind, time_of_day: timeOfDay, timezone };
}

interface NewRuleFormProps {
  /** POST endpoint. */
  endpoint: string;
  /** Receives the created rule. */
  onCreated: (rule: NotificationRule) => void | Promise<void>;
  /** Closes the form without creating. */
  onCancel: () => void;
}

/**
 * Inline form that creates one reminder rule: a push before each deadline,
 * or a daily summary at a time of day.
 *
 * @param endpoint - Where the rule is POSTed
 * @param onCreated - Called with the server's rule row
 * @param onCancel - Dismisses the form
 */
export default function NewRuleForm({ endpoint, onCreated, onCancel }: NewRuleFormProps) {
  const { showToast } = useToast();
  const kindId = useId();
  const valueId = useId();
  const [kind, setKind] = useState<NotificationKind>("before_deadline");
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
  const [timeOfDay, setTimeOfDay] = useState(DEFAULT_TIME);
  const [creating, setCreating] = useState(false);

  /** POSTs the rule. */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const input = buildRuleInput(kind, minutes, timeOfDay, timezone);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = (await res.json().catch(() => ({}))) as { rule?: NotificationRule; error?: string };
      if (!res.ok || !body.rule) throw new Error(body.error || "Failed to add reminder");
      await onCreated(body.rule);
    } catch (err) {
      console.error("NewRuleForm: create failed", {
        input,
        error: err instanceof Error ? err.message : String(err),
        impact: "no rule was created",
      });
      showToast(err instanceof Error ? err.message : "Failed to add reminder", { variant: "error" });
    } finally {
      setCreating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div>
        <label htmlFor={kindId} className={FIELD_LABEL}>
          Remind me
        </label>
        <select
          id={kindId}
          value={kind}
          onChange={(e) => setKind(e.target.value as NotificationKind)}
          className={FIELD_INPUT}
        >
          <option value="before_deadline">Before each deadline</option>
          <option value="daily_digest">With a daily summary</option>
        </select>
      </div>

      {kind === "before_deadline" ? (
        <div>
          <label htmlFor={valueId} className={FIELD_LABEL}>
            How long before
          </label>
          <select
            id={valueId}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className={FIELD_INPUT}
          >
            {BEFORE_DEADLINE_PRESETS.map((preset) => (
              <option key={preset.minutes} value={preset.minutes}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label htmlFor={valueId} className={FIELD_LABEL}>
            Time of day
          </label>
          <input
            id={valueId}
            type="time"
            value={timeOfDay}
            required
            onChange={(e) => setTimeOfDay(e.target.value)}
            className={`${FIELD_INPUT} max-w-[10rem]`}
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={creating}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={creating}>
          Add reminder
        </Button>
      </div>
    </form>
  );
}
