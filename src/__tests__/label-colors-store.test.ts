/**
 * Tests for the label colour store and its wiring.
 *
 * The Supabase client is a small stub that records what it was asked, so the
 * cases check what reaches the table (and what is refused before it does).
 */

import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  labelKey,
  fetchLabelColors,
  upsertLabelColor,
  deleteLabelColor,
  LABEL_KINDS,
} from "@/lib/label-colors-store";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

/** Builds a stub client whose query chain resolves to `result`. */
function stubClient(result: { data?: unknown; error?: { message: string } | null }) {
  const calls: Record<string, unknown[]> = {};
  const chain: Record<string, unknown> = {};
  for (const m of ["select", "eq", "upsert", "delete"]) {
    chain[m] = vi.fn((...args: unknown[]) => {
      (calls[m] ??= []).push(args);
      return chain;
    });
  }
  // The chain is awaited at the end; resolve to the canned result.
  chain.then = (resolve: (v: unknown) => void) => resolve({ data: result.data ?? null, error: result.error ?? null });
  const client = { from: vi.fn(() => chain) } as unknown as SupabaseClient;
  return { client, calls };
}

describe("labelKey", () => {
  it("scopes a name by kind so a tag and a class can share a name", () => {
    expect(labelKey("tag", "Exam")).not.toBe(labelKey("class", "Exam"));
  });

  it("ignores case and surrounding space", () => {
    expect(labelKey("tag", "  Hong Kong ")).toBe(labelKey("tag", "hong kong"));
  });

  it("knows every kind the table accepts", () => {
    expect(LABEL_KINDS).toEqual(["tag", "class", "source"]);
  });
});

describe("fetchLabelColors", () => {
  it("maps rows to keys", async () => {
    const { client } = stubClient({ data: [{ kind: "tag", name: "exam", color: "#EF4444" }] });
    const map = await fetchLabelColors(client, "u1");
    expect(map.get(labelKey("tag", "Exam"))).toBe("#EF4444");
  });

  it("degrades to an empty map on error rather than throwing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { client } = stubClient({ error: { message: "boom" } });
    expect((await fetchLabelColors(client, "u1")).size).toBe(0);
    vi.restoreAllMocks();
  });
});

describe("upsertLabelColor", () => {
  it("writes a lowercased name and a valid colour", async () => {
    const { client, calls } = stubClient({});
    vi.spyOn(console, "info").mockImplementation(() => {});
    expect(await upsertLabelColor(client, "u1", "tag", " Exam ", "#0e89d6")).toBe(true);
    const row = (calls.upsert[0] as unknown[])[0] as Record<string, unknown>;
    expect(row.name).toBe("exam");
    expect(row.color).toBe("#0e89d6");
    expect(row.user_id).toBe("u1");
    vi.restoreAllMocks();
  });

  it("refuses a colour that is not six-digit hex, before any request", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { client, calls } = stubClient({});
    expect(await upsertLabelColor(client, "u1", "tag", "Exam", "red")).toBe(false);
    expect(await upsertLabelColor(client, "u1", "tag", "Exam", "#fff")).toBe(false);
    expect(calls.upsert).toBeUndefined();
    vi.restoreAllMocks();
  });

  it("refuses an empty name and an unknown kind", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { client, calls } = stubClient({});
    expect(await upsertLabelColor(client, "u1", "tag", "   ", "#0e89d6")).toBe(false);
    expect(await upsertLabelColor(client, "u1", "colour" as never, "Exam", "#0e89d6")).toBe(false);
    expect(calls.upsert).toBeUndefined();
    vi.restoreAllMocks();
  });

  it("reports a failed write", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { client } = stubClient({ error: { message: "rls" } });
    expect(await upsertLabelColor(client, "u1", "tag", "Exam", "#0e89d6")).toBe(false);
    vi.restoreAllMocks();
  });
});

describe("deleteLabelColor", () => {
  it("deletes by user, kind and lowercased name", async () => {
    const { client, calls } = stubClient({});
    expect(await deleteLabelColor(client, "u1", "class", "UGBA 103")).toBe(true);
    expect(calls.eq).toEqual([["user_id", "u1"], ["kind", "class"], ["name", "ugba 103"]]);
  });
});

describe("wiring", () => {
  it("mounts the provider inside the toasts it reports through", () => {
    const layout = read("src/app/app/layout.tsx");
    expect(layout.indexOf("<ToastProvider>")).toBeLessThan(layout.indexOf("<LabelColorsProvider"));
    expect(layout).toContain("</LabelColorsProvider>");
  });

  it("lets the pickers change a colour on the row", () => {
    const list = read("src/components/tasks/inline/OptionList.tsx");
    expect(list).toContain("<ColorSwatchPicker");
    const pickers = read("src/components/tasks/TaskDetailPickers.tsx");
    expect(pickers).toContain('onColorChange={(tag, c) => void setColor("tag", tag, c)}');
    expect(pickers).toContain('onColorChange={(name, c) => void setColor("class", name, c)}');
  });

  it("keeps the swatch out of the select button, which cannot nest one", () => {
    // A <button> inside a <button> is invalid HTML; React logs a hydration
    // error and the inner one never receives its click.
    const list = read("src/components/tasks/inline/OptionList.tsx");
    const swatch = list.indexOf("<ColorSwatchPicker");
    const select = list.indexOf("onClick={() => toggle(option)}");
    expect(swatch).toBeGreaterThan(-1);
    expect(swatch).toBeLessThan(select);
  });

  it("stops a swatch click from selecting the row underneath", () => {
    const swatch = read("src/components/tasks/inline/ColorSwatchPicker.tsx");
    expect(swatch).toContain("onClick={(e) => e.stopPropagation()}");
  });

  it("offers a way back to the derived colour only once one is stored", () => {
    const swatch = read("src/components/tasks/inline/ColorSwatchPicker.tsx");
    expect(swatch).toContain("{isStored && (");
    expect(swatch).toContain("Use default");
  });
});
