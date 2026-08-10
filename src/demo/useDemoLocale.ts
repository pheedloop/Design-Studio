// ---------------------------------------------------------------------------
// Demo locale state
// ---------------------------------------------------------------------------
//
// This directory is the demo app's stand-in for a host application's i18n. It
// lives under src/ so tsconfig.app typechecks it, but it is deliberately absent
// from tsconfig.lib.json's `include` and from every vite lib entry, so it cannot
// reach the published package. That is also why importing the MERGED manifest is
// fine here and nowhere else: the demo spans three surfaces with three different
// English slices, so it cannot bind to any single one.
//
// It doubles as the manual QA harness for the whole localization effort — the
// GitHub Pages demo rebuilds on every push to develop, so ditto and Charmander
// devs can see a fully translated Design Studio before writing any wiring.

import { useCallback, useState } from "react";
import { STRINGS, type Translate, type Vars } from "../i18n";
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

/** English template for a key, plural-selected, across every surface's slice. */
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
 * Demo translator state.
 *
 * Note `translate` is undefined for "en" rather than an identity function: that
 * exercises the no-translator path every host hits before it wires anything up,
 * which is the case most likely to regress unnoticed.
 *
 * The returned translators are `useCallback`-stable on purpose. A host that
 * rebuilds its translator every render re-derives every memoized label in the
 * editor on every keystroke, and the demo must not hide that from us by being
 * accidentally better-behaved than a real host.
 */
export function useDemoLocale() {
  const [locale, setLocaleState] = useState<DemoLocale>(readStored);

  const setLocale = useCallback((next: DemoLocale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  // Transform the TEMPLATE and let the library interpolate afterwards, so
  // variables stay in plain characters — that is what lets you tell library
  // chrome from host data at a glance.
  const pseudoTranslate = useCallback<Translate>(
    (key, vars) => pseudoLocalize(englishFor(key, vars)),
    [],
  );

  const keysTranslate = useCallback<Translate>((key) => `⟦${key}⟧`, []);

  const translate =
    locale === "pseudo"
      ? pseudoTranslate
      : locale === "keys"
        ? keysTranslate
        : undefined;

  return { locale, setLocale, translate };
}
