/**
 * Chat must be reachable from the product chrome on every device.
 *
 * The room list and rooms existed but nothing linked to them: the sidebar
 * entry, the unread badge, the mobile tab and the global notifier had all
 * been removed. These tests pin each of those hooks so a future cleanup
 * cannot silently orphan the feature again.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { NAV_ITEMS } from "@/lib/constants";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

describe("Chat nav entry", () => {
  it("is listed in NAV_ITEMS after Calendar", () => {
    const hrefs = NAV_ITEMS.map((i) => i.href);
    expect(hrefs).toContain("/app/discussions");
    expect(hrefs.indexOf("/app/discussions")).toBeGreaterThan(hrefs.indexOf("/app/calendar"));
    expect(NAV_ITEMS.find((i) => i.href === "/app/discussions")?.label).toBe("Chat");
  });

  it("carries the unread badge in the desktop sidebar", () => {
    const sidebar = read("src/components/layout/Sidebar.tsx");
    expect(sidebar).toContain('import { useCalChatUnread } from "@/hooks/useCalChatUnread"');
    expect(sidebar).toContain("badgeCount={isChat ? chatUnread : undefined}");
  });

  it("has a mobile tab with the unread count", () => {
    const tabBar = read("src/components/layout/MobileTabBar.tsx");
    expect(tabBar).toContain('href: "/app/discussions"');
    expect(tabBar).toContain("badgeCount: chatUnread");
    // The bar still hides inside an open room; the room has its own back button.
    expect(tabBar).toContain("pathname.match(/^\\/app\\/discussions\\/[^/]+$/)");
  });

  it("mounts the global notifier in the app layout", () => {
    const layout = read("src/app/app/layout.tsx");
    expect(layout).toContain('import GlobalChatNotifier from "@/components/ui/GlobalChatNotifier"');
    expect(layout).toContain("<GlobalChatNotifier />");
  });

  it("is no longer treated as desktop-only anywhere", () => {
    const guard = read("src/components/layout/MobileRouteGuard.tsx");
    const landing = read("src/lib/landing-path.ts");
    expect(guard).toContain('const DESKTOP_ONLY_HREFS = ["/app/home"] as const;');
    expect(landing).toContain('const DESKTOP_ONLY_HREFS = new Set<string>(["/app/home"]);');
  });
});
