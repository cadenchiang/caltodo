import { describe, it, expect } from "vitest";
import { computeNextDueDate, getRepeatLabel } from "@/lib/repeat";

describe("computeNextDueDate", () => {
  it("adds days correctly", () => {
    expect(computeNextDueDate("2026-02-18", 1, "day")).toBe("2026-02-19");
    expect(computeNextDueDate("2026-02-18", 3, "day")).toBe("2026-02-21");
  });

  it("adds weeks correctly", () => {
    expect(computeNextDueDate("2026-02-18", 1, "week")).toBe("2026-02-25");
    expect(computeNextDueDate("2026-02-18", 2, "week")).toBe("2026-03-04");
  });

  it("adds months correctly", () => {
    expect(computeNextDueDate("2026-01-15", 1, "month")).toBe("2026-02-15");
    expect(computeNextDueDate("2026-01-15", 3, "month")).toBe("2026-04-15");
  });

  it("handles month overflow (Jan 31 + 1 month = Feb 28)", () => {
    expect(computeNextDueDate("2026-01-31", 1, "month")).toBe("2026-02-28");
  });

  it("handles leap year month overflow (Jan 31 + 1 month in 2024 = Feb 29)", () => {
    expect(computeNextDueDate("2024-01-31", 1, "month")).toBe("2024-02-29");
  });

  it("handles year boundary (Dec 15 + 1 month = Jan 15)", () => {
    expect(computeNextDueDate("2026-12-15", 1, "month")).toBe("2027-01-15");
  });

  it("handles year boundary with days (Dec 30 + 5 days = Jan 4)", () => {
    expect(computeNextDueDate("2026-12-30", 5, "day")).toBe("2027-01-04");
  });

  it("handles year boundary with weeks (Dec 25 + 2 weeks = Jan 8)", () => {
    expect(computeNextDueDate("2026-12-25", 2, "week")).toBe("2027-01-08");
  });
});

describe("getRepeatLabel", () => {
  it("returns 'Daily' for 1 day", () => {
    expect(getRepeatLabel(1, "day")).toBe("Daily");
  });

  it("returns 'Weekly' for 1 week", () => {
    expect(getRepeatLabel(1, "week")).toBe("Weekly");
  });

  it("returns 'Monthly' for 1 month", () => {
    expect(getRepeatLabel(1, "month")).toBe("Monthly");
  });

  it("returns 'Biweekly' for 2 weeks", () => {
    expect(getRepeatLabel(2, "week")).toBe("Biweekly");
  });

  it("returns 'Every 3 days' for custom day interval", () => {
    expect(getRepeatLabel(3, "day")).toBe("Every 3 days");
  });

  it("returns 'Every 4 weeks' for custom week interval", () => {
    expect(getRepeatLabel(4, "week")).toBe("Every 4 weeks");
  });

  it("returns 'Every 2 months' for custom month interval", () => {
    expect(getRepeatLabel(2, "month")).toBe("Every 2 months");
  });
});
