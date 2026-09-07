/**
 * Tests for the /app layout's server preload.
 *
 * The trace this came from: HTML ready at 0.57s, but every data request
 * waited for hydration (~1.1s) and the list could not draw until tasks came
 * back at 1.67s. These pin that the three loads now happen on the server, in
 * parallel, and that each consumer honours what it is handed.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { TASK_COLUMNS } from "@/lib/task-columns";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

describe("the layout preload", () => {
  const layout = read("src/app/app/layout.tsx");

  it("loads tasks, credentials and colours in parallel, after verifying the user", () => {
    expect(layout).toContain("await Promise.all([");
    expect(layout).toContain("loadInitialTasks(supabase, user.id)");
    expect(layout).toContain("loadCredentials(supabase, user.id)");
    expect(layout).toContain("fetchLabelColors(supabase, user.id)");
    expect(layout.indexOf("supabase.auth.getUser()")).toBeLessThan(layout.indexOf("await Promise.all(["));
  });

  it("hands each result to its consumer", () => {
    expect(layout).toContain("<TaskProvider initialTasks={initialTasks}>");
    expect(layout).toContain("<CredentialsSeed credentials={initialCredentials} />");
    expect(layout).toContain("initialColors={initialColors}");
  });

  it("seeds credentials before the providers that read them", () => {
    expect(layout.indexOf("<CredentialsSeed")).toBeLessThan(layout.indexOf("<TaskProvider"));
  });
});

describe("TaskProvider", () => {
  const ctx = read("src/contexts/TaskContext.tsx");

  it("starts from the preloaded list without a loading state", () => {
    expect(ctx).toContain("useState<Task[]>(initialTasks ?? [])");
    expect(ctx).toContain("useState(!preloaded)");
  });

  it("skips the mount fetch but still resolves the user for writes", () => {
    const effect = ctx.slice(ctx.indexOf("if (preloaded) {\n      // The list is already here"));
    expect(effect).toContain("getCurrentUser().then((user) => {");
    expect(effect).toContain("} else {\n      fetchTasks();");
  });

  it("treats the preload as the sync baseline", () => {
    expect(ctx).toContain("useRef<Task[]>(initialTasks ?? [])");
    expect(ctx).toContain("const hasInitialFetchRef = useRef(preloaded);");
  });

  it("writes the preload to the local cache rather than reading a stale one", () => {
    expect(ctx).toContain("if (preloaded) {\n      setCachedTasks(initialTasks);");
  });

  it("still fetches on the client when there is no preload", () => {
    expect(ctx).toContain("initialTasks = null,");
    expect(ctx).toContain("const preloaded = initialTasks !== null;");
  });
});

describe("one credentials implementation", () => {
  it("is shared by the API route and the preload", () => {
    const route = read("src/app/api/credentials/route.ts");
    expect(route).toContain("const credentials = await loadCredentials(supabase, user.id);");
    expect(route).not.toContain("const CORE_SELECT =");
    expect(read("src/lib/credentials-loader.ts")).toContain("export async function loadCredentials(");
  });

  it("primes the client cache so the first consumer needs no request", () => {
    expect(read("src/lib/credentials-client.ts")).toContain("export function seedCredentials(");
    expect(read("src/components/CredentialsSeed.tsx")).toContain("useLayoutEffect");
  });
});

describe("task columns", () => {
  it("names every column instead of selecting *", () => {
    expect(TASK_COLUMNS.split(",")).toContain("id");
    expect(TASK_COLUMNS.split(",")).toContain("due_date_manually_edited_at");
    expect(TASK_COLUMNS).not.toContain("*");
    expect(read("src/contexts/TaskContext.tsx")).toContain(".select(TASK_COLUMNS)");
    expect(read("src/lib/tasks-loader.ts")).toContain(".select(TASK_COLUMNS)");
  });
});
