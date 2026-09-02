import { describe, it, expect } from "vitest";
import { cn, type ClassValue } from "./cn";

describe("cn", () => {
  it("joins with single spaces", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it.each<ClassValue>([undefined, null, false, "", 0])("drops %o", falsy => {
    expect(cn("a", falsy, "b")).toBe("a b");
  });

  it("flattens nested arrays", () => {
    expect(cn("a", ["b", ["c", false, "d"]], "e")).toBe("a b c d e");
  });

  it("returns an empty string when everything is falsy", () => {
    expect(cn(undefined, false, null)).toBe("");
  });

  it("keeps input order, which is what className overrides rely on", () => {
    expect(cn("base", "override")).toBe("base override");
  });

  // The documented divergence from ditto, whose cn wraps tailwind-merge and
  // would collapse this to "p-2". Both survive here, so a caller cannot rely on
  // a later utility winning — Tailwind resolves by stylesheet order.
  it("does NOT merge conflicting utilities", () => {
    expect(cn("p-1", "p-2")).toBe("p-1 p-2");
  });
});
