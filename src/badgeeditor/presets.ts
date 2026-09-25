import {
  PAGE_COUNT,
  type BadgeDocument,
  type BadgePreset,
  type FoldType,
  type HolePunch,
  type LegacyLayoutEntry,
} from "./model";
import { inflate } from "./serialize";

export interface PresetSetup {
  fold: FoldType;
  panelSize: { width: number; height: number };
  holePunch: HolePunch | null;
  cornerRadiusMm: number;
}

export function presetSetup(preset: BadgePreset): PresetSetup {
  return {
    fold: preset.fold,
    panelSize: {
      width: preset.width,
      height: preset.height / PAGE_COUNT[preset.fold],
    },
    holePunch: preset.holePunch,
    cornerRadiusMm: preset.cornerRadiusMm,
  };
}

export function createDocumentFromPreset(
  preset: BadgePreset,
  layout?: LegacyLayoutEntry[],
): BadgeDocument {
  return {
    ...inflate(layout ?? preset.defaultLayout, {
      width: preset.width,
      height: preset.height,
      fold: preset.fold,
    }),
    holePunch: preset.holePunch,
    cornerRadiusMm: preset.cornerRadiusMm,
  };
}
