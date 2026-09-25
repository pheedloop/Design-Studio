import { describe, expect, it } from "vitest";
import {
  createBadgeDocument,
  createDocumentFromPreset,
  presetSetup,
} from "./presets";
import { flatten } from "./serialize";
import type { BadgePreset, BadgeSpec, LegacyLayoutEntry } from "./model";

const entry = (top: number): LegacyLayoutEntry => ({
  top,
  left: 1.5,
  field: "qrCode",
  scale: 1,
});

const PRESETS: BadgePreset[] = [
  {
    key: "label",
    label: "Label",
    width: 3.5,
    height: 3,
    panels: 1,
    fold: "none",
    cornerRadiusMm: 0,
    holePunch: null,
    sampleLayout: [entry(0.5)],
  },
  {
    key: "directThermal",
    label: "Direct Thermal Badge",
    width: 4,
    height: 11,
    panels: 2,
    fold: "single",
    cornerRadiusMm: 0,
    holePunch: {
      shape: "circle",
      count: 2,
      widthMm: 4,
      heightMm: 4,
      pitchMm: 69,
      topOffsetMm: 5,
    },
    sampleLayout: [entry(0.5), entry(6)],
  },
  {
    key: "ticketedThermal",
    label: "Ticketed Thermal Badge",
    width: 4,
    height: 16.5,
    panels: 3,
    fold: "double",
    cornerRadiusMm: 3,
    holePunch: null,
    sampleLayout: [entry(0.5), entry(6), entry(12)],
  },
];

describe("createDocumentFromPreset", () => {
  it.each([
    ["label", 3, 1],
    ["directThermal", 5.5, 2],
    ["ticketedThermal", 5.5, 3],
  ])(
    "builds %s with %s-inch panels across %i pages",
    (key, panelHeight, pages) => {
      const preset = PRESETS.find(p => p.key === key)!;
      const doc = createDocumentFromPreset(preset);
      expect(doc.fold).toBe(preset.fold);
      expect(doc.panelSize).toEqual({
        width: preset.width,
        height: panelHeight,
      });
      expect(doc.pages).toHaveLength(pages);
      expect(doc.pages.map(p => p.fields.length)).toEqual(Array(pages).fill(1));
      expect(doc.holePunch).toEqual(preset.holePunch);
      expect(doc.cornerRadiusMm).toBe(preset.cornerRadiusMm);

      const flat = flatten(doc);
      expect(flat).toMatchObject({
        width: preset.width,
        height: preset.height,
      });
      expect(flat.layout.map(e => e.top)).toEqual(
        (preset.sampleLayout ?? []).map(e => e.top),
      );
    },
  );

  it("places a supplied layout instead of the preset default", () => {
    const doc = createDocumentFromPreset(PRESETS[1], [entry(7), entry(8)]);
    expect(doc.pages.map(p => p.fields.length)).toEqual([0, 2]);
  });

  it("builds an empty document from a preset without a sample layout", () => {
    const doc = createDocumentFromPreset({
      key: "avery",
      label: "Avery 2 × 3",
      width: 2,
      height: 3,
      panels: 1,
      fold: "none",
      cornerRadiusMm: 0,
      holePunch: null,
    });
    expect(doc.pages.map(p => p.fields.length)).toEqual([0]);
  });
});

describe("presetSetup", () => {
  it("derives the panel size from the unfolded size and the fold", () => {
    expect(presetSetup(PRESETS[2])).toEqual({
      fold: "double",
      panelSize: { width: 4, height: 5.5 },
      holePunch: null,
      cornerRadiusMm: 3,
    });
  });
});

const SLOT_PUNCH = {
  shape: "rect" as const,
  count: 3,
  widthMm: 16,
  heightMm: 4,
  pitchMm: 34,
  topOffsetMm: 5,
};

describe("createBadgeDocument", () => {
  it.each([
    ["none", 1, 3],
    ["single", 2, 1.5],
    ["double", 3, 1],
  ] as const)(
    "builds %s-fold pages of the unfolded height split evenly",
    (fold, pages, panelHeight) => {
      const spec: BadgeSpec = {
        width: 2,
        height: 3,
        fold,
        holePunch: null,
        cornerRadiusMm: 0,
      };
      const doc = createBadgeDocument(spec);
      expect(doc.fold).toBe(fold);
      expect(doc.panelSize).toEqual({ width: 2, height: panelHeight });
      expect(doc.pages).toHaveLength(pages);
      expect(doc.pages.every(p => p.fields.length === 0)).toBe(true);
      expect(flatten(doc)).toMatchObject({ width: 2, height: 3, layout: [] });
    },
  );

  it("carries the hole punch and corner radius", () => {
    const doc = createBadgeDocument({
      width: 4,
      height: 12,
      fold: "single",
      holePunch: SLOT_PUNCH,
      cornerRadiusMm: 3,
    });
    expect(doc.holePunch).toEqual(SLOT_PUNCH);
    expect(doc.cornerRadiusMm).toBe(3);
  });

  it("flattens a placed sample layout back to itself", () => {
    const layout: LegacyLayoutEntry[] = [
      {
        top: 0.5,
        left: 0.25,
        field: "first_name",
        scale: 1.125,
        height: 0.42,
        width: 3.5,
        fontSize: 36,
        numLines: 1,
        textAlign: "center",
        inverted: false,
        userEditable: true,
      },
      entry(3),
      entry(7),
      {
        top: 11.5,
        left: 0.4,
        field: "tickets",
        height: 4,
        width: 3.2,
        numRows: 4,
        inverted: false,
      },
    ];
    const doc = createBadgeDocument(
      {
        width: 4,
        height: 16.5,
        fold: "double",
        holePunch: null,
        cornerRadiusMm: 0,
      },
      layout,
    );
    expect(doc.pages.map(p => p.fields.length)).toEqual([2, 1, 1]);
    const flat = flatten(doc).layout;
    expect(flat).toHaveLength(layout.length);
    layout.forEach((original, i) => {
      const { top, ...rest } = flat[i];
      const { top: originalTop, ...originalRest } = original;
      expect(top).toBeCloseTo(originalTop, 9);
      expect(rest).toEqual(originalRest);
    });
  });
});
