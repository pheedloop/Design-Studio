import { describe, expect, it } from "vitest";
import { syncDimText } from "./units";

describe("syncDimText", () => {
  it("keeps in-progress text that still parses to the value", () => {
    expect(syncDimText("2.", 2, "in")).toBe("2.");
  });

  it("shows a value set from outside", () => {
    expect(syncDimText("2", 5.5, "in")).toBe("5.5");
  });

  it("re-renders the value in a new unit", () => {
    expect(syncDimText("2", 2, "cm")).toBe("5.08");
  });

  it("replaces empty text", () => {
    expect(syncDimText("", 3, "in")).toBe("3");
  });
});
