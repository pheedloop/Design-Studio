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
