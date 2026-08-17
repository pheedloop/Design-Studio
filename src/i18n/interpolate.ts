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

/**
 * A key's English template, plural-selected from `count`, NOT interpolated.
 *
 * `locale` selects which English form comes back. Pass it only when the result is
 * a lookup key into a catalogue keyed by English — that catalogue holds one row
 * per English form, so the target locale's rules decide which row is wanted (fr
 * treats 0 as singular where en does not). Omit it when the result is displayed
 * as English, which is what the ditto `defaultValue` and the no-host fallback do.
 *
 * A locale with more categories than English (ru `few`, ar `many`) can only reach
 * the two forms that exist; the surplus categories fall back to `_other`.
 */
export function resolveEnglishFrom(
  strings: Readonly<Record<string, string>>,
  key: string,
  vars?: Vars,
  locale: string = ENGLISH,
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
