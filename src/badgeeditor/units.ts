// User-facing measurement units for the badge editor.
//
// The model is inch-based internally (inches → dots at DPI), so a unit is purely
// a display/input concern: convert by a per-inch factor at the UI boundary and
// keep storing inches everywhere else.

import { canonicalLocale } from "@/i18n/format";
import type { StringKey } from "./i18n";

export type Unit = "in" | "cm";

/** Display units per inch. */
const PER_INCH: Record<Unit, number> = { in: 1, cm: 2.54 };

export const UNIT_LABEL_KEYS: Record<Unit, StringKey> = {
  in: "badgeeditor.unit.in",
  cm: "badgeeditor.unit.cm",
};

export const UNIT_NAME_KEYS: Record<Unit, StringKey> = {
  in: "badgeeditor.unit.inches",
  cm: "badgeeditor.unit.centimeters",
};

/** Sensible numeric-input step per unit. */
export const unitStep: Record<Unit, number> = { in: 0.05, cm: 0.1 };

/** Minimum panel dimension per unit (~½"). */
export const unitMin: Record<Unit, number> = { in: 0.5, cm: 1.27 };

/** Inches → value in the given unit. */
export const toUnit = (inches: number, u: Unit) => inches * PER_INCH[u];

/** Value in the given unit → inches. */
export const fromUnit = (value: number, u: Unit) => value / PER_INCH[u];

export const formatDim = (
  inches: number,
  u: Unit,
  locale: string | undefined,
  dp = 2,
) =>
  new Intl.NumberFormat(canonicalLocale(locale), {
    maximumFractionDigits: dp,
  }).format(inches * PER_INCH[u]);

/** Inches → compact display string in the given unit (trims trailing zeros). */
export const fmtUnit = (inches: number, u: Unit, dp = 2) =>
  String(+(inches * PER_INCH[u]).toFixed(dp));
