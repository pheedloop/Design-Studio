import DxfParser from "dxf-parser";
import type {
  IArcEntity,
  ICircleEntity,
  IEllipseEntity,
  IEntity,
  IInsertEntity,
  ILineEntity,
  ILwpolylineEntity,
  IMtextEntity,
  IPoint,
  IPolylineEntity,
  ISplineEntity,
  ITextEntity,
} from "dxf-parser";
import type { DxfPrimitive, Unit } from "../../../types";

/** Number of segments used to sample a full circle; arcs/ellipses use a
 *  proportional slice. Higher = smoother but heavier. */
const SEGMENTS_PER_CIRCLE = 64;

/** DXF entity types we render. Everything else is counted and skipped. */
const SUPPORTED = new Set([
  "LINE",
  "LWPOLYLINE",
  "POLYLINE",
  "ARC",
  "CIRCLE",
  "ELLIPSE",
  "SPLINE",
  "TEXT",
  "MTEXT",
]);

export interface ParsedDxf {
  /** Primitives in DXF world space (Y up, unscaled). */
  primitives: DxfPrimitive[];
  /** Sorted, de-duplicated layer names across all imported primitives. */
  layers: string[];
  /** World-space extent of all primitives. */
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  /** Real-world unit derived from $INSUNITS, if the header declares one. */
  sourceUnits?: Unit;
  /** DXF drawing units per one `sourceUnits` (e.g. 1000 for mm→m). 1 if unknown. */
  unitsPerRealUnit: number;
  /** Count of entities whose type we do not render. */
  unsupportedCount: number;
}

/** A flattening transform applied to block (INSERT) contents:
 *  world = translate(t) ∘ rotate(rot) ∘ scale(sx, sy) · point. */
interface Transform {
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  rot: number; // radians
}

const deg2rad = (deg: number) => (deg * Math.PI) / 180;

function applyTransform(x: number, y: number, t: Transform): [number, number] {
  const sxv = x * t.sx;
  const syv = y * t.sy;
  const cos = Math.cos(t.rot);
  const sin = Math.sin(t.rot);
  return [sxv * cos - syv * sin + t.tx, sxv * sin + syv * cos + t.ty];
}

function transformPoints(points: number[], t: Transform | null): number[] {
  if (!t) return points;
  const out: number[] = [];
  for (let i = 0; i < points.length; i += 2) {
    const [x, y] = applyTransform(points[i], points[i + 1], t);
    out.push(x, y);
  }
  return out;
}

/** Sample a circular arc (radians, CCW) into a flat point list in world space. */
function sampleArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): number[] {
  let sweep = endAngle - startAngle;
  if (sweep <= 0) sweep += Math.PI * 2;
  const steps = Math.max(2, Math.ceil((sweep / (Math.PI * 2)) * SEGMENTS_PER_CIRCLE));
  const pts: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = startAngle + (sweep * i) / steps;
    pts.push(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  return pts;
}

/** Sample a (possibly partial) ellipse into a flat point list in world space. */
function sampleEllipse(e: IEllipseEntity): number[] {
  const cx = e.center.x;
  const cy = e.center.y;
  const majX = e.majorAxisEndPoint.x;
  const majY = e.majorAxisEndPoint.y;
  // Minor axis = major rotated 90°, scaled by axisRatio.
  const minX = -majY * e.axisRatio;
  const minY = majX * e.axisRatio;
  let sweep = e.endAngle - e.startAngle;
  if (sweep <= 0) sweep += Math.PI * 2;
  const steps = Math.max(2, Math.ceil((sweep / (Math.PI * 2)) * SEGMENTS_PER_CIRCLE));
  const pts: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = e.startAngle + (sweep * i) / steps;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    pts.push(cx + cos * majX + sin * minX, cy + cos * majY + sin * minY);
  }
  return pts;
}

/** Strip common MTEXT inline formatting so we render plain text. */
function stripMtextCodes(raw: string): string {
  return raw
    .replace(/\\P/g, " ") // paragraph break → space
    .replace(/\\[A-Za-z][^;]*;/g, "") // formatting commands e.g. \fArial|...;
    .replace(/[{}]/g, "")
    .trim();
}

/** Convert one supported entity to primitives in world space (after optional
 *  block transform). Unsupported types must be filtered out before this call. */
function entityToPrimitives(
  entity: IEntity,
  layer: string,
  t: Transform | null
): DxfPrimitive[] {
  switch (entity.type) {
    case "LINE": {
      const e = entity as ILineEntity;
      const pts = e.vertices.flatMap((v) => [v.x, v.y]);
      return [{ kind: "line", layer, points: transformPoints(pts, t) }];
    }
    case "LWPOLYLINE": {
      const e = entity as ILwpolylineEntity;
      const pts = e.vertices.flatMap((v) => [v.x, v.y]);
      return [{ kind: "polyline", layer, points: transformPoints(pts, t), closed: e.shape }];
    }
    case "POLYLINE": {
      const e = entity as IPolylineEntity;
      const pts = e.vertices.flatMap((v) => [v.x, v.y]);
      return [{ kind: "polyline", layer, points: transformPoints(pts, t), closed: e.shape }];
    }
    case "ARC": {
      const e = entity as IArcEntity;
      const pts = sampleArc(e.center.x, e.center.y, e.radius, e.startAngle, e.endAngle);
      return [{ kind: "polyline", layer, points: transformPoints(pts, t) }];
    }
    case "ELLIPSE": {
      const pts = sampleEllipse(entity as IEllipseEntity);
      return [{ kind: "polyline", layer, points: transformPoints(pts, t) }];
    }
    case "SPLINE": {
      const e = entity as ISplineEntity;
      const src = e.fitPoints?.length ? e.fitPoints : e.controlPoints ?? [];
      if (src.length < 2) return [];
      const pts = src.flatMap((p: IPoint) => [p.x, p.y]);
      return [{ kind: "polyline", layer, points: transformPoints(pts, t), closed: e.closed }];
    }
    case "CIRCLE": {
      const e = entity as ICircleEntity;
      // Under a transform a circle may skew to an ellipse — sample it. A
      // top-level circle (no transform) stays native: compact and flip-safe.
      if (t) {
        const pts = sampleArc(e.center.x, e.center.y, e.radius, 0, Math.PI * 2);
        return [{ kind: "polyline", layer, points: transformPoints(pts, t), closed: true }];
      }
      return [{ kind: "circle", layer, cx: e.center.x, cy: e.center.y, r: e.radius }];
    }
    case "TEXT": {
      const e = entity as ITextEntity;
      const [x, y] = t ? applyTransform(e.startPoint.x, e.startPoint.y, t) : [e.startPoint.x, e.startPoint.y];
      return [{
        kind: "text",
        layer,
        x,
        y,
        text: e.text ?? "",
        height: e.textHeight * (t ? Math.abs(t.sy) : 1),
        rotation: deg2rad(e.rotation ?? 0) + (t?.rot ?? 0),
      }];
    }
    case "MTEXT": {
      const e = entity as IMtextEntity;
      const [x, y] = t ? applyTransform(e.position.x, e.position.y, t) : [e.position.x, e.position.y];
      return [{
        kind: "text",
        layer,
        x,
        y,
        text: stripMtextCodes(e.text ?? ""),
        height: e.height * (t ? Math.abs(t.sy) : 1),
        rotation: deg2rad(e.rotation ?? 0) + (t?.rot ?? 0),
      }];
    }
    default:
      return [];
  }
}

/** Return a shallow copy of an entity with its coordinates shifted by -base
 *  (block contents are defined relative to the block base point). */
function shiftEntity(entity: IEntity, base: IPoint): IEntity {
  if (!base.x && !base.y) return entity;
  const shiftPt = (p: IPoint): IPoint => ({ x: p.x - base.x, y: p.y - base.y, z: p.z });
  const src = entity as unknown as Record<string, unknown>;
  const clone: Record<string, unknown> = { ...src };
  if (Array.isArray(src.vertices)) clone.vertices = (src.vertices as IPoint[]).map(shiftPt);
  if (src.center) clone.center = shiftPt(src.center as IPoint);
  if (src.startPoint) clone.startPoint = shiftPt(src.startPoint as IPoint);
  if (src.position) clone.position = shiftPt(src.position as IPoint);
  if (Array.isArray(src.fitPoints)) clone.fitPoints = (src.fitPoints as IPoint[]).map(shiftPt);
  if (Array.isArray(src.controlPoints)) clone.controlPoints = (src.controlPoints as IPoint[]).map(shiftPt);
  return clone as unknown as IEntity;
}

export function parseDxf(text: string): ParsedDxf {
  const dxf = new DxfParser().parseSync(text);
  if (!dxf) throw new Error("Could not parse DXF file.");

  const primitives: DxfPrimitive[] = [];
  let unsupportedCount = 0;

  const emit = (entity: IEntity, t: Transform | null, depth: number): void => {
    if (entity.type === "INSERT") {
      if (depth >= 1) {
        unsupportedCount++; // nested block beyond one level — skip in v1
        return;
      }
      const ins = entity as IInsertEntity;
      const block = dxf.blocks?.[ins.name];
      if (!block?.entities?.length) return;
      const base = block.position ?? { x: 0, y: 0, z: 0 };
      const t2: Transform = {
        tx: ins.position?.x ?? 0,
        ty: ins.position?.y ?? 0,
        sx: ins.xScale ?? 1,
        sy: ins.yScale ?? 1,
        rot: deg2rad(ins.rotation ?? 0),
      };
      for (const child of block.entities) {
        emit(shiftEntity(child, base), t2, depth + 1);
      }
      return;
    }
    if (!SUPPORTED.has(entity.type)) {
      unsupportedCount++;
      return;
    }
    primitives.push(...entityToPrimitives(entity, entity.layer || "0", t));
  };

  for (const entity of dxf.entities ?? []) emit(entity, null, 0);

  const bounds = computeBounds(primitives);
  const layers = [...new Set(primitives.map((p) => p.layer))].sort();
  const insunits = dxf.header?.["$INSUNITS"];
  const sourceUnits = insunitsToUnit(insunits);
  const unitsPerRealUnit = insunitsScaleToUnit(insunits);

  return { primitives, layers, bounds, sourceUnits, unitsPerRealUnit, unsupportedCount };
}

function computeBounds(primitives: DxfPrimitive[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const acc = (x: number, y: number) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };
  for (const p of primitives) {
    if (p.points) {
      for (let i = 0; i < p.points.length; i += 2) acc(p.points[i], p.points[i + 1]);
    } else if (p.kind === "circle" && p.cx != null && p.cy != null && p.r != null) {
      acc(p.cx - p.r, p.cy - p.r);
      acc(p.cx + p.r, p.cy + p.r);
    } else if (p.kind === "text" && p.x != null && p.y != null) {
      acc(p.x, p.y);
    }
  }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  return { minX, minY, maxX, maxY };
}

/** DXF $INSUNITS code → our Unit. Returns undefined for unitless/unknown. */
function insunitsToUnit(value: unknown): Unit | undefined {
  if (typeof value !== "number") return undefined;
  switch (value) {
    case 1: // inches
    case 2: // feet
      return "ft";
    case 4: // mm
    case 5: // cm
    case 6: // m
      return "m";
    default:
      return undefined;
  }
}

/** How many DXF drawing units make one of the returned real-world Unit. */
function insunitsScaleToUnit(value: unknown): number {
  if (typeof value !== "number") return 1;
  switch (value) {
    case 1:
      return 12; // 12 inches per foot
    case 4:
      return 1000; // mm per m
    case 5:
      return 100; // cm per m
    case 2: // feet
    case 6: // m
    default:
      return 1;
  }
}
