import { describe, expect, it } from "vitest";
import { createSurfaceI18n } from "@/i18n/context";
import { interpolate } from "@/i18n/interpolate";
import type { CommonT } from "@/i18n/types";
import { COMMON } from "@/i18n/strings";
import type { Dimensions } from "@/types";
import {
  formatArea,
  formatMeasurement,
  formatRouteDistance,
  formatWalkingTime,
} from "./unitConversion";

const { defaultTranslate: t, resolveEnglish } = createSurfaceI18n({
  common: COMMON,
});

/** The host adapter shape from the README, over a catalogue keyed by English. */
const adapt =
  (catalogue: Record<string, string>): CommonT =>
  (key, vars) => {
    const english = resolveEnglish(key, vars);
    return interpolate(catalogue[english] ?? english, vars);
  };

const px: Dimensions = {
  width: 100,
  height: 100,
  unit: "px",
  pixelsPerUnit: 1,
};
const feet: Dimensions = {
  width: 100,
  height: 100,
  unit: "ft",
  pixelsPerUnit: 10,
};
const metres: Dimensions = {
  width: 100,
  height: 100,
  unit: "m",
  pixelsPerUnit: 10,
};

describe("formatMeasurement", () => {
  it("rounds pixels and uses the px unit", () => {
    expect(formatMeasurement(123.4, px, t)).toBe("123 px");
  });

  it("converts to real units with one decimal", () => {
    expect(formatMeasurement(125, feet, t)).toBe("12.5 ft");
    expect(formatMeasurement(125, metres, t)).toBe("12.5 m");
  });

  it("uses the locale's decimal separator", () => {
    // The bug this replaced: toFixed always emitted a period, which reads as a
    // thousands separator in fr/de.
    expect(formatMeasurement(125, feet, t, "fr-FR")).toBe("12,5 ft");
  });
});

describe("formatArea", () => {
  it("rounds pixel areas", () => {
    expect(formatArea(10, 20, px, t)).toBe("200 sq px");
  });

  it("converts to real units with one decimal", () => {
    expect(formatArea(100, 100, feet, t)).toBe("100.0 sq ft");
  });

  it("uses the locale's decimal separator", () => {
    expect(formatArea(100, 100, feet, t, "fr-FR")).toBe("100,0 sq ft");
  });
});

describe("formatRouteDistance", () => {
  it("sums the path and formats it", () => {
    const path = [
      { x: 0, y: 0 },
      { x: 30, y: 40 }, // 50px
      { x: 30, y: 90 }, // +50px
    ];
    expect(formatRouteDistance(path, feet, t)).toBe("10.0 ft");
  });

  it("is zero for a single point", () => {
    expect(formatRouteDistance([{ x: 5, y: 5 }], px, t)).toBe("0 px");
  });
});

describe("formatWalkingTime", () => {
  it("reports under a minute rather than zero", () => {
    expect(formatWalkingTime({ minutes: 0, seconds: 30 }, t)).toBe("< 1 min");
  });

  it("approximates whole minutes", () => {
    expect(formatWalkingTime({ minutes: 1, seconds: 0 }, t)).toBe("~1 min");
    expect(formatWalkingTime({ minutes: 7, seconds: 0 }, t)).toBe("~7 min");
  });
});

describe("translator wiring", () => {
  // A catalogue keyed by the English source — the shape Charmander's UGC uses.
  const fr = adapt({
    ft: "pi",
    "{{value}} sq {{unit}}": "{{value}} {{unit}} carré",
    "~{{count}} min": "~{{count}} minutes",
  });

  it("routes the unit through the manifest, so a host can localise it", () => {
    expect(formatMeasurement(125, feet, fr, "fr-FR")).toBe("12,5 pi");
  });

  it("lets a translation reorder the value and the unit", () => {
    expect(formatArea(100, 100, feet, fr, "fr-FR")).toBe("100,0 pi carré");
  });

  it("translates both walking-time forms", () => {
    expect(formatWalkingTime({ minutes: 0, seconds: 5 }, fr)).toBe("< 1 min");
    expect(formatWalkingTime({ minutes: 4, seconds: 0 }, fr)).toBe(
      "~4 minutes",
    );
  });
});
