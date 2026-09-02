export type ClassValue =
  string | number | null | undefined | false | ClassValue[];

/**
 * Joins class names, dropping anything falsy.
 *
 * Signature-compatible with ditto's `cn`, but NOT behaviour-compatible: ditto's
 * wraps tailwind-merge, so a later utility overrides an earlier one that sets
 * the same property. This only concatenates. Tailwind resolves a conflict by
 * stylesheet order rather than class order, so passing a utility that fights
 * one a component already sets is undefined — match the component's utilities
 * or give it a real prop.
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) out.push(nested);
    } else {
      out.push(String(input));
    }
  }
  return out.join(" ");
}
