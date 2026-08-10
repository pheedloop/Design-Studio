import { useContext, useMemo, type ReactNode } from "react";
import { I18nContext, type I18nValue } from "./context";
import type { Translate } from "./types";

/**
 * Inherits rather than overrides: an undefined `translate` falls through to an
 * outer provider, so a nested entry component (SeatPlanCanvas inside
 * SeatPlanViewer) does not reset its subtree to English.
 */
export function I18nProvider({
  translate,
  locale,
  children,
}: {
  translate?: Translate;
  locale?: string;
  children: ReactNode;
}) {
  const outer = useContext(I18nContext);
  const value = useMemo<I18nValue>(
    () => ({
      translate: translate ?? outer.translate,
      locale: locale ?? outer.locale,
    }),
    [translate, locale, outer],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
