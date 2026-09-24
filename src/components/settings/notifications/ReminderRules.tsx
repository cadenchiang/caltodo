"use client";

import { useState } from "react";
import useSWR from "swr";
import { BellRing, Trash2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import IconButton from "@/components/ui/IconButton";
import { describeRule, type NotificationRule } from "@/lib/notifications/types";
import SettingsSwitch from "./SettingsSwitch";
import NewRuleForm from "./NewRuleForm";

/** Endpoint the list and the writes share. */
const RULES_URL = "/api/notifications/rules";

/**
 * Fetches the rule list, surfacing the API's error message.
 *
 * @param url - Endpoint to read
 * @returns The rules
 * @throws Error carrying the API's message when the response is not ok
 */
async function fetchRules(url: string): Promise<NotificationRule[]> {
  const res = await fetch(url);
  const body = (await res.json().catch(() => ({}))) as { rules?: NotificationRule[]; error?: string };
  if (!res.ok) throw new Error(body.error || "Failed to load reminders");
  return body.rules ?? [];
}

/**
 * Reminder rules: the list from /api/notifications/rules with enable/disable
 * and delete per rule, plus the form that creates one.
 *
 * @remarks Rules are delivered by push (see /api/cron/push-reminders), so the
 *          section sits under the push toggle.
 */
export default function ReminderRules() {
  const { showToast } = useToast();
  const { data: rules, error, isLoading, mutate } = useSWR<NotificationRule[]>(RULES_URL, fetchRules);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  /** Flips one rule's enabled flag through PATCH. */
  async function toggle(rule: NotificationRule, enabled: boolean) {
    setBusyId(rule.id);
    try {
      const res = await fetch(`${RULES_URL}/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to update reminder");
      }
      await mutate((rules ?? []).map((r) => (r.id === rule.id ? { ...r, enabled } : r)), { revalidate: false });
    } catch (err) {
      console.error("ReminderRules: toggle failed", {
        ruleId: rule.id,
        error: err instanceof Error ? err.message : String(err),
        impact: "the rule keeps its previous state",
      });
      showToast(err instanceof Error ? err.message : "Failed to update reminder", { variant: "error" });
    } finally {
      setBusyId(null);
    }
  }

  /** Deletes one rule. */
  async function remove(rule: NotificationRule) {
    setBusyId(rule.id);
    try {
      const res = await fetch(`${RULES_URL}/${rule.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to delete reminder");
      }
      await mutate((rules ?? []).filter((r) => r.id !== rule.id), { revalidate: false });
      showToast("Reminder removed.");
    } catch (err) {
      console.error("ReminderRules: delete failed", {
        ruleId: rule.id,
        error: err instanceof Error ? err.message : String(err),
        impact: "the rule is still active",
      });
      showToast(err instanceof Error ? err.message : "Failed to delete reminder", { variant: "error" });
    } finally {
      setBusyId(null);
    }
  }

  /** Adds a created rule to the list and closes the form. */
  async function handleCreated(rule: NotificationRule) {
    await mutate([...(rules ?? []), rule], { revalidate: false });
    setAdding(false);
    showToast("Reminder added.");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground">Reminders</h3>
        {!adding && (
          <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
            Add reminder
          </Button>
        )}
      </div>

      {adding && <NewRuleForm endpoint={RULES_URL} onCreated={handleCreated} onCancel={() => setAdding(false)} />}

      {isLoading ? (
        <p className="text-xs text-muted-foreground py-2">Loading reminders...</p>
      ) : error ? (
        <EmptyState
          title="Reminders could not load"
          description={error instanceof Error ? error.message : "Try again in a moment."}
          action={
            <Button size="sm" variant="secondary" onClick={() => mutate()}>
              Try again
            </Button>
          }
          className="py-6"
        />
      ) : (rules ?? []).length === 0 ? (
        <EmptyState
          icon={<BellRing size={20} />}
          title="No reminders yet"
          description="Add one to get a push before each deadline or a daily summary."
          className="py-6"
        />
      ) : (
        <ul className="space-y-2">
          {(rules ?? []).map((rule) => (
            <li key={rule.id} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <SettingsSwitch
                  label={describeRule(rule)}
                  checked={rule.enabled}
                  onChange={(next) => toggle(rule, next)}
                  busy={busyId === rule.id}
                />
              </div>
              <IconButton
                aria-label={`Delete reminder: ${describeRule(rule)}`}
                onClick={() => remove(rule)}
                disabled={busyId !== null}
                className="hover:text-red-500"
              >
                <Trash2 size={16} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
