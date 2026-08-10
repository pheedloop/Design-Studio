// The provider half of the translator context. Split from context.ts so that file
// exports no components — mixing the two breaks fast refresh for both.

import { useContext, useMemo, type ReactNode } from "react";
import { I18nContext, type I18nValue } from "./context";
import type { Translate } from "./types";

/**
 * Supplies a host translator to everything below it.
 *
 * INHERITS rather than overrides: an undefined `translate` falls through to an
 * outer provider instead of resetting that subtree to English. That is what makes
 * SeatPlanCanvas — published separately, so it needs its own props — safe to nest
 * inside SeatPlanViewer without any conditional-provider gymnastics.
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
