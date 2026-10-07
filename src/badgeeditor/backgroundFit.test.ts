import { describe, expect, it } from "vitest";
import { fitBackground } from "./backgroundFit";

const panel = { width: 100, height: 200 };

describe("fitBackground", () => {
  it.each([
    [
      "cover",
      { width: 200, height: 100 },
      { x: -150, y: 0, width: 400, height: 200 },
    ],
    [
      "cover",
      { width: 50, height: 400 },
      { x: 0, y: -300, width: 100, height: 800 },
    ],
    [
      "contain",
      { width: 200, height: 100 },
      { x: 0, y: 75, width: 100, height: 50 },
    ],
    [
      "contain",
      { width: 50, height: 400 },
      { x: 37.5, y: 0, width: 25, height: 200 },
    ],
    [
      "stretch",
      { width: 200, height: 100 },
      { x: 0, y: 0, width: 100, height: 200 },
    ],
  ] as const)("%s places a %o image at %o", (fit, image, box) => {
    expect(fitBackground(fit, image, panel)).toEqual(box);
  });
});
