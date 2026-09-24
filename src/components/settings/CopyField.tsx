"use client";

/**
 * Read-only value fields with a copy affordance, as used by the settings cards.
 *
 * Split out of McpSettings so that card stays under the file-length limit.
 * Nothing here is MCP-specific, so any settings panel showing a URL, id or
 * token can use it.
 */

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

/** How long the button shows a tick before reverting, in ms. */
const COPIED_FEEDBACK_MS = 2000;

/**
 * A copy button that swaps to a check briefly after copying.
 *
 * @param value - Text written to the clipboard
 * @param label - What is being copied, used in the toast and the aria label
 * @param compact - Renders as a bare icon rather than an icon-and-word button
 * @returns The button
 * @remarks A clipboard write can be refused (no permission, insecure origin),
 *          so the failure is surfaced as a toast rather than swallowed.
 */
export function CopyButton({
  value,
  label,
  compact = false,
}: {
  value: string;
  label: string;
  compact?: boolean;
}) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      showToast(`${label} copied.`);
      setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      showToast(`Failed to copy ${label.toLowerCase()}.`);
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleCopy}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 cursor-pointer"
        title={`Copy ${label.toLowerCase()}`}
        aria-label={`Copy ${label.toLowerCase()}`}
      >
        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-secondary-foreground hover:bg-muted transition-colors cursor-pointer"
      aria-label={`Copy ${label.toLowerCase()}`}
    >
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/**
 * A labelled, read-only value with a copy affordance.
 *
 * @param label - Field label, also used in the copy confirmation
 * @param value - The value shown; selected in full when clicked
 * @returns The field
 */
export function CopyableField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground mb-1.5">{label}</p>
      <div className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-lg border border-input-border bg-background">
        <input
          type="text"
          readOnly
          value={value}
          className="flex-1 min-w-0 bg-transparent text-xs font-mono text-secondary-foreground focus:outline-none select-all"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <CopyButton value={value} label={label} compact />
      </div>
    </div>
  );
}
