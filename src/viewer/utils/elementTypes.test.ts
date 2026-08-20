import { describe, expect, it } from "vitest";
import { createSurfaceI18n } from "../../i18n/context";
import { COMMON, VIEWER } from "../../i18n/strings";
import type { T } from "../i18n";
import {
  TYPE_BADGE,
  TYPE_NAME,
  displayName,
  locationLabel,
} from "./elementTypes";

const { defaultTranslate: t, resolveEnglish } = createSurfaceI18n({
  common: COMMON,
  viewer: VIEWER,
});

describe("displayName", () => {
  it("prefers the element's own name", () => {
    expect(
      displayName({ name: "Hall A", elementType: "meeting_room" }, t),
    ).toBe("Hall A");
  });

  it("falls back to the type name when unnamed", () => {
    expect(displayName({ name: "", elementType: "meeting_room" }, t)).toBe(
      "Meeting Room",
    );
    expect(displayName({ name: "", elementType: "session_area" }, t)).toBe(
      "Session Area",
    );
  });

  it("resolves the fallback through the translator, not a stored string", () => {
    const fr: T = (key, vars) => {
      const english = resolveEnglish(key, vars);
      return english === "Meeting Room" ? "Salle de réunion" : english;
    };
    expect(displayName({ name: "", elementType: "meeting_room" }, fr)).toBe(
      "Salle de réunion",
    );
  });
});

describe("locationLabel", () => {
  it("uses the name when there is one", () => {
    expect(locationLabel({ name: "Acme Corp", type: "exhibitor" }, t)).toBe(
      "Acme Corp",
    );
  });

  it("falls back to the type name for the two location types", () => {
    expect(locationLabel({ name: "", type: "session_area" }, t)).toBe(
      "Session Area",
    );
    expect(locationLabel({ name: "", type: "meeting_room" }, t)).toBe(
      "Meeting Room",
    );
  });
});

describe("type tables", () => {
  it("every badge and type key resolves to real English", () => {
    for (const entry of Object.values(TYPE_BADGE)) {
      expect(t(entry.labelKey)).not.toBe(entry.labelKey);
    }
    for (const key of Object.values(TYPE_NAME)) {
      expect(t(key)).not.toBe(key);
    }
  });

  it("abbreviates the badge only where the short form stays unambiguous", () => {
    expect(t(TYPE_BADGE.session_area.labelKey)).toBe("Session");
    expect(t(TYPE_NAME.session_area)).toBe("Session Area");
    // Was "Room", which reads as any room in the venue rather than a meeting room.
    expect(t(TYPE_BADGE.meeting_room.labelKey)).toBe("Meeting Room");
  });
});
