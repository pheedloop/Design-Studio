import type { FloorPlanElement, Geometry } from "@/types";
import { getElementBounds, type ElementBounds } from "./bounds";

export type AlignmentUpdate = { id: string; geometry: Partial<Geometry> };

interface AlignUnit {
  ids: string[];
  elements: FloorPlanElement[];
  bounds: ElementBounds;
}

function buildUnits(elements: FloorPlanElement[]): AlignUnit[] {
  const byGroup = new Map<string, FloorPlanElement[]>();
  const solo: FloorPlanElement[] = [];

  for (const el of elements) {
    const gid = el.properties.groupId;
    if (gid) {
      const arr = byGroup.get(gid) ?? [];
      arr.push(el);
      byGroup.set(gid, arr);
    } else {
      solo.push(el);
    }
  }

  const units: AlignUnit[] = [];
  for (const el of solo) {
    units.push({ ids: [el.id], elements: [el], bounds: getElementBounds(el) });
  }
  for (const [, members] of byGroup) {
    units.push({
      ids: members.map(e => e.id),
      elements: members,
      bounds: unionBounds(members),
    });
  }
  return units;
}

function unionBounds(elements: FloorPlanElement[]): ElementBounds {
  let left = Infinity,
    right = -Infinity,
    top = Infinity,
    bottom = -Infinity;
  for (const el of elements) {
    const b = getElementBounds(el);
    if (b.left < left) left = b.left;
    if (b.right > right) right = b.right;
    if (b.top < top) top = b.top;
    if (b.bottom > bottom) bottom = b.bottom;
  }
  return {
    left,
    right,
    top,
    bottom,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
  };
}

function translate(
  el: FloorPlanElement,
  dx: number,
  dy: number,
): Partial<Geometry> {
  const geo = el.geometry;
  if (!("x" in geo)) return {};
  return {
    x: (geo as { x: number }).x + dx,
    y: (geo as { y: number }).y + dy,
  } as Partial<Geometry>;
}

function applyDelta(
  unit: AlignUnit,
  dx: number,
  dy: number,
): AlignmentUpdate[] {
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return [];
  return unit.elements.map(el => ({
    id: el.id,
    geometry: translate(el, dx, dy),
  }));
}

export function alignLeft(elements: FloorPlanElement[]): AlignmentUpdate[] {
  const units = buildUnits(elements);
  const target = Math.min(...units.map(u => u.bounds.left));
  return units.flatMap(u => applyDelta(u, target - u.bounds.left, 0));
}

export function alignRight(elements: FloorPlanElement[]): AlignmentUpdate[] {
  const units = buildUnits(elements);
  const target = Math.max(...units.map(u => u.bounds.right));
  return units.flatMap(u => applyDelta(u, target - u.bounds.right, 0));
}

export function alignTop(elements: FloorPlanElement[]): AlignmentUpdate[] {
  const units = buildUnits(elements);
  const target = Math.min(...units.map(u => u.bounds.top));
  return units.flatMap(u => applyDelta(u, 0, target - u.bounds.top));
}

export function alignBottom(elements: FloorPlanElement[]): AlignmentUpdate[] {
  const units = buildUnits(elements);
  const target = Math.max(...units.map(u => u.bounds.bottom));
  return units.flatMap(u => applyDelta(u, 0, target - u.bounds.bottom));
}

export function alignCenterH(elements: FloorPlanElement[]): AlignmentUpdate[] {
  const units = buildUnits(elements);
  const left = Math.min(...units.map(u => u.bounds.left));
  const right = Math.max(...units.map(u => u.bounds.right));
  const target = (left + right) / 2;
  return units.flatMap(u => applyDelta(u, target - u.bounds.centerX, 0));
}

export function alignCenterV(elements: FloorPlanElement[]): AlignmentUpdate[] {
  const units = buildUnits(elements);
  const top = Math.min(...units.map(u => u.bounds.top));
  const bottom = Math.max(...units.map(u => u.bounds.bottom));
  const target = (top + bottom) / 2;
  return units.flatMap(u => applyDelta(u, 0, target - u.bounds.centerY));
}

export function distributeH(elements: FloorPlanElement[]): AlignmentUpdate[] {
  const units = buildUnits(elements);
  if (units.length < 3) return [];
  units.sort((a, b) => a.bounds.left - b.bounds.left);

  const totalSpan = units[units.length - 1].bounds.right - units[0].bounds.left;
  const totalWidth = units.reduce(
    (sum, u) => sum + (u.bounds.right - u.bounds.left),
    0,
  );
  const gap = (totalSpan - totalWidth) / (units.length - 1);

  const updates: AlignmentUpdate[] = [];
  let cursor = units[0].bounds.left;
  for (const unit of units) {
    const w = unit.bounds.right - unit.bounds.left;
    updates.push(...applyDelta(unit, cursor - unit.bounds.left, 0));
    cursor += w + gap;
  }
  return updates;
}

export function arrangeAsGrid(
  elements: FloorPlanElement[],
  cols: number,
  gapX: number,
  gapY: number,
  compareNames?: (a: string, b: string) => number,
): AlignmentUpdate[] {
  const units = buildUnits(elements);
  if (units.length < 2) return [];

  // Top-to-bottom, left-to-right, so the order feels natural
  const byPosition = (a: AlignUnit, b: AlignUnit) => {
    const dy = a.bounds.top - b.bounds.top;
    if (Math.abs(dy) > 10) return dy;
    return a.bounds.left - b.bounds.left;
  };
  // Unnamed units go last, still in position order.
  const byName =
    compareNames &&
    ((a: AlignUnit, b: AlignUnit) => {
      const an = unitName(a, compareNames);
      const bn = unitName(b, compareNames);
      if (an && bn) return compareNames(an, bn) || byPosition(a, b);
      if (an || bn) return an ? -1 : 1;
      return byPosition(a, b);
    });
  units.sort(byName || byPosition);

  const clampedCols = Math.max(1, Math.min(cols, units.length));
  // Each column is as wide as its widest unit and each row as tall as its
  // tallest, so mixed sizes stay on a grid without inflating every gap.
  const colWidths: number[] = [];
  const rowHeights: number[] = [];
  units.forEach((u, i) => {
    const col = i % clampedCols;
    const row = Math.floor(i / clampedCols);
    colWidths[col] = Math.max(
      colWidths[col] ?? 0,
      u.bounds.right - u.bounds.left,
    );
    rowHeights[row] = Math.max(
      rowHeights[row] ?? 0,
      u.bounds.bottom - u.bounds.top,
    );
  });
  const originX = Math.min(...units.map(u => u.bounds.left));
  const originY = Math.min(...units.map(u => u.bounds.top));
  const colX = trackStarts(colWidths, originX, gapX);
  const rowY = trackStarts(rowHeights, originY, gapY);

  const updates: AlignmentUpdate[] = [];
  units.forEach((unit, i) => {
    const tx = colX[i % clampedCols];
    const ty = rowY[Math.floor(i / clampedCols)];
    updates.push(
      ...applyDelta(unit, tx - unit.bounds.left, ty - unit.bounds.top),
    );
  });
  return updates;
}

// A group sorts by its lowest member name.
function unitName(
  unit: AlignUnit,
  compare: (a: string, b: string) => number,
): string | undefined {
  return unit.elements
    .map(el => el.properties.name)
    .filter((name): name is string => Boolean(name))
    .sort(compare)[0];
}

function trackStarts(sizes: number[], origin: number, gap: number): number[] {
  const starts: number[] = [];
  let cursor = origin;
  for (const size of sizes) {
    starts.push(cursor);
    cursor += size + gap;
  }
  return starts;
}

export function distributeV(elements: FloorPlanElement[]): AlignmentUpdate[] {
  const units = buildUnits(elements);
  if (units.length < 3) return [];
  units.sort((a, b) => a.bounds.top - b.bounds.top);

  const totalSpan = units[units.length - 1].bounds.bottom - units[0].bounds.top;
  const totalHeight = units.reduce(
    (sum, u) => sum + (u.bounds.bottom - u.bounds.top),
    0,
  );
  const gap = (totalSpan - totalHeight) / (units.length - 1);

  const updates: AlignmentUpdate[] = [];
  let cursor = units[0].bounds.top;
  for (const unit of units) {
    const h = unit.bounds.bottom - unit.bounds.top;
    updates.push(...applyDelta(unit, 0, cursor - unit.bounds.top));
    cursor += h + gap;
  }
  return updates;
}
