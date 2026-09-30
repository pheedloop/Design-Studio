import { describe, expect, it } from "vitest";
import { imageRetryDelay } from "./imageRetry";

describe("imageRetryDelay", () => {
  it.each([
    [1, 500],
    [2, 1000],
    [3, null],
  ])("after failed attempt %i waits %s", (attempt, delay) => {
    expect(imageRetryDelay(attempt)).toBe(delay);
  });
});
