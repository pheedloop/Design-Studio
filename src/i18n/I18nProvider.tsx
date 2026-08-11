import { useContext, useMemo, type ReactNode } from "react";
import { I18nContext, type I18nValue } from "./context";
import type { AnyTranslate, TranslateFor } from "./types";

/**
 * Inherits rather than overrides: an undefined `translate` falls through to an
 * outer provider, so a nested entry component does not reset its subtree to
 * English.
 */
export function I18nProvider<K extends string>({
  translate,
  locale,
  children,
}: {
  translate?: TranslateFor<K>;
  locale?: string;
  children: ReactNode;
}) {
  const outer = useContext(I18nContext);
  const value = useMemo<I18nValue>(
    () => ({
      // Widened because the context can't know which surface stored it; the
      // per-slice guarantee lives in each surface's narrowed `useT()`.
      translate: (translate as AnyTranslate | undefined) ?? outer.translate,
      locale: locale ?? outer.locale,
    }),
    [translate, locale, outer],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
