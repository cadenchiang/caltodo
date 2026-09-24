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

describe("the panel has a structure to read down", () => {
  it("gives each account its own bordered block", () => {
    // A flat stack gave the account, its classes and the add control the same
    // weight and left edge, so a second account looked like a second section
    // of the first.
    expect(card).toContain("rounded-xl border border-border bg-muted/30");
    expect(card).toContain("border-t border-border/60");
  });

  it("keeps the add control outside those blocks", () => {
    // It adds an account rather than acting on one.
    const panel = card.slice(card.indexOf("aria-hidden={!open}"));
    const blockEnd = panel.indexOf("{addRoute && noun && (");
    expect(blockEnd).toBeGreaterThan(panel.indexOf("accounts.map"));
  });

  it("gives Google Calendar the same block and labels", () => {
    expect(gcal).toContain("rounded-xl border border-border bg-muted/30");
    // Its "Calendars · n" label is the same shape as an account's "Classes".
    expect(read("src/components/settings/GoogleCalendarList.tsx")).toContain(
      'text-[11px] font-semibold text-foreground'
    );
  });
});

describe("an account's classes read as one line", () => {
  it("labels the section and right-aligns its action", () => {
    // A label, count and action all left-aligned on one line gave the block
    // no column edge to read down. The label is sentence case in the text
    // colour: small caps in a subtle grey read as a form legend over the
    // pills rather than as the name of what is under it.
    expect(classes).not.toContain("uppercase");
    expect(classes).toContain('text-[11px] font-semibold text-foreground');
    expect(classes).toContain("Classes{selected.length > 0 ?");
    expect(classes).toContain("justify-between");
    expect(classes).toMatch(/selected\.length > 0 \? "Edit" : "Choose"/);
  });

  it("lists the names as pills, wrapped rather than stacked", () => {
    expect(classes).toContain("flex flex-wrap gap-1");
    expect(classes).toContain("CLASS_PILL");
  });

  it("shares one pill shape with the add control and the account label", () => {
    // A pill beside a bare text button read as two unrelated kinds of thing.
    // The shape is exported without colour: two utilities setting the same
    // property leave the winner to CSS source order, so the add control
    // could not simply append its blue to the class pill's muted grey.
    expect(classes).toContain("export const PILL_SHAPE");
    expect(classes).toContain("export const CLASS_PILL = `${PILL_SHAPE}");
    expect(card).toContain("PILL_SHAPE");
    expect(card).toContain("Add another {shortNoun(noun)}");
  });

  it("makes the add control blue, since it is the action in the block", () => {
    const gcalList = read("src/components/settings/GoogleCalendarList.tsx");
    for (const file of [card, gcalList]) {
      expect(file).toContain("bg-[#0e89d6]/10 text-[#0e89d6]");
    }
  });

  it("shows the account label as a pill, like the classes under it", () => {
    const panel = card.slice(card.indexOf("accounts.map"));
    expect(panel).toMatch(/PILL_SHAPE[^`]*bg-card border border-border text-foreground/);
  });

  it("picks classes in a modal rather than in a list inside the dropdown", () => {
    // The inline editor put a scrolling checkbox list inside a card inside a
    // dropdown, so it was a few rows tall and every tick moved the accounts
    // under it.
    expect(classes).toContain("<CourseSelectModal");
    expect(classes).not.toContain('type="checkbox"');
  });

  it("says so plainly when nothing is selected", () => {
    expect(classes).toContain("No classes selected");
  });
});
