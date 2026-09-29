import { DPI, type BadgeField } from "./model";

// Canvas renders at 96px per inch (the legacy DPI); zoom is layered on top via
// useCanvasControls' `scale`.
export const PPI = DPI;
export const QR_BASE_PX = 75;

export function fieldSizePx(
  field: Pick<BadgeField, "kind" | "scale" | "width" | "height">,
): { w: number; h: number } {
  if (field.kind === "qrCode") {
    const s = QR_BASE_PX * (field.scale ?? 1);
    return { w: s, h: s };
  }
  return { w: (field.width ?? 2) * PPI, h: (field.height ?? 0.3) * PPI };
}

const MM_PER_INCH = 25.4;

export const mmToPx = (mm: number): number => (mm / MM_PER_INCH) * PPI;

const EDGE_TOLERANCE_IN = 1e-6;

/** Any part of the field's rendered box lies outside its panel. Such fields do not print. */
export function isFieldOutsidePanel(
  field: Pick<
    BadgeField,
    "kind" | "scale" | "width" | "height" | "top" | "left"
  >,
  panel: { width: number; height: number },
): boolean {
  const { w, h } = fieldSizePx(field);
  return (
    field.top < -EDGE_TOLERANCE_IN ||
    field.left < -EDGE_TOLERANCE_IN ||
    field.top + h / PPI > panel.height + EDGE_TOLERANCE_IN ||
    field.left + w / PPI > panel.width + EDGE_TOLERANCE_IN
  );
}
