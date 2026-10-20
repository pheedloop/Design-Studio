import { describe, expect, it } from "vitest";
import { badgeFileName } from "./badgeFiles";

describe("badgeFileName", () => {
  it.each([
    ["Delinda Crocken", "pdf", "Delinda_Crocken_badge.pdf"],
    ["  Ada   Lovelace ", "png", "Ada_Lovelace_badge.png"],
    ['A/B: "C"?', "pdf", "AB_C_badge.pdf"],
    ["Zoë O'Neil", "pdf", "Zoë_ONeil_badge.pdf"],
    ["", "png", "badge.png"],
    ["///", "pdf", "badge.pdf"],
  ] as const)("%j as %s is %s", (name, format, expected) => {
    expect(badgeFileName(name, format)).toBe(expected);
  });
});
