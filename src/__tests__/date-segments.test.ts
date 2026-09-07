/**
 * Tests for the MM / DD / YYYY segment model behind the date picker's
 * three entry boxes. Time is frozen where a case depends on "today".
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  DATE_FIELDS,
  EMPTY_SEGMENTS,
  FIELD_LENGTH,
  isComplete,
  isEmpty,
  isFieldFull,
  sanitizeSegment,
  segmentsFromIso,
  segmentsFromPaste,
  segmentsToIso,
} from "@/lib/date-segments";

describe("field layout", () => {
  it("orders the boxes month, day, year", () => {
    expect(DATE_FIELDS).toEqual(["month", "day", "year"]);
  });

  it("gives the year twice the width of the other two", () => {
    expect(FIELD_LENGTH).toEqual({ month: 2, day: 2, year: 4 });
  });
});

describe("sanitizeSegment", () => {
  it("keeps digits", () => {
    expect(sanitizeSegment("05", "month")).toBe("05");
    expect(sanitizeSegment("2026", "year")).toBe("2026");
  });

  it("drops everything that is not a digit", () => {
    expect(sanitizeSegment("5/", "month")).toBe("5");
    expect(sanitizeSegment("a1b2", "day")).toBe("12");
    expect(sanitizeSegment("-3", "month")).toBe("3");
  });

  it("truncates to the box's width rather than refusing the keystroke", () => {
    expect(sanitizeSegment("123", "month")).toBe("12");
    expect(sanitizeSegment("20261", "year")).toBe("2026");
  });

  it("allows a box to be cleared", () => {
    expect(sanitizeSegment("", "day")).toBe("");
    expect(sanitizeSegment("///", "day")).toBe("");
  });
});

describe("fullness", () => {
  it("reports a box full only at its exact width", () => {
    expect(isFieldFull({ month: "5", day: "", year: "" }, "month")).toBe(false);
    expect(isFieldFull({ month: "05", day: "", year: "" }, "month")).toBe(true);
    expect(isFieldFull({ month: "", day: "", year: "202" }, "year")).toBe(false);
    expect(isFieldFull({ month: "", day: "", year: "2026" }, "year")).toBe(true);
  });

  it("reports complete only when all three are full", () => {
    expect(isComplete({ month: "05", day: "02", year: "2026" })).toBe(true);
    expect(isComplete({ month: "05", day: "02", year: "202" })).toBe(false);
    expect(isComplete(EMPTY_SEGMENTS)).toBe(false);
  });

  it("reports empty only when nothing has been typed", () => {
    expect(isEmpty(EMPTY_SEGMENTS)).toBe(true);
    expect(isEmpty({ month: "5", day: "", year: "" })).toBe(false);
  });
});

describe("segmentsToIso", () => {
  it("resolves a complete date", () => {
    expect(segmentsToIso({ month: "05", day: "02", year: "2026" })).toBe("2026-05-02");
  });

  it("holds off until a half-typed month or day is padded out", () => {
    // "5" is one keystroke away from "50"; treating it as May would commit a
    // date the user has not finished typing.
    expect(segmentsToIso({ month: "5", day: "2", year: "2026" })).toBeNull();
    expect(segmentsToIso({ month: "05", day: "2", year: "2026" })).toBeNull();
  });

  it("returns null while the date is still being typed", () => {
    expect(segmentsToIso({ month: "05", day: "02", year: "20" })).toBeNull();
    expect(segmentsToIso(EMPTY_SEGMENTS)).toBeNull();
  });

  it("rejects a day that does not exist", () => {
    expect(segmentsToIso({ month: "02", day: "31", year: "2026" })).toBeNull();
    expect(segmentsToIso({ month: "13", day: "05", year: "2026" })).toBeNull();
    expect(segmentsToIso({ month: "00", day: "05", year: "2026" })).toBeNull();
    expect(segmentsToIso({ month: "05", day: "00", year: "2026" })).toBeNull();
  });

  it("respects leap years", () => {
    expect(segmentsToIso({ month: "02", day: "29", year: "2028" })).toBe("2028-02-29");
    expect(segmentsToIso({ month: "02", day: "29", year: "2027" })).toBeNull();
  });

  it("rejects a four-digit year below 1000 as a typo", () => {
    // "0026" is a mistyped 2026, not the year 26.
    expect(segmentsToIso({ month: "05", day: "02", year: "0026" })).toBeNull();
    expect(segmentsToIso({ month: "05", day: "02", year: "0000" })).toBeNull();
  });

  it("keeps a date in the past rather than rolling it forward", () => {
    // A full year is explicit, so it is taken at face value.
    expect(segmentsToIso({ month: "01", day: "02", year: "1999" })).toBe("1999-01-02");
  });
});

describe("segmentsFromPaste", () => {
  it("spreads a pasted date across the boxes from the month", () => {
    expect(segmentsFromPaste("5/2/2026", "month")).toEqual({
      month: "52",
      day: "20",
      year: "26",
    });
    expect(segmentsFromPaste("05/02/2026", "month")).toEqual({
      month: "05",
      day: "02",
      year: "2026",
    });
  });

  it("accepts any separator, or none", () => {
    expect(segmentsFromPaste("05-02-2026", "month")).toEqual({
      month: "05",
      day: "02",
      year: "2026",
    });
    expect(segmentsFromPaste("05022026", "month")).toEqual({
      month: "05",
      day: "02",
      year: "2026",
    });
  });

  it("fills only from the box the paste landed in", () => {
    expect(segmentsFromPaste("022026", "day")).toEqual({
      month: "",
      day: "02",
      year: "2026",
    });
    expect(segmentsFromPaste("2026", "year")).toEqual({
      month: "",
      day: "",
      year: "2026",
    });
  });

  it("drops digits past the last box", () => {
    expect(segmentsFromPaste("0502202699", "month")).toEqual({
      month: "05",
      day: "02",
      year: "2026",
    });
  });

  it("returns null when there is nothing to fill", () => {
    expect(segmentsFromPaste("", "month")).toBeNull();
    expect(segmentsFromPaste("not a date", "month")).toBeNull();
  });
});

describe("segmentsFromIso", () => {
  it("splits a stored date into the boxes", () => {
    expect(segmentsFromIso("2026-05-02")).toEqual({
      month: "05",
      day: "02",
      year: "2026",
    });
  });

  it("gives empty boxes for a date that is not set", () => {
    expect(segmentsFromIso(null)).toEqual(EMPTY_SEGMENTS);
  });

  it("gives empty boxes rather than throwing on malformed input", () => {
    expect(segmentsFromIso("not-a-date")).toEqual(EMPTY_SEGMENTS);
    expect(segmentsFromIso("2026-5-2")).toEqual(EMPTY_SEGMENTS);
    expect(segmentsFromIso("")).toEqual(EMPTY_SEGMENTS);
  });

  it("round-trips through segmentsToIso", () => {
    expect(segmentsToIso(segmentsFromIso("2027-12-31"))).toBe("2027-12-31");
  });
});

describe("year-less input is no longer inferred", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 31));
  });
  afterEach(() => vi.useRealTimers());

  it("waits for the year box rather than guessing the next occurrence", () => {
    // The old free-text field turned "9/4" into next September. With three
    // boxes the year is always asked for, so nothing is guessed.
    expect(segmentsToIso({ month: "09", day: "04", year: "" })).toBeNull();
  });
});
