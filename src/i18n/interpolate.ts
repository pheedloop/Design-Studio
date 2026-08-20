import { canonicalLocale } from "./format";
import type { Vars } from "./types";

const PLACEHOLDER = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;

/** English rules, spelled out: this is a choice, not a missing default. */
const ENGLISH = "en-CA";

// Intl.PluralRules construction is not free, and this runs per render.
const PLURAL_RULES = new Map<string, Intl.PluralRules>();

function pluralCategory(count: number, locale: string): Intl.LDMLPluralRule {
  const tag = canonicalLocale(locale) ?? ENGLISH;
  let rules = PLURAL_RULES.get(tag);
  if (!rules) PLURAL_RULES.set(tag, (rules = new Intl.PluralRules(tag)));
  return rules.select(count);
}

/** Substitute `{{name}}` placeholders, i18next-compatible. */
export function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(PLACEHOLDER, (placeholder, name: string) => {
    const value = vars[name];
    // Leave the placeholder visible on a miss — a hole is harder to notice.
    return value === undefined ? placeholder : String(value);
  });
}

function selectFrom(
  strings: Readonly<Record<string, string>>,
  key: string,
  vars: Vars | undefined,
  locale: string,
): string {
  const count = vars?.count;
  if (count !== undefined) {
    const variant =
      strings[`${key}_${pluralCategory(count, locale)}`] ??
      strings[`${key}_other`];
    if (variant !== undefined) return variant;
  }
  return strings[key] ?? key;
}

/**
 * A key's English template, plural-selected from `count` by English rules and NOT
 * interpolated. This is the string to *display*: i18next's `defaultValue`, or the
 * fallback when no host translator is supplied.
 */
export function resolveEnglishFrom(
  strings: Readonly<Record<string, string>>,
  key: string,
  vars?: Vars,
): string {
  return selectFrom(strings, key, vars, ENGLISH);
}

/**
 * The two English strings a catalogue keyed by English text needs, which are not
 * the same string once a plural is involved.
 *
 * `lookup` is the row to fetch: the catalogue holds one row per English form, so
 * the *target* locale's rules decide which one is wanted — fr is singular at a
 * count of 0, ru at 21, where en is not.
 *
 * `fallback` is what to render if that row is missing. It follows English rules,
 * because a miss means the user sees English and "0 seat free" is not English.
 *
 * A locale with more categories than English (ru `few`, ar `many`) can only reach
 * the two forms that exist; the surplus categories fall back to `_other`.
 */
export function resolveEnglishPairFrom(
  strings: Readonly<Record<string, string>>,
  key: string,
  vars?: Vars,
  locale?: string,
): { lookup: string; fallback: string } {
  const fallback = selectFrom(strings, key, vars, ENGLISH);
  return {
    lookup:
      locale === undefined ? fallback : selectFrom(strings, key, vars, locale),
    fallback,
  };
}
