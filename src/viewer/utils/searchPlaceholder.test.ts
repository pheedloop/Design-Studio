import { describe, expect, it } from "vitest";
import { createSurfaceI18n } from "../../i18n/context";
import { COMMON_STRINGS } from "../../i18n/strings.common";
import { VIEWER_STRINGS } from "../../i18n/strings.viewer";
import type { FloorPlanElement } from "../../types";
import { buildSearchPlaceholder } from "./searchPlaceholder";

const { defaultTranslate: t } = createSurfaceI18n({
  ...COMMON_STRINGS,
  ...VIEWER_STRINGS,
});

const el = (type: string) => ({ type, properties: {} }) as unknown as FloorPlanElement;

const booth = el("booth");
const session = el("session_area");
const room = el("meeting_room");
// The map holds plenty of element types that are not searchable.
const wall = el("rectangle");

describe("buildSearchPlaceholder", () => {
  it("falls back to a bare prompt when nothing is searchable", () => {
    expect(buildSearchPlaceholder([wall], t)).toBe("Search");
    expect(buildSearchPlaceholder([], t)).toBe("Search");
  });

  it("names the single type present", () => {
    expect(buildSearchPlaceholder([booth, wall], t)).toBe("Search booths");
    expect(buildSearchPlaceholder([session], t)).toBe("Search session locations");
    expect(buildSearchPlaceholder([room], t)).toBe("Search meeting rooms");
  });

  it("joins two types", () => {
    expect(buildSearchPlaceholder([booth, room], t, "en-US")).toBe(
      "Search booths or meeting rooms",
    );
  });

  it("joins three types", () => {
    expect(buildSearchPlaceholder([booth, session, room], t, "en-US")).toBe(
      "Search booths, session locations, or meeting rooms",
    );
  });

  it("keeps the order of the nouns regardless of element order", () => {
    expect(buildSearchPlaceholder([room, session, booth], t, "en-US")).toBe(
      buildSearchPlaceholder([booth, session, room], t, "en-US"),
    );
  });

  it("takes the list grammar from the locale, not from English", () => {
    // The point of using Intl here: French does not use the Oxford comma.
    const fr = buildSearchPlaceholder([booth, session, room], t, "fr-FR");
    expect(fr).toContain(" ou ");
    expect(fr).not.toContain(", or ");
  });

  it("does not duplicate a type that appears many times", () => {
    expect(buildSearchPlaceholder([booth, booth, booth], t)).toBe("Search booths");
  });
});
