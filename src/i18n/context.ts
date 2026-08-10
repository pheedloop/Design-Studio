import { createContext, useContext, useMemo } from "react";
import { interpolate, resolveEnglishFrom } from "./interpolate";
import type { T, Translate, Vars } from "./types";
import type { StringKey } from "./strings";

export interface I18nValue {
  /** undefined = no host translator; surfaces fall back to their English. */
  translate: Translate | undefined;
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
 * keeps the editor's English out of the viewer bundles.
 */
export function createSurfaceI18n(strings: Readonly<Record<string, string>>) {
  const defaultTranslate: Translate = (key, vars) =>
    interpolate(resolveEnglishFrom(strings, key, vars), vars);

  const resolveEnglish = (key: StringKey, vars?: Vars): string =>
    resolveEnglishFrom(strings, key, vars);

  function useT(): T {
    const { translate } = useContext(I18nContext);
    // Memoized off the translator's identity: stable within a language, and
    // changing on a switch is what rebuilds memoized display strings.
    return useMemo<T>(() => translate ?? defaultTranslate, [translate]);
  }

  // defaultTranslate is returned for tests and the internal fallback only — it is
  // not part of any surface's public exports.
  return { useT, defaultTranslate, resolveEnglish };
}
