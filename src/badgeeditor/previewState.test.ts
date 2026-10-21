import { describe, expect, it } from "vitest";
import { previewAvailability, previewNotices } from "./previewState";
import { defaultTranslate as t } from "./i18n";

const attendee = { id: "A1", name: "Ada" };

describe("previewAvailability", () => {
  it.each([
    [true, null, "Choose an attendee to see the full preview."],
    [true, attendee, null],
    [false, null, null],
    [false, attendee, null],
  ])("serverPreview=%s attendee=%j -> %s", (serverPreview, who, expected) => {
    expect(previewAvailability({ serverPreview, attendee: who }, t)).toBe(
      expected,
    );
  });
});

describe("previewNotices", () => {
  it.each([
    [true, true, true],
    [true, false, false],
    [false, true, false],
    [false, false, false],
  ])(
    "serverPreview=%s isDirty=%s -> notice %s",
    (serverPreview, isDirty, shown) => {
      expect(previewNotices({ serverPreview, isDirty }, t) !== null).toBe(
        shown,
      );
    },
  );
});
