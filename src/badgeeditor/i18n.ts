import { createSurfaceI18n } from "../i18n/context";
import { COMMON, BADGEEDITOR } from "../i18n/strings";
import type { SurfaceKey, TranslateFor } from "../i18n/types";

export const { designStudioStrings, useT, resolveEnglish } = createSurfaceI18n({
  common: COMMON,
  badgeeditor: BADGEEDITOR,
});

export type StringKey = SurfaceKey<typeof designStudioStrings>;
export type T = TranslateFor<StringKey>;

/** What a host passes as `translate`; same shape as `T`. */
export type Translate = T;

export { useLocale } from "../i18n/context";
