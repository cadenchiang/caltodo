/**
 * Tests the connected card's header and panel.
 *
 * Three things have to hold for the dropdown to be the safe place it was
 * introduced to be: the status is a badge and not a disconnect button, the
 * header says enough that you rarely need to expand, and every integration
 * behaves the same way - including Google Calendar, which keeps its own
 * component because it also drives the post-OAuth setup.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const card = read("src/components/settings/ConnectedIntegrationCard.tsx");
const gcal = read("src/components/settings/GoogleCalendarSettings.tsx");
const classes = read("src/components/settings/AccountClasses.tsx");

describe("the header reports what is syncing", () => {
  it("counts classes across every account on the integration", () => {
    expect(card).toContain(
      "accounts.reduce((n, a) => n + (a.selectedCourses?.length ?? 0), 0)"
    );
  });

  it("pluralises the count", () => {
    expect(card).toContain('`${classCount} ${classCount === 1 ? "class" : "classes"}`');
  });

  it("says nothing about classes for a provider that has none", () => {
    // Brightspace and Blackboard sync whole feeds; "0 classes" would read as
    // a problem rather than as not applicable.
    expect(card).toContain("accounts.some((a) => a.selectedCourses !== null)");
    expect(card).toContain("hasClasses");
  });

  it("joins the count onto the subtitle rather than replacing it", () => {
    expect(card).toContain('[meta.subtitle(credentials), classSummary].filter(Boolean).join(" · ")');
  });
});

describe("nothing destructive sits on the front of a card", () => {
  it("renders the connected status as a badge, not a button", () => {
    const header = card.slice(card.indexOf("aria-expanded={open}"), card.indexOf("aria-hidden={!open}"));
    expect(header).toContain("<span");
    expect(header).not.toContain("Disconnect");
  });

  it("keeps disconnect inside the panel, quiet until its row is hovered", () => {
    const panel = card.slice(card.indexOf("aria-hidden={!open}"));
    expect(panel).toContain("Disconnect");
    expect(panel).toContain("opacity-0 group-hover/row:opacity-100");
  });

  it("still reveals it to a keyboard user", () => {
    // opacity-0 alone would make it unreachable without a pointer.
    expect(card).toContain("focus-visible:opacity-100");
  });

  it("confirms before disconnecting, naming the tasks it removes", () => {
    expect(card).toContain("setConfirming(true)");
    expect(card).toMatch(/synced task/);
  });
});

describe("Google Calendar gets the same dropdown", () => {
  it("makes the header a toggle once connected", () => {
    expect(gcal).toContain("const HeaderTag = isConnectedOrConnecting ? \"button\" : \"div\";");
    expect(gcal).toContain("aria-expanded");
  });

  it("leaves it a plain row while disconnected, since there is nothing to reveal", () => {
    expect(gcal).toContain('isConnectedOrConnecting ? "hover:bg-muted/40 transition-colors cursor-pointer" : ""');
  });

  it("shows the account and its disconnect in the panel", () => {
    const panel = gcal.slice(gcal.indexOf("aria-hidden={!open}"));
    expect(panel).toContain("googleEmail");
    expect(panel).toContain("Disconnect Google Calendar");
  });

  it("no longer turns the connected badge into a disconnect on hover", () => {
    expect(gcal).not.toContain('<span className="group-hover:hidden">');
    expect(gcal).not.toContain('<span className="hidden group-hover:inline">Disconnect</span>');
  });

  it("keeps its own component, which also drives the post-OAuth setup", () => {
    // Routing connected users to the shared card would stop this mounting and
    // the ?gcal=connected auto-setup would never run.
    expect(gcal).toContain("autoSetupCalendar");
    expect(read("src/components/settings/IntegrationList.tsx")).toContain("<GoogleCalendarSettings />");
  });

  it("uses the same expand mechanics as the shared card", () => {
    for (const cls of ["grid-rows-[1fr]", "grid-rows-[0fr]", "rotate-180"]) {
      expect(gcal).toContain(cls);
      expect(card).toContain(cls);
    }
  });
});

describe("an account's classes read as one line", () => {
  it("puts the count and the action together", () => {
    expect(classes).toContain('${selected.length === 1 ? "class" : "classes"}');
    expect(classes).toMatch(/selected\.length > 0 \? "Edit" : "Choose"/);
  });

  it("lists the names as text rather than a stack of chips", () => {
    expect(classes).toContain('selected.map((c) => c.name).join(", ")');
    expect(classes).not.toContain("flex flex-wrap gap-1.5");
  });

  it("says so plainly when nothing is selected", () => {
    expect(classes).toContain("No classes selected");
  });
});
