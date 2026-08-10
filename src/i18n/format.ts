// ---------------------------------------------------------------------------
// Locale-aware value formatting
// ---------------------------------------------------------------------------
//
// Some things a translator cannot fix from a catalog, because they are grammar
// or notation rather than wording:
//
//   - list conjunction   "booths, session locations, or meeting rooms" — which
//                        separator, whether there is an Oxford comma, and where
//                        the conjunction goes are all per-locale
//   - decimal separator  toFixed() always emits ".", but "12,5" is correct in
//                        fr/de and "12.5" reads as twelve-point-five-thousand
//
// These take the `locale` that rides alongside `translate` on each entry
// component. Format the value here, then pass the RESULT into t() as a variable —
// never assemble a sentence by concatenating formatted parts.

/**
 * Join items with the locale's disjunction grammar ("a, b, or c" / "a, b ou c").
 *
 * Used for the search placeholder, which offers only the element types actually
 * present in the map. Doing this with Intl rather than pre-composing one key per
 * combination keeps the key count linear instead of combinatorial (three element
 * types is 7 combinations; a fourth would be 15), and means no translator has to
 * think about comma conventions.
 */
export function formatList(items: string[], locale: string | undefined): string {
  if (typeof Intl.ListFormat === "function") {
    return new Intl.ListFormat(locale, {
      style: "long",
      type: "disjunction",
    }).format(items);
  }
  // Present in every browser the library targets, including the Charmander
  // webview — but three lines of guard costs less than finding out otherwise.
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
