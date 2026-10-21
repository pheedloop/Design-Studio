import {
  BACKEND_REFERENCE_FONT_SIZE,
  inchToPx,
  type BadgeField,
} from "./model";
import { PPI } from "./canvasMetrics";

// Mirrors pikachu's badge_generator._render_text_field. The editor flattens a
// field with scale = fontSize / BACKEND_REFERENCE_FONT_SIZE, so the printed
// size is fontSize * scale pt, then shrunk until the value fits the box.
const MIN_FONT_PT = 6;
const PT_PER_INCH = 72;
const CHAR_WIDTH_FACTOR = 0.6;
const SHRINK = 0.9;

export const SESSION_FONT_MAX_PT = 8;

type SizedField = Pick<
  BadgeField,
  "fontSize" | "numLines" | "width" | "height"
>;

/** Lines the generator allows: the stored numLines, else what fits the height. */
function allowedLines(field: SizedField, fontSize: number): number {
  return (
    field.numLines ??
    (field.height != null ? Math.floor(inchToPx(field.height) / fontSize) : 1)
  );
}

/** Printed point size for `text` in `field`, after shrink-to-fit. */
export function printFontPt(field: SizedField, text: string): number {
  const fontSize = field.fontSize ?? BACKEND_REFERENCE_FONT_SIZE;
  const numLines = allowedLines(field, fontSize);
  const widthIn = field.width ?? 0;
  const heightIn = field.height ?? 0;
  const length = [...text].length;

  let pt = (fontSize * fontSize) / BACKEND_REFERENCE_FONT_SIZE;
  while (pt > MIN_FONT_PT) {
    const sizeIn = pt / PT_PER_INCH;
    const charsPerLine = widthIn / (sizeIn * CHAR_WIDTH_FACTOR);
    const fitsWidth = length <= charsPerLine * numLines;
    const fitsHeight = heightIn <= 0 || sizeIn * numLines <= heightIn;
    if (fitsWidth && fitsHeight) break;
    pt *= SHRINK;
  }
  return Math.max(pt, MIN_FONT_PT);
}

/** Canvas px for printFontPt; the template prints it to one decimal of a pt. */
export function printFontPx(field: SizedField, text: string): number {
  return ptToPx(Math.round(printFontPt(field, text) * 10) / 10);
}

export const ptToPx = (pt: number): number => (pt * PPI) / PT_PER_INCH;
