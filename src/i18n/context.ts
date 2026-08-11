import { createContext, useContext } from "react";
import { interpolate, resolveEnglishFrom } from "./interpolate";
import type { AnyTranslate, SurfaceKey, TranslateFor } from "./types";

export interface I18nValue {
  /** undefined = no host translator; surfaces fall back to their English. */
  translate: AnyTranslate | undefined;
  locale: string | undefined;
}

export const I18nContext = createContext<I18nValue>({
  translate: undefined,
  locale: undefined,
});

/** BCP-47 tag for Intl formatting. undefined = runtime default. */
export function useLocale(): string | undefined {
  return useContext(I18nContext).locale;
}

/**
 * Bind the i18n helpers to one surface's English slice — called once per surface
 * in its i18n.ts shim. Binding per surface rather than over the merged manifest
 * does two things: it keeps the editor's English out of the viewer bundles, and it
 * makes the returned helpers reject keys the slice does not carry.
 */
export function createSurfaceI18n<S extends Record<string, string>>(strings: S) {
  type T = TranslateFor<SurfaceKey<S>>;

  const defaultTranslate: T = (key, vars) =>
    interpolate(resolveEnglishFrom(strings, key, vars), vars);

  const resolveEnglish: T = (key, vars) =>
    resolveEnglishFrom(strings, key, vars);

  function useT(): T {
    // No memo: the host's translator is stable by contract and defaultTranslate is
    // created once per surface, so whichever is returned keeps its identity across
    // renders — which is what the memoized display strings downstream key on.
    return useContext(I18nContext).translate ?? defaultTranslate;
  }

  // defaultTranslate is returned for tests and the internal fallback only — it is
  // not part of any surface's public exports.
  return { useT, defaultTranslate, resolveEnglish };
}
