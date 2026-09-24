"use client";

/**
 * Dialog for creating an MCP API key: what to call it, what it may do, and how
 * long it lasts.
 *
 * Split out of McpSettings so that card stays under the file-length limit, and
 * so the access choice has room to explain itself in a line each rather than in
 * a paragraph above the list. Built on Modal for the dialog role, focus trap,
 * Escape and backdrop click.
 */

import { useRef, useState } from "react";
import type { McpScope } from "@/lib/mcp/scopes";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import TextField from "@/components/ui/TextField";
import { cn } from "@/lib/utils";

/** Key lifetime choices. `null` means the key never expires. */
const EXPIRY_CHOICES: Array<{ label: string; days: number | null }> = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "1 year", days: 365 },
  { label: "Never", days: null },
];

/**
 * The two access levels, and the one line that explains the chosen one.
 *
 * Worded as what the assistant can do, not as which tools it may call: the
 * person picking has no reason to know the tool list.
 */
const SCOPE_CHOICES: Array<{ scope: McpScope; label: string; detail: string }> = [
  {
    scope: "full",
    label: "Full access",
    detail: "Read your work, add and edit assignments, sync, and manage your calendar.",
  },
  {
    scope: "read",
    label: "Read only",
    detail: "Look at your assignments, classes and calendar. Never changes anything.",
  },
];

/** Lifetime the dialog opens on: long enough to be useful, short enough to lapse. */
const DEFAULT_DAYS = 90;

/** Chip recipe shared by the access and expiry choices. */
const CHIP = "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border";
const CHIP_ACTIVE = "bg-blue-500 text-white border-blue-500";
const CHIP_IDLE = "border-border text-muted-foreground hover:text-foreground hover:bg-muted";

/**
 * Modal for creating a key.
 *
 * @param open - Whether the dialog is shown
 * @param creating - True while the request is in flight, disabling the button
 * @param onCancel - Dismisses without creating
 * @param onCreate - Creates the key with the chosen name, lifetime and access
 * @remarks State is local and deliberately not reset on close: reopening after
 *          an accidental dismissal keeps what was typed.
 */
export default function McpKeyDialog({
  open,
  creating,
  onCancel,
  onCreate,
}: {
  open: boolean;
  creating: boolean;
  onCancel: () => void;
  onCreate: (label: string, days: number | null, scope: McpScope) => void;
}) {
  // Starts empty rather than pre-filled: a name typed over a default is more
  // likely to be the real one. Left blank, the server falls back to "Poke",
  // which the placeholder shows.
  const [label, setLabel] = useState("");
  const [days, setDays] = useState<number | null>(DEFAULT_DAYS);
  const [scope, setScope] = useState<McpScope>("full");
  const nameRef = useRef<HTMLInputElement>(null);

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="New API key"
      size="sm"
      initialFocusRef={nameRef}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={() => onCreate(label, days, scope)} loading={creating}>
            Create key
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextField
          ref={nameRef}
          label="Name"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={60}
          placeholder="Poke"
        />

        <div>
          <p className="block text-xs font-medium text-foreground mb-1.5">Access</p>
          <div role="radiogroup" aria-label="Access level" className="flex flex-wrap gap-1.5">
            {SCOPE_CHOICES.map((choice) => {
              const active = scope === choice.scope;
              return (
                <button
                  key={choice.scope}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setScope(choice.scope)}
                  className={cn(CHIP, active ? CHIP_ACTIVE : CHIP_IDLE)}
                >
                  {choice.label}
                </button>
              );
            })}
          </div>
          <p className="text-2xs text-muted-foreground mt-1.5">
            {SCOPE_CHOICES.find((c) => c.scope === scope)?.detail}
          </p>
        </div>

        <div>
          <p className="block text-xs font-medium text-foreground mb-1.5">Expires</p>
          <div role="radiogroup" aria-label="Key lifetime" className="flex flex-wrap gap-1.5">
            {EXPIRY_CHOICES.map((choice) => {
              const active = days === choice.days;
              return (
                <button
                  key={choice.label}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDays(choice.days)}
                  className={cn(CHIP, active ? CHIP_ACTIVE : CHIP_IDLE)}
                >
                  {choice.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
