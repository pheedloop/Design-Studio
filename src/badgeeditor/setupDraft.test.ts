import { describe, expect, it, vi } from "vitest";
import {
  initSetupDraft,
  setupDraftReducer,
  setupErrors,
  type BadgeSetupValues,
  type SetupDraft,
  type SetupDraftAction,
} from "./setupDraft";
import type { BadgePreset, HolePunch } from "./model";

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
    [
      "an unchanged shape",
      { type: "punchShape", shape: "circle", presets: [] },
      true,
      {},
    ],
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
      { type: "punchShape", shape: "rect", presets: [] },
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

  const SLOT: HolePunch = { ...ROUND, shape: "rect", widthMm: 12 };
  const PRESETS = [ROUND, SLOT].map((holePunch, i): BadgePreset => ({
    key: `p${i}`,
    label: `P${i}`,
    width: 4,
    height: 3,
    fold: "none",
    holePunch,
    cornerRadiusMm: 0,
  }));

  it.each([
    [
      "the demo default with no earlier punch or preset",
      initial,
      [],
      {
        shape: "rect",
        count: 2,
        widthMm: 16,
        heightMm: 4,
        pitchMm: 34,
        topOffsetMm: 5,
      },
    ],
    ["the first preset with that shape", initial, PRESETS, SLOT],
    [
      "the last punch after None",
      setupDraftReducer(withPreset, {
        type: "punchShape",
        shape: null,
        presets: PRESETS,
      }),
      PRESETS,
      { ...ROUND, shape: "rect" },
    ],
  ] as [string, SetupDraft, BadgePreset[], HolePunch][])(
    "starts a punch from %s",
    (_, draft, presets, expected) => {
      expect(
        setupDraftReducer(draft, { type: "punchShape", shape: "rect", presets })
          .holePunch,
      ).toEqual(expected);
    },
  );
});

const VALUES: BadgeSetupValues = {
  panelWidth: 3.5,
  panelHeight: 3,
  fold: "none",
  holePunch: ROUND,
  cornerRadiusMm: 1,
};

const draftOf = (values: BadgeSetupValues) => ({
  fold: values.fold,
  panelSize: { width: values.panelWidth, height: values.panelHeight },
  holePunch: values.holePunch,
  cornerRadiusMm: values.cornerRadiusMm,
});

describe("setupErrors", () => {
  it.each([
    [
      "the host's messages",
      VALUES,
      { pitchMm: "Too far" },
      { pitchMm: "Too far" },
    ],
    ["nothing when the host finds no error", VALUES, {}, {}],
    [
      "not-a-number fields without a host check",
      {
        ...VALUES,
        panelWidth: NaN,
        holePunch: { ...ROUND, count: NaN, topOffsetMm: 0 },
        cornerRadiusMm: -1,
      },
      undefined,
      { panelWidth: "NaN", count: "NaN" },
    ],
    [
      "no punch fields without a punch",
      { ...VALUES, holePunch: null },
      undefined,
      {},
    ],
  ] as const)("returns %s", (_, values, hostErrors, expected) => {
    const validateSetup = hostErrors && vi.fn(() => hostErrors);
    expect(setupErrors(draftOf(values), validateSetup, "NaN")).toEqual(
      expected,
    );
    if (validateSetup) expect(validateSetup).toHaveBeenCalledWith(values);
  });
});
