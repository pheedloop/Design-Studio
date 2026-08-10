// Demo-only stand-in for a host app's i18n. Under src/ so tsconfig.app checks it,
// but in no lib include or entry, so it never ships — which is also why importing
// the merged manifest is fine here and nowhere else.

import { useCallback, useState } from "react";
import { STRINGS, interpolate, type Translate, type Vars } from "../i18n";
import { pseudoLocalize } from "./pseudo";

export type DemoLocale = "en" | "pseudo" | "keys";

export const DEMO_LOCALES: { id: DemoLocale; label: string; title: string }[] = [
  { id: "en", label: "EN", title: "English — no translator passed (the built-in fallback)" },
  { id: "pseudo", label: "Pseudo", title: "Accented + padded — finds hardcoded strings and clipping" },
  { id: "keys", label: "Keys", title: "Renders each string's key — finds blanks and names strings" },
];

const STORAGE_KEY = "design-studio-demo:locale";

function readStored(): DemoLocale {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "pseudo" || stored === "keys" ? stored : "en";
}

function englishFor(key: string, vars?: Vars): string {
  const table: Record<string, string> = STRINGS;
  const count = vars?.count;
  if (count !== undefined) {
    const variant = table[count === 1 ? `${key}_one` : `${key}_other`];
    if (variant !== undefined) return variant;
  }
  return table[key] ?? key;
}

/**
 * Pseudo-localize a key.
 *
 * The interpolation is the library's, applied here rather than by it: a host
 * translator returns display-ready text, so whatever this gives back is what
 * renders. Transform the template first, then substitute, or every variable
 * shows up on screen as a literal {{placeholder}}.
 */
export function pseudoTranslate(key: string, vars?: Vars): string {
  return interpolate(pseudoLocalize(englishFor(key, vars)), vars);
}

export function useDemoLocale() {
  const [locale, setLocaleState] = useState<DemoLocale>(readStored);

  const setLocale = useCallback((next: DemoLocale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const pseudo = useCallback<Translate>((key, vars) => pseudoTranslate(key, vars), []);

  const keysTranslate = useCallback<Translate>((key) => `⟦${key}⟧`, []);

  // undefined for "en" on purpose: exercises the no-translator path every host
  // hits before it wires anything up.
  const translate =
    locale === "pseudo"
      ? pseudo
      : locale === "keys"
        ? keysTranslate
        : undefined;

  return { locale, setLocale, translate };
}
