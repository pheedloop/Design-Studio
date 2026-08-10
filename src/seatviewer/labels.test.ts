import { describe, expect, it } from "vitest";
import { createSurfaceI18n } from "../i18n/context";
import { COMMON_STRINGS } from "../i18n/strings.common";
import { SEATVIEWER_STRINGS } from "../i18n/strings.seatviewer";
import { occupantHeading } from "./labels";

const { defaultTranslate: t } = createSurfaceI18n({
  ...COMMON_STRINGS,
  ...SEATVIEWER_STRINGS,
});

const state = (over: Partial<Parameters<typeof occupantHeading>[1]> = {}) => ({
  loading: false,
  hasOccupants: false,
  locked: false,
  ...over,
});

describe("occupantHeading", () => {
  it("reports loading above everything else", () => {
    expect(occupantHeading(t, state({ loading: true }))).toBe("Loading…");
    // Loading wins even when the table is locked and already has people.
    expect(
      occupantHeading(t, state({ loading: true, hasOccupants: true, locked: true })),
    ).toBe("Loading…");
  });

  it("names the occupants when there are any, locked or not", () => {
    expect(occupantHeading(t, state({ hasOccupants: true }))).toBe("Seated here");
    expect(occupantHeading(t, state({ hasOccupants: true, locked: true }))).toBe(
      "Seated here",
    );
  });

  it("reports a locked empty table as locked", () => {
    expect(occupantHeading(t, state({ locked: true }))).toBe("Locked");
  });

  it("falls through to the empty state", () => {
    expect(occupantHeading(t, state())).toBe("No one seated yet");
  });
});
