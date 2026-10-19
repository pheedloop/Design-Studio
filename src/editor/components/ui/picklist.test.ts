import { describe, expect, it } from "vitest";
import { moveItem, pickedValues } from "./picklist";

const OPTIONS = [{ value: "A" }, { value: "B" }, { value: "C" }];

describe("pickedValues", () => {
  it.each([
    { value: ["C", "A"], expected: ["C", "A"] },
    { value: ["A", "GONE", "B"], expected: ["A", "B"] },
    { value: ["B", "A", "B"], expected: ["B", "A"] },
    { value: ["GONE"], expected: [] },
  ])("keeps $value as $expected", ({ value, expected }) => {
    expect(pickedValues(value, OPTIONS)).toEqual(expected);
  });
});

describe("moveItem", () => {
  it.each([
    { from: 0, to: 2, expected: ["B", "C", "A"] },
    { from: 2, to: 0, expected: ["C", "A", "B"] },
    { from: 1, to: 1, expected: ["A", "B", "C"] },
  ])("moves $from to $to", ({ from, to, expected }) => {
    expect(moveItem(["A", "B", "C"], from, to)).toEqual(expected);
  });
});
