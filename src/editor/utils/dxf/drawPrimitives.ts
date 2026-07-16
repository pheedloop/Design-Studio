import type { DxfPrimitive } from "../../../types";

/** Minimal 2D-context surface used by the renderer. Both a real
 *  CanvasRenderingContext2D (dialog preview) and Konva's sceneFunc context
 *  satisfy this structurally, so the same draw routine serves editor, viewer,
 *  and preview without any parser dependency. */
export interface DrawContext {
  strokeStyle: string;
  fillStyle: string;
  lineWidth: number;
  font: string;
  textBaseline: string;
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  closePath(): void;
  stroke(): void;
  arc(x: number, y: number, r: number, start: number, end: number, ccw?: boolean): void;
  fillText(text: string, x: number, y: number): void;
  save(): void;
  restore(): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
}

/** Muted slate so the imported drawing reads as a background reference and
 *  booths drawn on top stand out. */
export const DEFAULT_DXF_STROKE = "#475569";

export interface DrawOptions {
  stroke?: string;
  lineWidth?: number;
  /** DXF layer names to skip. Unused in v1 (all layers imported); wired so a
   *  future cleanup pass can hide layers without re-importing. */
  hiddenLayers?: Set<string>;
}

/** Paint DXF primitives (already baked to canvas pixels) into a 2D context. */
export function drawPrimitives(
  ctx: DrawContext,
  primitives: DxfPrimitive[],
  opts: DrawOptions = {}
): void {
  const stroke = opts.stroke ?? DEFAULT_DXF_STROKE;
  const lineWidth = opts.lineWidth ?? 1;
  const hidden = opts.hiddenLayers;

  ctx.strokeStyle = stroke;
  ctx.fillStyle = stroke;
  ctx.lineWidth = lineWidth;

  for (const p of primitives) {
    if (hidden?.has(p.layer)) continue;

    if (p.kind === "line" || p.kind === "polyline") {
      const pts = p.points;
      if (!pts || pts.length < 4) continue;
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
      if (p.closed) ctx.closePath();
      ctx.stroke();
    } else if (p.kind === "circle" && p.cx != null && p.cy != null && p.r != null) {
      ctx.beginPath();
      ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.kind === "text" && p.text && p.x != null && p.y != null && p.height) {
      ctx.save();
      ctx.font = `${Math.max(1, p.height)}px sans-serif`;
      ctx.textBaseline = "alphabetic";
      if (p.rotation) {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillText(p.text, 0, 0);
      } else {
        ctx.fillText(p.text, p.x, p.y);
      }
      ctx.restore();
    }
  }
}
