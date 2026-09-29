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

type PlacedField = Pick<
  BadgeField,
  "kind" | "scale" | "width" | "height" | "top" | "left"
>;

// Guards exact-edge boxes against float error so they still count as inside.
const EPSILON_IN = 1e-6;

/**
 * Some part of the field's rendered box lies more than `allowanceIn` outside
 * its panel. Such fields do not print. The host supplies the allowance (e.g.
 * the printer's overshoot tolerance) — Design Studio holds no default of its
 * own beyond a strict fit.
 */
export function isFieldOutsidePanel(
  field: PlacedField,
  panel: { width: number; height: number },
  allowanceIn = 0,
): boolean {
  const { w, h } = fieldSizePx(field);
  const limit = allowanceIn + EPSILON_IN;
  return (
    field.top < -limit ||
    field.left < -limit ||
    field.top + h / PPI > panel.height + limit ||
    field.left + w / PPI > panel.width + limit
  );
}

export interface PanelBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const clampAxis = (start: number, size: number, panelSize: number) =>
  size > panelSize ? start : Math.min(Math.max(start, 0), panelSize - size);

/** Move the box the least distance that puts it inside the panel, on each axis it fits. */
export function clampToPanel(
  box: PanelBox,
  panel: { width: number; height: number },
): { x: number; y: number } {
  return {
    x: clampAxis(box.x, box.width, panel.width),
    y: clampAxis(box.y, box.height, panel.height),
  };
}

/** Union of the fields' rendered boxes, in inches. */
export function fieldsBounds(fields: PlacedField[]): PanelBox | null {
  if (!fields.length) return null;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const f of fields) {
    const { w, h } = fieldSizePx(f);
    minX = Math.min(minX, f.left);
    minY = Math.min(minY, f.top);
    maxX = Math.max(maxX, f.left + w / PPI);
    maxY = Math.max(maxY, f.top + h / PPI);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Shift the fields together until their bounds sit inside the panel. */
export function clampFieldsToPanel<F extends PlacedField>(
  fields: F[],
  panel: { width: number; height: number },
): F[] {
  const bounds = fieldsBounds(fields);
  if (!bounds) return fields;
  const to = clampToPanel(bounds, panel);
  const dx = to.x - bounds.x;
  const dy = to.y - bounds.y;
  return fields.map(f => ({ ...f, left: f.left + dx, top: f.top + dy }));
}

/**
 * Stop the edges a Konva Transformer anchor moves at the panel's edges. An edge
 * already past the panel may stay there but not go further. `keepRatio` scales
 * both axes by the tighter limit, about the corner the anchor does not move.
 */
export function clampResizeToPanel(
  oldBox: PanelBox,
  newBox: PanelBox,
  panel: { width: number; height: number },
  anchor: string,
  keepRatio: boolean,
): PanelBox {
  const right = newBox.x + newBox.width;
  const bottom = newBox.y + newBox.height;
  const movesLeft = anchor.includes("left");
  const movesTop = anchor.includes("top");
  const maxW = movesLeft
    ? right - Math.min(0, oldBox.x)
    : anchor.includes("right")
      ? Math.max(panel.width, oldBox.x + oldBox.width) - newBox.x
      : Infinity;
  const maxH = movesTop
    ? bottom - Math.min(0, oldBox.y)
    : anchor.includes("bottom")
      ? Math.max(panel.height, oldBox.y + oldBox.height) - newBox.y
      : Infinity;
  let width = Math.min(newBox.width, maxW);
  let height = Math.min(newBox.height, maxH);
  if (keepRatio) {
    const s = Math.min(width / newBox.width, height / newBox.height);
    width = newBox.width * s;
    height = newBox.height * s;
  }
  return {
    x: movesLeft ? right - width : newBox.x,
    y: movesTop ? bottom - height : newBox.y,
    width,
    height,
  };
}
