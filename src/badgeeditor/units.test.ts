import { describe, expect, it } from "vitest";
import { syncDimText } from "./units";

describe("syncDimText", () => {
  it.each([
    [
      "keeps in-progress text that still parses to the value",
      "2.",
      2,
      "in",
      "2.",
    ],
    ["shows a value set from outside", "2", 5.5, "in", "5.5"],
    ["re-renders the value in a new unit", "2", 2, "cm", "5.08"],
    ["replaces empty text", "", 3, "in", "3"],
  ] as const)("%s", (_, text, value, unit, expected) => {
    expect(syncDimText(text, value, unit)).toBe(expected);
  });
});
