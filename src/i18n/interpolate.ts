// ---------------------------------------------------------------------------
// Interpolation and English plural selection
// ---------------------------------------------------------------------------
//
// The `{{name}}` syntax is i18next's, on purpose: both host apps run i18next, so
// a catalog authored for them drops in unchanged, and DS's built-in English path
// produces the same output i18next would for the same template.
//
// Deliberately NOT supported: nesting ($t(...)), formatters ({{v, number}}), and
// context suffixes. Those are host-i18n concerns — DS's resolver is a fallback,
// not an i18n engine. Locale-aware number and list formatting live in format.ts
// and are applied at the call site, before the value is passed in as a variable.
//
// No HTML escaping: output goes into React text nodes, which escape already, and
// DS never uses dangerouslySetInnerHTML. Note the corollary for hosts — i18next
// must be configured with `interpolation: { escapeValue: false }` for these keys,
// or the curly apostrophes in the English ("aren’t", "can’t") come back as
// numeric entities and render literally.

import type { Vars } from "./types";

const PLACEHOLDER = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;

/** Substitute `{{name}}` placeholders. A missing variable is left visible. */
export function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(PLACEHOLDER, (placeholder, name: string) => {
    const value = vars[name];
    // Leaving the placeholder in beats rendering a hole — a visible `{{count}}`
    // gets reported; an empty gap does not.
    return value === undefined ? placeholder : String(value);
  });
}

/**
 * Look up a key's ENGLISH template, picking the plural variant from `count`.
 *
 * English-only by design — `_one` when count === 1, `_other` otherwise. This is
 * not CLDR and does not try to be: the host's i18n does real CLDR selection off
 * the base key plus `count`. This only chooses which English source template DS
 * offers as the fallback, and (for Charmander) which English string the UGC
 * catalog is keyed by.
 *
 * Falls back to the key itself if nothing matches, so the return is never empty.
 */
export function resolveEnglishFrom(
  strings: Readonly<Record<string, string>>,
  key: string,
  vars?: Vars,
): string {
  const count = vars?.count;
  if (count !== undefined) {
    const variant = strings[count === 1 ? `${key}_one` : `${key}_other`];
    if (variant !== undefined) return variant;
  }
  return strings[key] ?? key;
}
