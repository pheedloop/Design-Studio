import {
  PAGE_COUNT,
  type BadgePage,
  type BadgePreset,
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

export const PUNCH_MEASURES: PunchMeasure[] = [
  "count",
  "widthMm",
  "heightMm",
  "pitchMm",
  "topOffsetMm",
];

export type SetupDraftAction =
  | { type: "preset"; key: string; setup: PresetSetup }
  | { type: "fold"; fold: FoldType }
  | { type: "width"; width: number }
  | { type: "height"; height: number }
  | { type: "panel"; index: number; patch: Partial<PanelConfig> }
  | {
      type: "punchShape";
      shape: HolePunchShape | null;
      presets: BadgePreset[];
    }
  | { type: "punch"; key: PunchMeasure; value: number }
  | { type: "cornerRadius"; cornerRadiusMm: number };

const DEMO_HOLE_PUNCH: Record<HolePunchShape, HolePunch> = {
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

function defaultHolePunch(
  shape: HolePunchShape,
  presets: BadgePreset[],
): HolePunch {
  return (
    presets.find(p => p.holePunch?.shape === shape)?.holePunch ??
    DEMO_HOLE_PUNCH[shape]
  );
}

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
      if (Object.is(action.width, draft.panelSize.width)) return draft;
      return {
        ...leavePreset(draft),
        panelSize: { ...draft.panelSize, width: action.width },
      };
    case "height":
      if (Object.is(action.height, draft.panelSize.height)) return draft;
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
          shape &&
            (base
              ? { ...base, shape }
              : defaultHolePunch(shape, action.presets)),
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

export interface BadgeSetupValues {
  /** Panel size is in inches. A measure is NaN when its input is not a number. */
  panelWidth: number;
  panelHeight: number;
  fold: FoldType;
  holePunch: HolePunch | null;
  cornerRadiusMm: number;
}

export type BadgeSetupField =
  "panelWidth" | "panelHeight" | PunchMeasure | "cornerRadiusMm";

export type BadgeSetupErrors = Partial<Record<BadgeSetupField, string>>;

export type ValidateBadgeSetup = (setup: BadgeSetupValues) => BadgeSetupErrors;

export function setupErrors(
  draft: Pick<
    SetupDraft,
    "fold" | "panelSize" | "holePunch" | "cornerRadiusMm"
  >,
  validateSetup: ValidateBadgeSetup | undefined,
  notANumber: string,
): BadgeSetupErrors {
  const { fold, panelSize, holePunch, cornerRadiusMm } = draft;
  const values: BadgeSetupValues = {
    panelWidth: panelSize.width,
    panelHeight: panelSize.height,
    fold,
    holePunch,
    cornerRadiusMm,
  };
  if (validateSetup) return validateSetup(values);
  const measures: [BadgeSetupField, number][] = [
    ["panelWidth", panelSize.width],
    ["panelHeight", panelSize.height],
    ["cornerRadiusMm", cornerRadiusMm],
    ...(holePunch
      ? PUNCH_MEASURES.map((key): [BadgeSetupField, number] => [
          key,
          holePunch[key],
        ])
      : []),
  ];
  return Object.fromEntries(
    measures
      .filter(([, value]) => !Number.isFinite(value))
      .map(([field]) => [field, notANumber]),
  );
}
