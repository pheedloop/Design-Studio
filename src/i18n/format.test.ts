import { describe, expect, it } from "vitest";
import { canonicalLocale, formatList, formatNumber } from "./format";

describe("canonicalLocale", () => {
  it("canonicalizes a well-formed tag", () => {
    expect(canonicalLocale("FR-ca")).toBe("fr-CA");
  });

  it("passes undefined through as the runtime default", () => {
    expect(canonicalLocale(undefined)).toBeUndefined();
  });

  // Every Intl constructor throws RangeError on a bad tag, and the tag is a host
  // prop, so an unguarded one takes down the canvas rather than one label.
  it("drops a malformed tag instead of throwing", () => {
    expect(canonicalLocale("fr_CA")).toBeUndefined();
    expect(canonicalLocale("")).toBeUndefined();
    expect(() => formatNumber(1.5, canonicalLocale("fr_CA"), 1)).not.toThrow();
    expect(() =>
      formatList(["a", "b"], canonicalLocale("fr_CA")),
    ).not.toThrow();
  });
});
