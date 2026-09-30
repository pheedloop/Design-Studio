import { describe, expect, it } from "vitest";
import {
  applyBadgeSetup,
  countBackgroundsOnRemovedPanels,
  countFieldsOnRemovedPanels,
  type BadgeSetup,
} from "./badgeSetup";
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
  it.each([
    ["the same document when the setup matches it", unchanged, true],
    [
      "a new document when the hole punch changes",
      { ...unchanged, holePunch: null },
      false,
    ],
  ])("returns %s", (_, setup, same) => {
    expect(applyBadgeSetup(doc, setup) === doc).toBe(same);
  });

  it("writes an edited hole punch and corner radius", () => {
    const holePunch = { ...doc.holePunch!, pitchMm: 70 };
    expect(
      applyBadgeSetup(doc, { ...unchanged, holePunch, cornerRadiusMm: 2 }),
    ).toMatchObject({ holePunch, cornerRadiusMm: 2 });
  });

  it.each([
    ["double", unchanged.panels, ["front", "inner", "back"]],
    ["none", unchanged.panels.slice(0, 1), ["front"]],
  ] as const)(
    "rebuilds pages for a %s fold and keeps the front fields",
    (fold, panels, roles) => {
      const next = applyBadgeSetup(doc, { ...unchanged, fold, panels });
      expect(next.pages.map(p => p.role)).toEqual(roles);
      expect(next.pages[0].fields).toEqual([field]);
    },
  );
});

describe("countFieldsOnRemovedPanels", () => {
  const pages = [
    { id: "front", role: "front" as const, fields: [field] },
    { id: "inside", role: "inner" as const, fields: [field, field] },
    { id: "back", role: "back" as const, fields: [field] },
  ];

  it.each([
    [pages, "single", 1],
    [pages, "none", 3],
    [pages, "double", 0],
    [doc.pages, "none", 0],
  ] as const)(
    "counts fields on the panels a smaller fold drops (%#)",
    (from, fold, count) => {
      expect(countFieldsOnRemovedPanels(from, fold)).toBe(count);
    },
  );

  it.each([
    ["single", 1],
    ["none", 2],
    ["double", 0],
  ] as const)(
    "counts backgrounds on the panels a switch to %s drops",
    (fold, count) => {
      const background = { imageCode: "BIMG1", fit: "cover" as const };
      const withBackgrounds = pages.map(page => ({ ...page, background }));
      expect(countBackgroundsOnRemovedPanels(withBackgrounds, fold)).toBe(
        count,
      );
    },
  );
});
