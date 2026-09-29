import { describe, expect, it } from "vitest";
import {
  createBadgeDocument,
  createDocumentFromPreset,
  presetSetup,
} from "./presets";
import { flatten } from "./serialize";
import type { BadgePreset, LegacyLayoutEntry } from "./model";

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

describe("createBadgeDocument sample fields", () => {
  it("fits a field taller than its panel so it prints", () => {
    const tickets: LegacyLayoutEntry = {
      top: 10.76,
      left: 0.41,
      field: "tickets",
      height: 5.59,
      width: 3.18,
      numRows: 4,
    };
    const doc = createBadgeDocument(
      {
        width: 4,
        height: 16.5,
        fold: "double",
        holePunch: null,
        cornerRadiusMm: 0,
      },
      [tickets],
    );
    expect(doc.pages[2].fields[0]).toMatchObject({ top: 0, height: 5.5 });
    expect(flatten(doc).layout.map(e => e.field)).toEqual(["tickets"]);
  });
});
