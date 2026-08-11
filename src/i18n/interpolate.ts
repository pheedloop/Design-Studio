import type { Vars } from "./types";

const PLACEHOLDER = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;

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
 * A key's English template, plural-selected from `count`, NOT interpolated. The
 * selection is English-only; the host's i18n does the real CLDR.
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
