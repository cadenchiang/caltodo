"use client";

import type { FormEvent } from "react";
import Button from "@/components/ui/Button";
import HostField, { normalizeCanvasHost } from "@/components/onboarding/HostField";
import SecretField from "@/components/onboarding/SecretField";
import TokenVideoGuide from "@/components/onboarding/TokenVideoGuide";
import { BCOURSES_HINT } from "@/lib/copy";

/**
 * Validates the token form before it is submitted.
 *
 * @param host - Raw host text
 * @param token - Raw token text
 * @returns An error message, or null when both fields are usable
 */
export function validateTokenForm(host: string, token: string): string | null {
  const clean = normalizeCanvasHost(host);
  if (!clean) return "Enter your school's Canvas address.";
  if (!clean.includes(".") || /\s/.test(clean)) return "That Canvas address does not look like a hostname.";
  if (!token.trim()) return "Paste your Canvas access token.";
  return null;
}

export interface CanvasTokenFormProps {
  /** Host text (no scheme). */
  host: string;
  onHostChange: (value: string) => void;
  /** Access token text. */
  token: string;
  onTokenChange: (value: string) => void;
  /** Called on submit once validation passes. */
  onSubmit: () => void;
  /** Whether a verification request is in flight. */
  verifying: boolean;
  /** Whether the parent is saving; disables submit. */
  saving: boolean;
  /** Shown above the host field. */
  hostHint?: string;
  /** Called when validation fails, with the message to surface. */
  onInvalid: (message: string) => void;
  /** Unique field name prefix so password managers do not cross-fill. */
  namePrefix?: string;
}

/**
 * Canvas API-token form: host, token, connect. Wrapped in a form so Enter
 * submits; Button is type="submit".
 *
 * @param host - Host text, prefilled from the school step when known
 * @param token - Access token
 * @param onSubmit - Runs after validateTokenForm passes
 * @param onInvalid - Receives the validation message
 * @param verifying - Spinner on the connect button
 */
export default function CanvasTokenForm({
  host,
  onHostChange,
  token,
  onTokenChange,
  onSubmit,
  verifying,
  saving,
  hostHint,
  onInvalid,
  namePrefix = "canvas",
}: CanvasTokenFormProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const problem = validateTokenForm(host, token);
    if (problem) {
      onInvalid(problem);
      return;
    }
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="text-left">
      <p className="text-xs text-muted-foreground mb-4">
        This method needs an API token and has a few more steps.
      </p>
      <TokenVideoGuide host={normalizeCanvasHost(host)} />
      <div className="mb-3">
        <HostField
          value={host}
          onChange={onHostChange}
          hint={hostHint ?? BCOURSES_HINT}
          name={`${namePrefix}-host-nofill`}
        />
      </div>
      <div className="mb-5">
        <SecretField
          label="Access token"
          secretNoun="token"
          value={token}
          onChange={(e) => onTokenChange(e.target.value)}
          placeholder="Paste access token"
          autoComplete="new-password"
          name={`${namePrefix}-token-nofill`}
          data-1p-ignore
        />
      </div>
      <Button type="submit" variant="inverted" size="lg" className="w-full" loading={verifying} disabled={saving}>
        {verifying ? "Verifying..." : "Connect"}
      </Button>
    </form>
  );
}
