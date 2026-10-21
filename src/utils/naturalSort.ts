const collators = new Map<string | undefined, Intl.Collator>();

// Numeric-aware, so "Booth 2" sorts before "Booth 10".
export function naturalCompare(
  locale?: string,
): (a: string, b: string) => number {
  let collator = collators.get(locale);
  if (!collator) {
    collator = new Intl.Collator(locale, {
      numeric: true,
      sensitivity: "base",
    });
    collators.set(locale, collator);
  }
  return collator.compare;
}
