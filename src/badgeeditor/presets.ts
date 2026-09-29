import {
  PAGE_COUNT,
  type BadgeDocument,
  type BadgePreset,
  type BadgeSpec,
  type FoldType,
  type HolePunch,
  type LegacyLayoutEntry,
} from "./model";
import { inflate } from "./serialize";
import { PPI, QR_BASE_PX, fieldSizePx } from "./canvasMetrics";
import type { BadgeField } from "./model";

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

/** Shrink and move a starting field so it prints: fields outside their panel do not. */
function fitInPanel(
  field: BadgeField,
  panel: { width: number; height: number },
): BadgeField {
  const fitted =
    field.kind === "qrCode"
      ? {
          ...field,
          scale: Math.min(
            field.scale ?? 1,
            (Math.min(panel.width, panel.height) * PPI) / QR_BASE_PX,
          ),
        }
      : {
          ...field,
          width: Math.min(field.width ?? 2, panel.width),
          height: Math.min(field.height ?? 0.3, panel.height),
        };
  const { w, h } = fieldSizePx(fitted);
  return {
    ...fitted,
    top: Math.min(Math.max(fitted.top, 0), panel.height - h / PPI),
    left: Math.min(Math.max(fitted.left, 0), panel.width - w / PPI),
  };
}

export function createBadgeDocument(
  spec: BadgeSpec,
  layout: LegacyLayoutEntry[] = [],
): BadgeDocument {
  const doc = inflate(layout, {
    width: spec.width,
    height: spec.height,
    fold: spec.fold,
  });
  return {
    ...doc,
    pages: doc.pages.map(page => ({
      ...page,
      fields: page.fields.map(f => fitInPanel(f, doc.panelSize)),
    })),
    holePunch: spec.holePunch,
    cornerRadiusMm: spec.cornerRadiusMm,
  };
}

export function createDocumentFromPreset(
  preset: BadgePreset,
  layout?: LegacyLayoutEntry[],
): BadgeDocument {
  return createBadgeDocument(preset, layout ?? preset.sampleLayout);
}
