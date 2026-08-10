import { describe, expect, it } from "vitest";
import { interpolate, resolveEnglishFrom } from "./interpolate";

describe("interpolate", () => {
  it("substitutes a placeholder", () => {
    expect(interpolate("Hello {{name}}", { name: "Ada" })).toBe("Hello Ada");
  });

  it("substitutes every occurrence, not just the first", () => {
    expect(interpolate("{{n}} of {{n}}", { n: 3 })).toBe("3 of 3");
  });

  it("tolerates whitespace inside the braces", () => {
    expect(interpolate("Hello {{  name  }}", { name: "Ada" })).toBe("Hello Ada");
  });

  it("coerces non-string values", () => {
    expect(interpolate("{{count}} seats", { count: 0 })).toBe("0 seats");
  });

  it("leaves an unsupplied placeholder visible rather than blank", () => {
    // A visible {{count}} gets reported; a silent gap does not.
    expect(interpolate("{{count}} seats", {})).toBe("{{count}} seats");
    expect(interpolate("{{count}} seats", { other: 1 })).toBe("{{count}} seats");
  });

  it("returns the template untouched when there are no vars", () => {
    expect(interpolate("Hello {{name}}")).toBe("Hello {{name}}");
  });

  it("does not re-scan substituted values for placeholders", () => {
    // Otherwise a host translation or UGC value containing {{…}} could expand
    // into another variable — or loop.
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
    // The whole point: this is what a UGC catalog is keyed by.
    expect(resolveEnglishFrom(strings, "viewer.hello", { name: "Ada" })).toBe(
      "Hello {{name}}",
    );
  });

  it("selects the singular at count 1", () => {
    expect(resolveEnglishFrom(strings, "seatviewer.seatsFree", { count: 1 })).toBe(
      "{{count}} seat free",
    );
  });

  it("selects the plural at every other count, including 0", () => {
    // English puts zero in the plural — "0 seats free", not "0 seat free".
    expect(resolveEnglishFrom(strings, "seatviewer.seatsFree", { count: 0 })).toBe(
      "{{count}} seats free",
    );
    expect(resolveEnglishFrom(strings, "seatviewer.seatsFree", { count: 7 })).toBe(
      "{{count}} seats free",
    );
  });

  it("falls back to the unsuffixed entry when a key has no plural variants", () => {
    // Passing a count to a non-plural string must not blank it out.
    expect(resolveEnglishFrom(strings, "viewer.legend.title", { count: 2 })).toBe(
      "Legend",
    );
  });

  it("returns the key itself for an unknown key, never an empty string", () => {
    // English is the guaranteed fallback; a missing entry must still render
    // something a reader can trace back to a key.
    expect(resolveEnglishFrom(strings, "viewer.nope")).toBe("viewer.nope");
  });
});
