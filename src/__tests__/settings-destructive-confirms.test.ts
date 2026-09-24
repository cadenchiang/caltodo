/**
 * Tests for the settings destructive confirmations (audit 2.1, 2.16, 2.26,
 * McpKeyList revoke).
 *
 * Account deletion, Delete all tasks, and Reset onboarding were a 3-second
 * double-click with no dialog; MCP key revoke used the same idiom. Each now
 * opens a ConfirmDialog, and account deletion requires typing "delete".
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  DELETE_CONFIRM_WORD,
  DELETED_ITEMS,
  isDeleteConfirmed,
} from "@/components/settings/DeleteAccountDialog";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

describe("isDeleteConfirmed", () => {
  it("accepts the word regardless of case and surrounding whitespace", () => {
    expect(isDeleteConfirmed("delete")).toBe(true);
    expect(isDeleteConfirmed("  DELETE ")).toBe(true);
    expect(DELETE_CONFIRM_WORD).toBe("delete");
  });

  it("rejects anything else, including a prefix or an empty string", () => {
    expect(isDeleteConfirmed("")).toBe(false);
    expect(isDeleteConfirmed("del")).toBe(false);
    expect(isDeleteConfirmed("delete my account")).toBe(false);
  });
});

describe("DeleteAccountDialog", () => {
  const src = read("src/components/settings/DeleteAccountDialog.tsx");

  it("is a destructive ConfirmDialog gated on the typed word", () => {
    expect(src).toContain('import ConfirmDialog from "@/components/ui/ConfirmDialog";');
    expect(src).toContain("destructive");
    expect(src).toContain("confirmDisabled={!isDeleteConfirmed(typed)}");
    expect(src).toContain("loading={deleting}");
  });

  it("lists what the route deletes, matching /api/account/delete", () => {
    const route = read("src/app/api/account/delete/route.ts");
    expect(DELETED_ITEMS.length).toBeGreaterThanOrEqual(4);
    expect(route).toContain("cancelStripeSubscription");
    expect(route).toContain("deleteUserStorageObjects");
    expect(route).toContain('.from("tasks")');
    expect(route).toContain('.from("integration_credentials")');
    expect(route).toContain("deleteUser(userId)");
    expect(DELETED_ITEMS.some((i) => /tasks/i.test(i))).toBe(true);
    expect(DELETED_ITEMS.some((i) => /subscription/i.test(i))).toBe(true);
    expect(DELETED_ITEMS.some((i) => /photo/i.test(i))).toBe(true);
    expect(DELETED_ITEMS.some((i) => /sign-in/i.test(i))).toBe(true);
  });

  it("resets the typed value whenever the dialog opens", () => {
    expect(src).toContain('if (open) setTyped("");');
  });
});

describe("ConfirmDialog.confirmDisabled", () => {
  it("disables only the confirm button", () => {
    const src = read("src/components/ui/ConfirmDialog.tsx");
    expect(src).toContain("confirmDisabled?: boolean;");
    expect(src).toContain("disabled={confirmDisabled}");
    expect(src).toContain("disabled={loading}");
  });
});

describe("AdvancedSection", () => {
  const src = read("src/components/settings/sections/AdvancedSection.tsx");

  it("drops the 3-second double-click idiom", () => {
    expect(src).not.toContain("setTimeout(() => setConfirm");
    expect(src).not.toContain("Click again");
    expect(src).not.toContain("3000");
  });

  it("opens a ConfirmDialog for delete all tasks and reset onboarding", () => {
    expect(src).toContain('open={pending === "delete-tasks"}');
    expect(src).toContain('open={pending === "reset-onboarding"}');
    expect(src).toContain('confirmLabel="Delete all tasks"');
    expect(src).toContain('confirmLabel="Reset onboarding"');
  });

  it("uses DeleteAccountDialog with the deleting state on the button", () => {
    expect(src).toContain('open={pending === "delete-account"}');
    expect(src).toContain("deleting={deletingAccount}");
  });

  it("uses sentence case, the glossary sign-out verb, and SectionHeading", () => {
    expect(src).not.toContain("Delete All Tasks");
    expect(src).not.toContain("Reset Onboarding");
    expect(src).not.toContain("Log Out");
    expect(src).toContain("AUTH.signOut");
    expect(src).toContain('<SectionHeading title="Advanced"');
    expect(src).not.toContain("text-subtle-foreground");
  });

  it("passes the error variant on every failure toast", () => {
    const failures = src.match(/showToast\([^;]*Failed[^;]*\);/g) ?? [];
    expect(failures.length).toBeGreaterThanOrEqual(3);
    for (const call of failures) expect(call).toContain('variant: "error"');
  });
});

describe("McpKeyList revoke", () => {
  const src = read("src/components/settings/McpKeyList.tsx");

  it("confirms through ConfirmDialog instead of a timed second click", () => {
    expect(src).toContain('import ConfirmDialog from "@/components/ui/ConfirmDialog";');
    expect(src).not.toContain("CONFIRM_WINDOW_MS");
    expect(src).not.toContain("setTimeout");
    expect(src).toContain('confirmLabel="Revoke key"');
    expect(src).toContain("loading={revokeInFlight}");
  });

  it("McpSettings failure toasts use the error variant", () => {
    const settings = read("src/components/settings/McpSettings.tsx");
    const failures = settings.match(/showToast\([^;]*Failed[^;]*\);/g) ?? [];
    expect(failures.length).toBe(3);
    for (const call of failures) expect(call).toContain('variant: "error"');
  });
});

describe("McpKeyDialog", () => {
  const src = read("src/components/settings/McpKeyDialog.tsx");

  it("is built on Modal with TextField and Buttons, no hand-rolled overlay", () => {
    expect(src).toContain('import Modal from "@/components/ui/Modal";');
    expect(src).toContain('import TextField from "@/components/ui/TextField";');
    expect(src).toContain("initialFocusRef={nameRef}");
    expect(src).not.toContain("createPortal");
    expect(src).not.toContain("z-[9999]");
    expect(src).not.toContain("addEventListener");
    expect(src).not.toContain("…");
  });

  it("MCP copy has no em dashes or ellipsis characters and CopyField failures use the error variant", () => {
    const settings = read("src/components/settings/McpSettings.tsx");
    expect(settings).not.toContain("—");
    expect(settings).not.toContain("…");
    expect(read("src/components/settings/CopyField.tsx")).toContain(
      'showToast(`Failed to copy ${label.toLowerCase()}.`, { variant: "error" })'
    );
  });
});
