import { describe, expect, it } from "vitest";
import { applyBadgeSetup, type BadgeSetup } from "./badgeSetup";
import type { BadgeDocument } from "./model";

const field = {
  id: "f",
  field: "qrCode",
  kind: "qrCode" as const,
  top: 1,
  left: 1,
};

const doc: BadgeDocument = {
  version: "1.0",
  panelSize: { width: 4, height: 5.5 },
  fold: "single",
  holePunch: {
    shape: "circle",
    count: 2,
    widthMm: 4,
    heightMm: 4,
    pitchMm: 69,
    topOffsetMm: 5,
  },
  pages: [
    { id: "front", role: "front", fields: [field] },
    { id: "back", role: "back", fields: [] },
  ],
};

const unchanged: BadgeSetup = {
  fold: "single",
  panelSize: { width: 4, height: 5.5 },
  panels: [
    { inverted: false, tearaway: false, tearawayCount: 3 },
    { inverted: true, tearaway: false, tearawayCount: 3 },
  ],
  holePunch: { ...doc.holePunch! },
  cornerRadiusMm: 0,
};

describe("applyBadgeSetup", () => {
  it("returns the same document when the setup matches it", () => {
    expect(applyBadgeSetup(doc, unchanged)).toBe(doc);
  });

  it("returns a new document when the hole punch changes", () => {
    const next = applyBadgeSetup(doc, { ...unchanged, holePunch: null });
    expect(next).not.toBe(doc);
    expect(next.holePunch).toBeNull();
  });

  it("rebuilds pages for a new fold and keeps existing fields", () => {
    const next = applyBadgeSetup(doc, {
      ...unchanged,
      fold: "double",
      panels: unchanged.panels,
    });
    expect(next.pages.map(p => p.role)).toEqual(["front", "inner", "back"]);
    expect(next.pages[0].fields).toEqual([field]);
    expect(next.pages[2]).toMatchObject({ fields: [], tearawayCount: 3 });
  });

  it("drops pages beyond the new fold", () => {
    const next = applyBadgeSetup(doc, {
      ...unchanged,
      fold: "none",
      panels: unchanged.panels.slice(0, 1),
    });
    expect(next.pages).toHaveLength(1);
  });
});
