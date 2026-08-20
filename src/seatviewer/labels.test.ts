import { describe, expect, it } from "vitest";
import { createSurfaceI18n } from "@/i18n/context";
import { COMMON, SEATVIEWER } from "@/i18n/strings";
import { occupantHeading } from "./labels";

const { defaultTranslate: t } = createSurfaceI18n({
  common: COMMON,
  seatviewer: SEATVIEWER,
});

const state = (over: Partial<Parameters<typeof occupantHeading>[1]> = {}) => ({
  loading: false,
  hasOccupants: false,
  locked: false,
  ...over,
});

describe("occupantHeading", () => {
  it("reports loading above everything else", () => {
    expect(occupantHeading(state({ loading: true }), t)).toBe("Loading…");
    // Loading wins even when the table is locked and already has people.
    expect(
      occupantHeading(
        state({ loading: true, hasOccupants: true, locked: true }),
        t,
      ),
    ).toBe("Loading…");
  });

  it("names the occupants when there are any, locked or not", () => {
    expect(occupantHeading(state({ hasOccupants: true }), t)).toBe(
      "Seated here",
    );
    expect(
      occupantHeading(state({ hasOccupants: true, locked: true }), t),
    ).toBe("Seated here");
  });

  it("reports a locked empty table as locked", () => {
    expect(occupantHeading(state({ locked: true }), t)).toBe("Locked");
  });

  it("falls through to the empty state", () => {
    expect(occupantHeading(state(), t)).toBe("No one seated yet");
  });
});
