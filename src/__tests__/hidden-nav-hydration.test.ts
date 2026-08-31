/**
 * Tests for the hidden-nav hook's hydration safety.
 *
 * Reading localStorage in a lazy useState initializer runs during render, so
 * the server (no window) emitted every nav item while the client's first
 * render dropped the hidden ones. Every remaining item shifted up a slot,
 * which React reported as a hydration mismatch on the sidebar. The hook must
 * start from a value the server can also produce.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const hook = read("src/hooks/useHiddenNavItems.ts");
const sidebar = read("src/components/layout/Sidebar.tsx");
const tabBar = read("src/components/layout/MobileTabBar.tsx");

describe("initial state", () => {
  it("starts empty, matching what the server can render", () => {
    expect(hook).toMatch(/useState<Set<string>>\(\(\) => new Set\(\)\)/);
  });

  it("does not read storage during render", () => {
    // The defect: useState(() => readHidden()).
    expect(hook).not.toMatch(/useState<Set<string>>\(\(\) => readHidden\(\)\)/);
    const init = hook.slice(
      hook.indexOf("export function useHiddenNavItems"),
      hook.indexOf("useEffect")
    );
    expect(init).not.toContain("readHidden()");
  });

  it("adopts the cache after mount instead", () => {
    expect(hook).toMatch(/useEffect\(\(\) => \{\s*setHidden\(readHidden\(\)\);/);
  });
});

describe("no flash of hidden items", () => {
  it("tracks whether the cache has been adopted", () => {
    expect(hook).toContain("const [hydrated, setHydrated] = useState(false)");
    expect(hook).toContain("setHydrated(true)");
  });

  it("removes the pre-paint style only after React's filter is authoritative", () => {
    // Removing it in the mount effect uncovers hidden items for one frame.
    expect(hook).toMatch(
      /if \(!hydrated\) return;\s*const style = document\.getElementById\("caltodo-hidden-nav-style"\)/
    );
  });

  it("gates that removal on the hydrated flag, not on mount", () => {
    const guard = hook.indexOf("if (!hydrated) return;");
    const removal = hook.indexOf('getElementById("caltodo-hidden-nav-style")');
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(removal);
  });
});

describe("consumers", () => {
  it("both nav surfaces filter through the same hook", () => {
    // One fix has to cover both, or the mobile bar keeps mismatching.
    expect(sidebar).toContain("useHiddenNavItems()");
    expect(tabBar).toContain("useHiddenNavItems()");
  });

  it("the sidebar still filters its items", () => {
    expect(sidebar).toMatch(/\.filter\(\(item\) => !isNavItemHidden\(item\.href\)\)/);
  });
});
