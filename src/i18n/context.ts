import { createContext, useContext } from "react";
import {
  interpolate,
  resolveEnglishFrom,
  resolveEnglishPairFrom,
} from "./interpolate";
import { flattenNamespaces } from "./strings";
import type {
  AnyTranslate,
  Flattened,
  ResolveEnglishPairFor,
  SurfaceKey,
  TranslateFor,
} from "./types";

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

/** Called once per surface; the returned helpers reject other surfaces' keys. */
export function createSurfaceI18n<
  G extends Record<string, Readonly<Record<string, string>>>,
>(groups: G) {
  type T = TranslateFor<SurfaceKey<Flattened<G>>>;

  const designStudioStrings = flattenNamespaces(groups) as Flattened<G>;
  const strings: Readonly<Record<string, string>> = designStudioStrings;

  const defaultTranslate: T = (key, vars) =>
    interpolate(resolveEnglishFrom(strings, key, vars), vars);

  const resolveEnglish: T = (key, vars) =>
    resolveEnglishFrom(strings, key, vars);

  const resolveEnglishPair: ResolveEnglishPairFor<SurfaceKey<Flattened<G>>> = (
    key,
    vars,
    locale,
  ) => resolveEnglishPairFrom(strings, key, vars, locale);

  function useT(): T {
    // No memo needed: both branches are already stable across renders.
    return useContext(I18nContext).translate ?? defaultTranslate;
  }

  return {
    designStudioStrings,
    useT,
    defaultTranslate,
    resolveEnglish,
    resolveEnglishPair,
  };
}
