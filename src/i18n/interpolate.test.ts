import { describe, expect, it } from "vitest";
import {
  interpolate,
  resolveEnglishFrom,
  resolveEnglishPairFrom,
} from "./interpolate";

describe("interpolate", () => {
  it("substitutes a placeholder", () => {
    expect(interpolate("Hello {{name}}", { name: "Ada" })).toBe("Hello Ada");
  });

  it("substitutes every occurrence, not just the first", () => {
    expect(interpolate("{{n}} of {{n}}", { n: 3 })).toBe("3 of 3");
  });

  it("tolerates whitespace inside the braces", () => {
    expect(interpolate("Hello {{  name  }}", { name: "Ada" })).toBe(
      "Hello Ada",
    );
  });

  it("coerces non-string values", () => {
    expect(interpolate("{{count}} seats", { count: 0 })).toBe("0 seats");
  });

  it("leaves an unsupplied placeholder visible rather than blank", () => {
    expect(interpolate("{{count}} seats", {})).toBe("{{count}} seats");
    expect(interpolate("{{count}} seats", { other: 1 })).toBe(
      "{{count}} seats",
    );
  });

  it("returns the template untouched when there are no vars", () => {
    expect(interpolate("Hello {{name}}")).toBe("Hello {{name}}");
  });

  it("does not re-scan substituted values for placeholders", () => {
    expect(interpolate("{{a}}", { a: "{{b}}", b: "boom" })).toBe("{{b}}");
  });

  it("ignores vars with no matching placeholder", () => {
    expect(interpolate("Legend", { name: "Ada" })).toBe("Legend");
  });
});

describe("resolveEnglishFrom", () => {
  const strings = {
    "viewer.legend.title": "Legend",
    "viewer.hello": "Hello {{name}}",
    "seatviewer.seatsFree_one": "{{count}} seat free",
    "seatviewer.seatsFree_other": "{{count}} seats free",
  };

  it("returns the entry for a non-plural key", () => {
    expect(resolveEnglishFrom(strings, "viewer.legend.title")).toBe("Legend");
  });

  it("returns the template uninterpolated", () => {
    expect(resolveEnglishFrom(strings, "viewer.hello", { name: "Ada" })).toBe(
      "Hello {{name}}",
    );
  });

  it("selects the singular at count 1", () => {
    expect(
      resolveEnglishFrom(strings, "seatviewer.seatsFree", { count: 1 }),
    ).toBe("{{count}} seat free");
  });

  it("selects the plural at every other count, including 0 and 21", () => {
    // 0 and 21 are the counts other locales treat as singular; this function is
    // the displayed-English path, so it stays on English rules regardless.
    for (const count of [0, 7, 21]) {
      expect(
        resolveEnglishFrom(strings, "seatviewer.seatsFree", { count }),
      ).toBe("{{count}} seats free");
    }
  });

  it("falls back to the unsuffixed entry when a key has no plural variants", () => {
    expect(
      resolveEnglishFrom(strings, "viewer.legend.title", { count: 2 }),
    ).toBe("Legend");
  });

  it("returns the key itself for an unknown key, never an empty string", () => {
    expect(resolveEnglishFrom(strings, "viewer.nope")).toBe("viewer.nope");
  });
});

describe("resolveEnglishPairFrom", () => {
  const strings = {
    "viewer.legend.title": "Legend",
    "seatviewer.seatsFree_one": "{{count}} seat free",
    "seatviewer.seatsFree_other": "{{count}} seats free",
  };
  const pair = (count: number, locale?: string) =>
    resolveEnglishPairFrom(strings, "seatviewer.seatsFree", { count }, locale);

  it("fetches the row the target locale needs", () => {
    // fr is singular at 0 where en is not, so a catalogue keyed by the English
    // plural would otherwise be asked for the wrong row.
    expect(pair(0, "fr").lookup).toBe("{{count}} seat free");
    expect(pair(2, "fr").lookup).toBe("{{count}} seats free");
    expect(pair(21, "ru").lookup).toBe("{{count}} seat free");
  });

  // A miss means the user is shown English, and "0 seat free" is not English.
  it("keeps the fallback on English rules whatever the locale", () => {
    expect(pair(0, "fr").fallback).toBe("{{count}} seats free");
    expect(pair(21, "ru").fallback).toBe("{{count}} seats free");
    expect(pair(1, "fr").fallback).toBe("{{count}} seat free");
  });

  it("returns the same string twice when no locale is given", () => {
    expect(pair(0)).toEqual({
      lookup: "{{count}} seats free",
      fallback: "{{count}} seats free",
    });
    expect(
      resolveEnglishPairFrom(strings, "viewer.legend.title", undefined, "fr"),
    ).toEqual({ lookup: "Legend", fallback: "Legend" });
  });

  it("treats a malformed locale as English rather than throwing", () => {
    expect(pair(0, "fr_CA").lookup).toBe("{{count}} seats free");
  });

  it("falls back to _other for a category English has no form for", () => {
    // ru selects "few" at 2; only _one/_other exist, so the plural is the ceiling.
    expect(pair(2, "ru").lookup).toBe("{{count}} seats free");
  });
});
