import { useContext, useMemo, type ReactNode } from "react";
import { I18nContext, type I18nValue } from "./context";
import type { AnyTranslate, TranslateFor } from "./types";

/**
 * Inherits rather than overrides: an undefined `translate` falls through to an
 * outer provider, so a nested entry component (SeatPlanCanvas inside
 * SeatPlanViewer) does not reset its subtree to English.
 *
 * Generic over the key set so each surface can hand over its own narrowed
 * translator without casting at the call site.
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
      // The one widening in the system, and it cannot be typed away: the context
      // has no memory of which surface stored the translator, while the guarantee
      // we rely on — that a surface only asks for keys from its own slice — lives
      // in the narrowed `useT()` each surface hands its components.
      translate: (translate as AnyTranslate | undefined) ?? outer.translate,
      locale: locale ?? outer.locale,
    }),
    [translate, locale, outer],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
