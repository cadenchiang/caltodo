/**
 * Tests for the Google Calendar settings card after the split (audit 2.2,
 * 2.5, 2.6, 2.7, 2.8, 2.28 and the 300-line rule).
 *
 * The 662-line card is now: the card, useGoogleCalendarConnect (OAuth),
 * lib/gcal/background-sync (module-level sync), lib/gcal/oauth-error-copy,
 * GoogleCalendarIcon and the shared StatusBadge.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  OAUTH_ERROR_FALLBACK,
  OAUTH_ERROR_MESSAGES,
  oauthErrorMessage,
} from "@/lib/gcal/oauth-error-copy";
import {
  AUTO_SYNC_COOLDOWN_MS,
  canAutoSync,
  isSyncInProgress,
  markAutoSyncAttempt,
  publishSyncToastHandlers,
  resetBackgroundSyncState,
  runBackgroundSync,
  syncToast,
} from "@/lib/gcal/background-sync";
import {
  CONNECTED_LABEL,
  NEEDS_RECONNECT_LABEL,
  NEEDS_RECONNECT_SHORT,
} from "@/components/settings/integration-status";
import { UNSAFE_LINK_LABEL } from "@/components/settings/GoogleAuthWarningModal";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");
const lines = (rel: string) => read(rel).split("\n").length;

describe("oauthErrorMessage", () => {
  it("maps every known reason and falls back for unknown ones", () => {
    for (const [reason, message] of Object.entries(OAUTH_ERROR_MESSAGES)) {
      expect(oauthErrorMessage(reason)).toBe(message);
    }
    expect(oauthErrorMessage("nope")).toBe(OAUTH_ERROR_FALLBACK);
    expect(oauthErrorMessage(null)).toBe(OAUTH_ERROR_FALLBACK);
    expect(oauthErrorMessage(undefined)).toBe(OAUTH_ERROR_FALLBACK);
  });
});

describe("background-sync module state", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    resetBackgroundSyncState();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("allows auto-sync until an attempt is marked, then enforces the cooldown", () => {
    expect(canAutoSync()).toBe(true);
    markAutoSyncAttempt();
    expect(canAutoSync()).toBe(false);
    expect(AUTO_SYNC_COOLDOWN_MS).toBe(5 * 60_000);
  });

  it("uses published handlers, and the fallback before any are published", () => {
    const fallback = vi.fn();
    syncToast(fallback, "hello");
    expect(fallback).toHaveBeenCalledWith("hello", undefined);
    const showToast = vi.fn();
    publishSyncToastHandlers({ showToast, updateProgress: vi.fn() });
    syncToast(fallback, "again", { progress: 1 });
    expect(showToast).toHaveBeenCalledWith("again", { progress: 1 });
  });

  it("reports an already-synced JSON response and clears the in-progress flag", async () => {
    const showToast = vi.fn();
    publishSyncToastHandlers({ showToast, updateProgress: vi.fn() });
    fetchMock.mockResolvedValue({
      ok: true,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => ({ synced: 0, total: 0 }),
    });
    const run = runBackgroundSync(false);
    expect(isSyncInProgress()).toBe(true);
    await run;
    expect(isSyncInProgress()).toBe(false);
    expect(showToast).toHaveBeenCalledWith("All tasks are already synced.", undefined);
  });

  it("stops auto-sync after a failure and toasts with the error variant", async () => {
    const showToast = vi.fn();
    publishSyncToastHandlers({ showToast, updateProgress: vi.fn() });
    fetchMock.mockRejectedValue(new Error("offline"));
    await runBackgroundSync(false);
    expect(showToast).toHaveBeenCalledWith("Failed to sync tasks. Please try again.", { variant: "error" });
    expect(canAutoSync()).toBe(false);
  });

  it("is silent for auto-sync", async () => {
    const showToast = vi.fn();
    publishSyncToastHandlers({ showToast, updateProgress: vi.fn() });
    fetchMock.mockRejectedValue(new Error("offline"));
    await runBackgroundSync(true);
    expect(showToast).not.toHaveBeenCalled();
  });
});

describe("GoogleCalendarSettings card", () => {
  const src = read("components/settings/GoogleCalendarSettings.tsx");

  it("and its split-out files are each under 300 lines", () => {
    for (const rel of [
      "components/settings/GoogleCalendarSettings.tsx",
      "hooks/useGoogleCalendarConnect.ts",
      "lib/gcal/background-sync.ts",
      "lib/gcal/oauth-error-copy.ts",
      "components/settings/GoogleCalendarIcon.tsx",
      "components/settings/integration-status.tsx",
    ]) {
      expect(lines(rel), rel).toBeLessThan(300);
    }
  });

  it("confirms disconnect through ConfirmDialog", () => {
    expect(src).toContain('import ConfirmDialog from "@/components/ui/ConfirmDialog";');
    expect(src).toContain("open={confirmingDisconnect}");
    expect(src).toContain('confirmLabel="Disconnect"');
    expect(src).toContain("loading={disconnecting}");
  });

  it("keeps the Disconnect control visible instead of opacity-0 until hover", () => {
    // The collapsed panel legitimately uses opacity-0; the control must not.
    expect(src).not.toContain("opacity-0 group-hover");
    expect(src).not.toContain("group-hover/row");
    expect(src).not.toContain("focus-visible:opacity-100");
  });

  it("derives needs-reconnect from the scope check and google_auth_failed, with a Reconnect button", () => {
    expect(src).toContain("scopeNeedsReconnect || !!credentials.google_auth_failed");
    expect(src).toContain("<StatusBadge needsReconnect={needsReconnect} />");
    expect(src).toContain("{NEEDS_RECONNECT_LABEL}");
    expect(src).toContain("onClick={handleReconnect}");
    expect(src).toContain(">\n                          Reconnect\n");
  });

  it("uses the glossary label, Badge for the tag, and no hardcoded brand blue", () => {
    expect(src).toContain("PROVIDER_LABELS.gcal");
    expect(src).toContain('<Badge variant="info">Real-time</Badge>');
    expect(src).not.toContain("#0e89d6");
    expect(src).not.toContain("text-[9px]");
  });

  it("passes the error variant on failure toasts", () => {
    const failures = src.match(/showToast\(`Failed[^;]*\);/g) ?? [];
    expect(failures.length).toBe(2);
    for (const call of failures) expect(call).toContain('variant: "error"');
  });
});

describe("StatusBadge", () => {
  const src = read("components/settings/integration-status.tsx");

  it("never hides the reconnect state, collapsing it to a labelled short badge on mobile", () => {
    expect(NEEDS_RECONNECT_LABEL).toBe("Needs reconnecting");
    expect(NEEDS_RECONNECT_SHORT).toBe("Reconnect");
    expect(CONNECTED_LABEL).toBe("Connected");
    expect(src).toContain('<Badge variant="danger" className="hidden sm:inline-flex shrink-0">');
    expect(src).toContain('<Badge variant="danger" className="sm:hidden shrink-0" aria-label={NEEDS_RECONNECT_LABEL}>');
    expect(src).toContain('<Badge variant="success" className="hidden sm:inline-flex shrink-0">');
  });
});

describe("GoogleAuthWarningModal", () => {
  const src = read("components/settings/GoogleAuthWarningModal.tsx");

  it("is built on Modal with the lowercase brand in the unsafe-link label", () => {
    expect(src).toContain('import Modal from "@/components/ui/Modal";');
    expect(src).not.toContain("createPortal");
    expect(src).not.toContain("z-[9999]");
    expect(src).not.toContain("#0e89d6");
    expect(UNSAFE_LINK_LABEL).toBe("Go to caltodo (unsafe)");
    expect(src).not.toContain("—");
  });
});

describe("GoogleCalendarList add control", () => {
  const src = read("components/settings/GoogleCalendarList.tsx");

  it("toggles to Cancel while picking and exposes aria-expanded", () => {
    expect(src).toContain('{picking ? "Cancel" : "Add another calendar"}');
    expect(src).toContain("aria-expanded={picking}");
    expect(src).toContain("function togglePicker()");
  });

  it("uses blue tokens and the error variant on failures", () => {
    expect(src).not.toContain("#0e89d6");
    expect(src).toContain("bg-blue-500/10 text-blue-500");
    const failures = src.match(/showToast\([^;]*(Failed|Keep at least)[^;]*\);/g) ?? [];
    expect(failures.length).toBe(3);
    for (const call of failures) expect(call).toContain('variant: "error"');
  });
});
