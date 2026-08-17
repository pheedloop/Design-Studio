import { describe, expect, it } from "vitest";
import { canonicalLocale, formatList, formatNumber } from "./format";

describe("canonicalLocale", () => {
  it("canonicalizes a well-formed tag", () => {
    expect(canonicalLocale("FR-ca")).toBe("fr-CA");
  });

  it("passes undefined through as the runtime default", () => {
    expect(canonicalLocale(undefined)).toBeUndefined();
  });

  it("drops a malformed tag instead of throwing", () => {
    // Was: an underscored tag reached Intl and threw RangeError mid-render,
    // taking down the canvas rather than one label.
    expect(canonicalLocale("fr_CA")).toBeUndefined();
    expect(canonicalLocale("")).toBeUndefined();
  });

  it("keeps the guarded tag usable by the Intl helpers", () => {
    const locale = canonicalLocale("fr_CA");
    expect(formatNumber(1.5, locale, 1)).toBeTypeOf("string");
    expect(formatList(["a", "b"], locale)).toBeTypeOf("string");
  });
});
