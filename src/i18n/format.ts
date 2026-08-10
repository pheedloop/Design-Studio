/**
 * Join items with the locale's disjunction grammar ("a, b, or c" / "a, b ou c").
 *
 * Delegated to Intl so the key count stays linear — one noun per element type
 * rather than one key per combination — and no translator has to think about
 * comma conventions.
 */
export function formatList(items: string[], locale: string | undefined): string {
  if (typeof Intl.ListFormat === "function") {
    return new Intl.ListFormat(locale, {
      style: "long",
      type: "disjunction",
    }).format(items);
  }
  return items.join(", ");
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
