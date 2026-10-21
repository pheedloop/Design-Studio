import { describe, expect, it } from "vitest";
import { naturalCompare } from "./naturalSort";

const sorted = (labels: string[]) => [...labels].sort(naturalCompare("en"));

describe("naturalCompare", () => {
  // ENG-3561: booths sorted as text, so 10 and 11 came before 2.
  it("orders numbers by value", () => {
    expect(sorted(["10", "2", "1", "11", "20"])).toEqual([
      "1",
      "2",
      "10",
      "11",
      "20",
    ]);
  });

  it("orders mixed labels by their letters, then their numbers", () => {
    expect(sorted(["B1", "a10", "12B", "A2", "Booth 3"])).toEqual([
      "12B",
      "A2",
      "a10",
      "B1",
      "Booth 3",
    ]);
  });
});
