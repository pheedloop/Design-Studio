/**
 * Disjunction grammar ("a, b, or c" / "a, b ou c") via Intl, so the key count stays
 * linear — one noun per element type rather than one key per combination.
 */
export function formatList(items: string[], locale: string | undefined): string {
  return new Intl.ListFormat(locale, {
    style: "long",
    type: "disjunction",
  }).format(items);
}

/** Fixed-decimal number using the locale's separator. Replaces toFixed(). */
export function formatNumber(
  value: number,
  locale: string | undefined,
  fractionDigits: number,
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
