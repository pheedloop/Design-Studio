import type { MeasureText } from "./sessionLayout";

let ctx: CanvasRenderingContext2D | null | undefined;

function context(): CanvasRenderingContext2D | null {
  if (ctx === undefined) {
    ctx =
      typeof document === "undefined"
        ? null
        : document.createElement("canvas").getContext("2d");
  }
  return ctx;
}

/**
 * Width WeasyPrint's hinted render gives `text`: each glyph's kerned advance
 * rounded to a whole px, summed. The canvas gives the same advances unrounded,
 * which runs up to ~3% wider over a line (checked against WeasyPrint 52.5 for
 * Roboto Condensed Bold at 6, 7 and 8 pt: every sample matched).
 */
export function canvasTextMeasure(fontFamily: string): MeasureText {
  return (text, fontPx) => {
    const c = context();
    if (!c) return text.length * fontPx * 0.5;
    c.font = `bold ${fontPx}px ${fontFamily}`;
    const chars = [...text];
    return chars.reduce((sum, ch, i) => {
      const next = chars[i + 1];
      const advance =
        next === undefined
          ? c.measureText(ch).width
          : c.measureText(ch + next).width - c.measureText(next).width;
      return sum + Math.round(advance);
    }, 0);
  };
}

/** Sum of each glyph's own advance: the width Konva draws with letterSpacing set. */
export function canvasGlyphSum(fontFamily: string): MeasureText {
  return (text, fontPx) => {
    const c = context();
    if (!c) return text.length * fontPx * 0.5;
    c.font = `bold ${fontPx}px ${fontFamily}`;
    return [...text].reduce((sum, ch) => sum + c.measureText(ch).width, 0);
  };
}
