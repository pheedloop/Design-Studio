// ---------------------------------------------------------------------------
// Translator context and the per-surface binding
// ---------------------------------------------------------------------------
//
// Two things are deliberately split apart here.
//
// ONE React context for the whole package, defined once in this module. It has to
// be one, because surfaces share components across directory boundaries — the map
// viewer's canvas pulls in BackgroundImage and DxfDrawing from src/editor, and the
// seat plan canvas pulls in ViewerElement from src/viewer. A per-surface context
// would leave those rendering without a provider.
//
// PER-SURFACE English tables, bound by createSurfaceI18n() in each surface's
// i18n.ts shim. That is a bundle-size decision: the merged manifest is a single
// object literal, and Rollup does not tree-shake object properties, so binding it
// whole would ship the editor's several hundred English strings into Charmander's
// mobile webview. Each surface binds COMMON_STRINGS plus its own slice.
//
// With no provider at all, `translate` is undefined and each surface falls back to
// its own English table. That is the guarantee the whole design rests on: a host
// that upgrades and passes nothing sees exactly what it saw before.
//
// The provider component itself lives in I18nProvider.tsx — this file stays free
// of components so both can be hot-reloaded independently.

import { createContext, useContext, useMemo } from "react";
import { interpolate, resolveEnglishFrom } from "./interpolate";
import type { Lookup, T, Translate, Vars } from "./types";
import type { StringKey } from "./strings";

export interface I18nValue {
  /** undefined = no host translator in scope; surfaces use their English table. */
  translate: Translate | undefined;
  locale: string | undefined;
}

export const I18nContext = createContext<I18nValue>({
  translate: undefined,
  locale: undefined,
});

/**
 * BCP-47 tag for Intl formatting (see format.ts). undefined = runtime default.
 *
 * Separate from `translate` because a translator function cannot supply it, and
 * the runtime default is wrong where DS runs inside Charmander's mobile webview:
 * `?lang=FR` on the webview URL will not match the device locale.
 */
export function useLocale(): string | undefined {
  return useContext(I18nContext).locale;
}

/**
 * Bind the i18n helpers to one surface's English slice.
 *
 * Called once per surface at module scope — see src/viewer/i18n.ts and siblings.
 * Everything it returns resolves English from `strings` only, so importing any of
 * it from an entry point pulls in that surface's strings and no others.
 */
export function createSurfaceI18n(strings: Readonly<Record<string, string>>) {
  /** Built-in English. Used when no host translator is in scope. */
  const defaultTranslate: Translate = (key, vars) =>
    interpolate(resolveEnglishFrom(strings, key, vars), vars);

  /**
   * Build a `Translate` from a plain catalog lookup — the one-liner for a host
   * that has a dictionary but no i18n runtime doing the work for it.
   *
   * It exists to make the resolution ORDER impossible to get wrong:
   *
   *   key → plural variant → English template → host lookup → interpolate
   *                                             ^^^^^^^^^^^
   *                                    uninterpolated, every time
   *
   * A UGC catalog is keyed by the English SOURCE, which contains `{{count}}`, not
   * `3`. Interpolating before the lookup produces a key that can never match, so
   * every string with a variable in it would silently fall back to English —
   * quietly, and only for the strings a user is most likely to notice.
   */
  const createTranslate = (lookup: Lookup): Translate => {
    return (key, vars) => {
      const english = resolveEnglishFrom(strings, key, vars);
      return interpolate(lookup(english, key) || english, vars);
    };
  };

  /**
   * A key's English template, plural-selected from `vars.count`, NOT interpolated.
   *
   * Hosts pass this to their own i18n as a default value — see the ditto adapter
   * in the README.
   */
  const resolveEnglish = (key: StringKey, vars?: Vars): string =>
    resolveEnglishFrom(strings, key, vars);

  /**
   * The translator for components on this surface.
   *
   * The returned `t` is memoized off the host translator's identity, so it is
   * stable within a language and changes when the language changes. Both halves
   * matter: stability keeps `t` usable in useMemo dependency arrays without
   * re-deriving the world every render, and the change on language switch is what
   * invalidates memoized display strings so they rebuild in the new language.
   */
  function useT(): T {
    const { translate } = useContext(I18nContext);
    return useMemo<T>(() => translate ?? defaultTranslate, [translate]);
  }

  return { useT, defaultTranslate, createTranslate, resolveEnglish };
}
