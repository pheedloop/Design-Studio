import {
  PAGE_COUNT,
  type BadgeLimits,
  type BadgePage,
  type FoldType,
  type HolePunch,
  type HolePunchShape,
} from "./model";
import { foldInvertForPage } from "./serialize";
import {
  DEFAULT_TEARAWAYS,
  type BadgeSetup,
  type PanelConfig,
} from "./badgeSetup";
import type { PresetSetup } from "./presets";

export interface SetupDraft {
  presetKey: string;
  fold: FoldType;
  panelSize: { width: number; height: number };
  panels: PanelConfig[];
  holePunch: HolePunch | null;
  cornerRadiusMm: number;
  lastHolePunch: HolePunch | null;
}

export type PunchMeasure = Exclude<keyof HolePunch, "shape">;

export type SetupDraftAction =
  | { type: "preset"; key: string; setup: PresetSetup }
  | { type: "fold"; fold: FoldType }
  | { type: "width"; width: number }
  | { type: "height"; height: number }
  | { type: "panel"; index: number; patch: Partial<PanelConfig> }
  | { type: "punchShape"; shape: HolePunchShape | null }
  | { type: "punch"; key: PunchMeasure; value: number }
  | { type: "cornerRadius"; cornerRadiusMm: number };

const DEFAULT_HOLE_PUNCH: Record<HolePunchShape, HolePunch> = {
  circle: {
    shape: "circle",
    count: 2,
    widthMm: 4,
    heightMm: 4,
    pitchMm: 69,
    topOffsetMm: 5,
  },
  rect: {
    shape: "rect",
    count: 2,
    widthMm: 16,
    heightMm: 4,
    pitchMm: 34,
    topOffsetMm: 5,
  },
};

function panelsForFold(
  existing: (PanelConfig | undefined)[],
  fold: FoldType,
): PanelConfig[] {
  return Array.from(
    { length: PAGE_COUNT[fold] },
    (_, i) =>
      existing[i] ?? {
        inverted: foldInvertForPage(fold, i),
        tearaway: false,
        tearawayCount: DEFAULT_TEARAWAYS,
      },
  );
}

export function initSetupDraft(current: {
  fold: FoldType;
  panelSize: { width: number; height: number };
  pages: BadgePage[];
  holePunch: HolePunch | null;
  cornerRadiusMm: number;
}): SetupDraft {
  const { fold, pages, holePunch, cornerRadiusMm } = current;
  return {
    presetKey: "",
    fold,
    panelSize: current.panelSize,
    panels: panelsForFold(
      pages.map((page, i) => ({
        inverted: page.inverted ?? foldInvertForPage(fold, i),
        tearaway: page.tearaway ?? false,
        tearawayCount: page.tearawayCount ?? DEFAULT_TEARAWAYS,
      })),
      fold,
    ),
    holePunch,
    cornerRadiusMm,
    lastHolePunch: holePunch,
  };
}

function leavePreset(draft: SetupDraft): SetupDraft {
  return draft.presetKey ? { ...draft, presetKey: "" } : draft;
}

function withHolePunch(
  draft: SetupDraft,
  holePunch: HolePunch | null,
): Pick<SetupDraft, "holePunch" | "lastHolePunch"> {
  return { holePunch, lastHolePunch: holePunch ?? draft.lastHolePunch };
}

export function setupDraftReducer(
  draft: SetupDraft,
  action: SetupDraftAction,
): SetupDraft {
  switch (action.type) {
    case "preset": {
      const { setup } = action;
      return {
        ...draft,
        presetKey: action.key,
        fold: setup.fold,
        panelSize: setup.panelSize,
        panels: panelsForFold(draft.panels, setup.fold),
        ...withHolePunch(draft, setup.holePunch),
        cornerRadiusMm: setup.cornerRadiusMm,
      };
    }
    case "fold":
      if (action.fold === draft.fold) return draft;
      return {
        ...leavePreset(draft),
        fold: action.fold,
        panels: panelsForFold(draft.panels, action.fold),
      };
    case "width":
      if (action.width === draft.panelSize.width) return draft;
      return {
        ...leavePreset(draft),
        panelSize: { ...draft.panelSize, width: action.width },
      };
    case "height":
      if (action.height === draft.panelSize.height) return draft;
      return {
        ...leavePreset(draft),
        panelSize: { ...draft.panelSize, height: action.height },
      };
    case "panel":
      return {
        ...draft,
        panels: draft.panels.map((p, i) =>
          i === action.index ? { ...p, ...action.patch } : p,
        ),
      };
    case "punchShape": {
      const { shape } = action;
      if (shape === (draft.holePunch?.shape ?? null)) return draft;
      const base = draft.holePunch ?? draft.lastHolePunch;
      return {
        ...leavePreset(draft),
        ...withHolePunch(
          draft,
          shape && (base ? { ...base, shape } : DEFAULT_HOLE_PUNCH[shape]),
        ),
      };
    }
    case "punch": {
      const { holePunch } = draft;
      if (!holePunch || Object.is(holePunch[action.key], action.value)) {
        return draft;
      }
      return {
        ...leavePreset(draft),
        ...withHolePunch(draft, { ...holePunch, [action.key]: action.value }),
      };
    }
    case "cornerRadius":
      if (Object.is(action.cornerRadiusMm, draft.cornerRadiusMm)) return draft;
      return { ...leavePreset(draft), cornerRadiusMm: action.cornerRadiusMm };
  }
}

export function draftToSetup(draft: SetupDraft): BadgeSetup {
  const { fold, panelSize, panels, holePunch, cornerRadiusMm } = draft;
  return { fold, panelSize, panels, holePunch, cornerRadiusMm };
}

export interface SetupSizeErrors {
  width: boolean;
  printedHeight: boolean;
}

export function setupSizeErrors(
  draft: Pick<SetupDraft, "fold" | "panelSize">,
  limits: BadgeLimits | undefined,
): SetupSizeErrors {
  if (!limits) return { width: false, printedHeight: false };
  const { width, height } = draft.panelSize;
  return {
    width: width > limits.maxDimensionIn,
    printedHeight: height * PAGE_COUNT[draft.fold] > limits.maxDimensionIn,
  };
}

export type SpecError =
  "positive" | "nonNegative" | "count" | "wholeNumber" | "maxMm";

export type SetupSpecErrors = Partial<
  Record<PunchMeasure | "cornerRadiusMm", SpecError>
>;

function measureError(
  value: number,
  min: "positive" | "nonNegative",
  max: number | undefined,
): SpecError | undefined {
  if (!Number.isFinite(value)) return min;
  if (min === "positive" ? value <= 0 : value < 0) return min;
  if (max !== undefined && value > max) return "maxMm";
  return undefined;
}

function countError(
  count: number,
  limits: BadgeLimits | undefined,
): SpecError | undefined {
  if (!limits) {
    return Number.isInteger(count) && count > 0 ? undefined : "wholeNumber";
  }
  const valid =
    Number.isInteger(count) &&
    count >= limits.minHolePunchCount &&
    count <= limits.maxHolePunchCount;
  return valid ? undefined : "count";
}

export function setupSpecErrors(
  draft: Pick<SetupDraft, "holePunch" | "cornerRadiusMm">,
  limits: BadgeLimits | undefined,
): SetupSpecErrors {
  const { holePunch } = draft;
  const maxMm = limits?.maxHolePunchMm;
  const errors: SetupSpecErrors = {
    cornerRadiusMm: measureError(
      draft.cornerRadiusMm,
      "nonNegative",
      limits?.maxCornerRadiusMm,
    ),
  };
  if (holePunch) {
    errors.count = countError(holePunch.count, limits);
    errors.widthMm = measureError(holePunch.widthMm, "positive", maxMm);
    errors.heightMm = measureError(holePunch.heightMm, "positive", maxMm);
    errors.pitchMm = measureError(holePunch.pitchMm, "nonNegative", maxMm);
    errors.topOffsetMm = measureError(
      holePunch.topOffsetMm,
      "nonNegative",
      maxMm,
    );
  }
  return errors;
}
