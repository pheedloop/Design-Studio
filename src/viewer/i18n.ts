import { createSurfaceI18n } from "@/i18n/context";
import { COMMON, VIEWER } from "@/i18n/strings";
import type { SurfaceKey, TranslateFor } from "@/i18n/types";

export const { designStudioStrings, useT, resolveEnglish, resolveEnglishPair } =
  createSurfaceI18n({
    common: COMMON,
    viewer: VIEWER,
  });

export type StringKey = SurfaceKey<typeof designStudioStrings>;
export type T = TranslateFor<StringKey>;

/** What a host passes as `translate`; same shape as `T`. */
export type Translate = T;

export { useLocale } from "@/i18n/context";
