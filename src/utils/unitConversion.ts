import type { Dimensions, Point, Unit } from "../types/FloorPlanData";
import { formatNumber } from "../i18n/format";
import type { CommonKey, CommonT as T } from "../i18n/types";

// ~1.0 m/s indoor event pace (accounts for crowds, turns, stopping)
const INDOOR_WALKING_SPEED_MPS = 1.0;
const FEET_PER_METER = 3.28084;

// ---------------------------------------------------------------------------
// Core conversions
// ---------------------------------------------------------------------------

/** Derive pixelsPerUnit from two reference points and a known real-world distance. */
export function derivePixelsPerUnit(
  p1: Point,
  p2: Point,
  realDistance: number,
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const pxDistance = Math.sqrt(dx * dx + dy * dy);
  return pxDistance / realDistance;
}

/** Convert a pixel measurement to real-world units. */
export function pxToReal(px: number, pixelsPerUnit: number): number {
  return px / pixelsPerUnit;
}

/** Convert a real-world measurement to pixels. */
export function realToPx(real: number, pixelsPerUnit: number): number {
  return real * pixelsPerUnit;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

// Spelled out rather than `common.unit.${unit}` so a rename can find the keys.
const UNIT_LABEL: Record<Unit, CommonKey> = {
  ft: "common.unit.ft",
  m: "common.unit.m",
  px: "common.unit.px",
};

export function unitLabel(unit: Unit, t: T): string {
  return t(UNIT_LABEL[unit]);
}

/** Format a single-axis pixel measurement as a real-world string (e.g. "12.5 ft"). */
export function formatMeasurement(
  px: number,
  dims: Dimensions,
  t: T,
  locale?: string,
): string {
  const unit = unitLabel(dims.unit, t);
  if (dims.unit === "px") {
    return t("common.measurement", {
      value: formatNumber(Math.round(px), locale, 0),
      unit,
    });
  }
  const real = pxToReal(px, dims.pixelsPerUnit);
  return t("common.measurement", {
    value: formatNumber(real, locale, 1),
    unit,
  });
}

/** Format a rectangular area (width × height in px) as a real-world string (e.g. "150.0 sq ft"). */
export function formatArea(
  widthPx: number,
  heightPx: number,
  dims: Dimensions,
  t: T,
  locale?: string,
): string {
  const unit = unitLabel(dims.unit, t);
  if (dims.unit === "px") {
    const areaPx = Math.round(widthPx * heightPx);
    return t("common.area", { value: formatNumber(areaPx, locale, 0), unit });
  }
  const w = pxToReal(widthPx, dims.pixelsPerUnit);
  const h = pxToReal(heightPx, dims.pixelsPerUnit);
  return t("common.area", { value: formatNumber(w * h, locale, 1), unit });
}

// ---------------------------------------------------------------------------
// Path / route helpers
// ---------------------------------------------------------------------------

/** Sum of euclidean segment lengths for a polyline, in pixels. */
export function pathDistance(points: { x: number; y: number }[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

/** Format total route distance from pixel-coordinate path points. */
export function formatRouteDistance(
  pathPx: { x: number; y: number }[],
  dims: Dimensions,
  t: T,
  locale?: string,
): string {
  const px = pathDistance(pathPx);
  return formatMeasurement(px, dims, t, locale);
}

// ---------------------------------------------------------------------------
// Walking time
// ---------------------------------------------------------------------------

/**
 * Estimate walking time for a real-world distance.
 * Returns null when unit is "px" (no physical scale available).
 */
export function estimateWalkingTime(
  distanceReal: number,
  unit: Unit,
): { minutes: number; seconds: number } | null {
  if (unit === "px") return null;

  const distanceMeters =
    unit === "m" ? distanceReal : distanceReal / FEET_PER_METER;

  const totalSeconds = distanceMeters / INDOOR_WALKING_SPEED_MPS;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return { minutes, seconds };
}

/** Format a walking time estimate as a human-friendly string. */
export function formatWalkingTime(
  est: { minutes: number; seconds: number },
  t: T,
): string {
  if (est.minutes === 0) return t("common.walkingTimeUnderMinute");
  return t("common.walkingTime", { count: est.minutes });
}
