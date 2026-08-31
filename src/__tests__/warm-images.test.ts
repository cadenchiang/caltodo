/**
 * Unit tests for lib/warm-images, plus a guard on where the warm-up is
 * allowed to be called from.
 *
 * The bug this replaces: the warm-up lived in `IntegrationProvider`, which
 * GlobalHealthBanner mounts app-wide, so /app/inbox eagerly fetched four
 * settings-only logos. The structural test at the bottom is the part that
 * actually stops that regressing.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { warmImages, INTEGRATION_LOGO_SRCS, type ImageFactory } from "@/lib/warm-images";

const SRC = resolve(__dirname, "..");

/** Collect the `src` assigned to each preloader the helper creates. */
function recordingFactory(): { factory: ImageFactory; warmed: string[] } {
  const warmed: string[] = [];
  const factory: ImageFactory = () => {
    const el = {
      set src(value: string) {
        warmed.push(value);
      },
      get src() {
        return warmed[warmed.length - 1] ?? "";
      },
    };
    return el;
  };
  return { factory, warmed };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("warmImages", () => {
  it("warms every URL it is given", () => {
    const { factory, warmed } = recordingFactory();
    const count = warmImages(["/a.png", "/b.png"], factory);
    expect(count).toBe(2);
    expect(warmed).toEqual(["/a.png", "/b.png"]);
  });

  it("de-duplicates repeated URLs", () => {
    const { factory, warmed } = recordingFactory();
    expect(warmImages(["/a.png", "/a.png", "/b.png"], factory)).toBe(2);
    expect(warmed).toEqual(["/a.png", "/b.png"]);
  });

  it("skips blank entries", () => {
    const { factory, warmed } = recordingFactory();
    expect(warmImages(["", "   ", "/a.png"], factory)).toBe(1);
    expect(warmed).toEqual(["/a.png"]);
  });

  it("is a no-op for an empty list", () => {
    const { factory, warmed } = recordingFactory();
    expect(warmImages([], factory)).toBe(0);
    expect(warmed).toEqual([]);
  });

  it("continues past a failing URL and logs the cause", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    let call = 0;
    const factory: ImageFactory = () => {
      call += 1;
      if (call === 1) throw new Error("boom");
      return { src: "" };
    };
    expect(warmImages(["/bad.png", "/good.png"], factory)).toBe(1);
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0][0])).toContain("/bad.png");
  });

  it("returns 0 with no factory and no window (SSR)", () => {
    // `environment: "node"` means there is no global window here.
    expect(warmImages(["/a.png"])).toBe(0);
  });
});

describe("INTEGRATION_LOGO_SRCS", () => {
  it("lists the four integration logos", () => {
    expect([...INTEGRATION_LOGO_SRCS]).toEqual([
      "/bcourses-logo.png",
      "/gradescope-logo.png",
      "/pensieve-logo.png",
      "/canvas-logo.png",
    ]);
  });

  it("references only root-relative png paths", () => {
    for (const src of INTEGRATION_LOGO_SRCS) {
      expect(src).toMatch(/^\/[a-z0-9-]+\.png$/);
    }
  });
});

describe("warm-up placement", () => {
  const file = readFileSync(resolve(SRC, "components/settings/IntegrationSettings.tsx"), "utf8");

  /**
   * IntegrationProvider is mounted app-wide via GlobalHealthBanner. Warming
   * settings-only logos there costs every authenticated page the download.
   * The call belongs in the component that renders the cards.
   */
  it("does not warm logos inside IntegrationProvider", () => {
    const provider = file.slice(
      file.indexOf("export function IntegrationProvider"),
      file.indexOf("export default function IntegrationSettings"),
    );
    expect(provider.length).toBeGreaterThan(0);
    expect(provider).not.toContain("warmImages");
    expect(provider).not.toContain("new window.Image()");
  });

  it("warms logos from the card list component instead", () => {
    const component = file.slice(file.indexOf("export default function IntegrationSettings"));
    expect(component).toContain("warmImages");
  });

  it("keeps the module under the 300-line limit", () => {
    expect(file.split("\n").length).toBeLessThanOrEqual(300);
  });
});
