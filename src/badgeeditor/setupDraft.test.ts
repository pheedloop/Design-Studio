import { describe, expect, it } from "vitest";
import { initSetupDraft, setupDraftReducer } from "./setupDraft";
import type { HolePunch } from "./model";

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

  it("ignores edits that change nothing", () => {
    expect(
      setupDraftReducer(withPreset, { type: "fold", fold: "single" }),
    ).toBe(withPreset);
    expect(setupDraftReducer(withPreset, { type: "width", width: 4 })).toBe(
      withPreset,
    );
    expect(setupDraftReducer(withPreset, { type: "height", height: 5.5 })).toBe(
      withPreset,
    );
  });

  it("leaves the preset and restores the incoming punch and radius on a real edit", () => {
    const edited = setupDraftReducer(withPreset, { type: "width", width: 3 });
    expect(edited).toMatchObject({
      presetKey: "",
      panelSize: { width: 3, height: 5.5 },
      holePunch: null,
      cornerRadiusMm: 1,
    });
  });

  it("rebuilds panels on a fold change", () => {
    const folded = setupDraftReducer(initial, { type: "fold", fold: "double" });
    expect(folded.panels).toHaveLength(3);
    expect(folded.presetKey).toBe("");
  });

  it("patches one panel", () => {
    const patched = setupDraftReducer(withPreset, {
      type: "panel",
      index: 1,
      patch: { tearaway: true },
    });
    expect(patched.panels[1].tearaway).toBe(true);
    expect(patched.presetKey).toBe("directThermal");
  });
});
