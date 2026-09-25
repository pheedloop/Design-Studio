import {
  PAGE_COUNT,
  type BadgePage,
  type FoldType,
  type HolePunch,
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
  origin: { holePunch: HolePunch | null; cornerRadiusMm: number };
}

export type SetupDraftAction =
  | { type: "preset"; key: string; setup: PresetSetup }
  | { type: "fold"; fold: FoldType }
  | { type: "width"; width: number }
  | { type: "height"; height: number }
  | { type: "panel"; index: number; patch: Partial<PanelConfig> };

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
    origin: { holePunch, cornerRadiusMm },
  };
}

function leavePreset(draft: SetupDraft): SetupDraft {
  if (!draft.presetKey) return draft;
  return { ...draft, presetKey: "", ...draft.origin };
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
        holePunch: setup.holePunch,
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
  }
}

export function draftToSetup(draft: SetupDraft): BadgeSetup {
  const { fold, panelSize, panels, holePunch, cornerRadiusMm } = draft;
  return { fold, panelSize, panels, holePunch, cornerRadiusMm };
}
