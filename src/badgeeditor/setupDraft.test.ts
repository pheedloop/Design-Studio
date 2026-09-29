import { describe, expect, it } from "vitest";
import {
  initSetupDraft,
  setupDraftReducer,
  setupSizeErrors,
  setupSpecErrors,
  type SetupDraftAction,
} from "./setupDraft";
import type { BadgeLimits, HolePunch } from "./model";

const ROUND: HolePunch = {
  shape: "circle",
  count: 2,
  widthMm: 4,
  heightMm: 4,
  pitchMm: 69,
  topOffsetMm: 5,
};

const initial = initSetupDraft({
  fold: "none",
  panelSize: { width: 3.5, height: 3 },
  pages: [{ id: "front", role: "front", fields: [] }],
  holePunch: null,
  cornerRadiusMm: 1,
});

const withPreset = setupDraftReducer(initial, {
  type: "preset",
  key: "directThermal",
  setup: {
    fold: "single",
    panelSize: { width: 4, height: 5.5 },
    holePunch: ROUND,
    cornerRadiusMm: 0,
  },
});

describe("setupDraftReducer", () => {
  it("applies a preset's spec and panels", () => {
    expect(withPreset).toMatchObject({
      presetKey: "directThermal",
      fold: "single",
      panelSize: { width: 4, height: 5.5 },
      holePunch: ROUND,
      cornerRadiusMm: 0,
    });
    expect(withPreset.panels.map(p => p.inverted)).toEqual([false, true]);
  });

  it.each([
    ["an unchanged fold", { type: "fold", fold: "single" }, true, {}],
    ["an unchanged width", { type: "width", width: 4 }, true, {}],
    ["an unchanged height", { type: "height", height: 5.5 }, true, {}],
    ["an unchanged shape", { type: "punchShape", shape: "circle" }, true, {}],
    [
      "a width edit",
      { type: "width", width: 3 },
      false,
      {
        presetKey: "",
        panelSize: { width: 3, height: 5.5 },
        holePunch: ROUND,
        cornerRadiusMm: 0,
      },
    ],
    [
      "a punch edit",
      { type: "punch", key: "pitchMm", value: 70 },
      false,
      { presetKey: "", holePunch: { ...ROUND, pitchMm: 70 } },
    ],
    [
      "a shape change",
      { type: "punchShape", shape: "rect" },
      false,
      { presetKey: "", holePunch: { ...ROUND, shape: "rect" } },
    ],
    [
      "a corner radius edit",
      { type: "cornerRadius", cornerRadiusMm: 2 },
      false,
      { presetKey: "", holePunch: ROUND, cornerRadiusMm: 2 },
    ],
    [
      "a fold change",
      { type: "fold", fold: "double" },
      false,
      { presetKey: "", panels: [{}, {}, {}] },
    ],
    [
      "a panel patch",
      { type: "panel", index: 1, patch: { tearaway: true } },
      false,
      {
        presetKey: "directThermal",
        panels: [{ tearaway: false }, { tearaway: true }],
      },
    ],
  ] as [string, SetupDraftAction, boolean, object][])(
    "keeps or leaves the preset on %s",
    (_, action, same, expected) => {
      const next = setupDraftReducer(withPreset, action);
      expect(next === withPreset).toBe(same);
      expect(next).toMatchObject(expected);
    },
  );

  it.each([
    [
      "the shape default with no earlier punch",
      initial,
      {
        shape: "rect",
        count: 2,
        widthMm: 16,
        heightMm: 4,
        pitchMm: 34,
        topOffsetMm: 5,
      },
    ],
    [
      "the last punch after None",
      setupDraftReducer(withPreset, { type: "punchShape", shape: null }),
      { ...ROUND, shape: "rect" },
    ],
  ] as const)("starts a punch from %s", (_, draft, expected) => {
    expect(
      setupDraftReducer(draft, { type: "punchShape", shape: "rect" }).holePunch,
    ).toEqual(expected);
  });
});

const LIMITS: BadgeLimits = {
  maxDimensionIn: 24,
  minHolePunchCount: 1,
  maxHolePunchCount: 10,
  maxHolePunchMm: 100,
  maxCornerRadiusMm: 100,
};

describe("setupSizeErrors", () => {
  it.each([
    ["at the limit", "double", 24, 8, LIMITS, false, false],
    ["too wide", "none", 24.1, 3, LIMITS, true, false],
    ["printed height within one fold", "single", 4, 9, LIMITS, false, false],
    ["printed height across two folds", "double", 4, 9, LIMITS, false, true],
    ["no limits", "double", 100, 100, undefined, false, false],
  ] as const)(
    "flags a size %s",
    (_, fold, width, height, limits, widthError, printedHeight) => {
      expect(
        setupSizeErrors({ fold, panelSize: { width, height } }, limits),
      ).toEqual({ width: widthError, printedHeight });
    },
  );
});

describe("setupSpecErrors", () => {
  it.each([
    [
      "nothing at the limits",
      { count: 10, widthMm: 100, pitchMm: 0 },
      100,
      LIMITS,
      {},
    ],
    [
      "a count outside the limits",
      { count: 11 },
      0,
      LIMITS,
      { count: "count" },
    ],
    ["a fractional count", { count: 1.5 }, 0, LIMITS, { count: "count" }],
    ["a zero width", { widthMm: 0 }, 0, LIMITS, { widthMm: "positive" }],
    [
      "a height over the limit",
      { heightMm: 100.5 },
      0,
      LIMITS,
      { heightMm: "maxMm" },
    ],
    [
      "a negative pitch",
      { pitchMm: -1 },
      0,
      LIMITS,
      { pitchMm: "nonNegative" },
    ],
    [
      "a blank top offset",
      { topOffsetMm: NaN },
      0,
      LIMITS,
      { topOffsetMm: "nonNegative" },
    ],
    ["a radius over the limit", {}, 101, LIMITS, { cornerRadiusMm: "maxMm" }],
    [
      "no maxima without limits",
      { count: 50, widthMm: 500 },
      500,
      undefined,
      {},
    ],
    [
      "sign rules without limits",
      { count: 0, widthMm: 0, pitchMm: -1 },
      -1,
      undefined,
      {
        count: "wholeNumber",
        widthMm: "positive",
        pitchMm: "nonNegative",
        cornerRadiusMm: "nonNegative",
      },
    ],
  ] as const)("flags %s", (_, punch, cornerRadiusMm, limits, expected) => {
    expect(
      setupSpecErrors(
        { holePunch: { ...ROUND, ...punch }, cornerRadiusMm },
        limits,
      ),
    ).toEqual(expected);
  });
});
