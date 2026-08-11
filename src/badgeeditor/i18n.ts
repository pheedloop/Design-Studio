import { createSurfaceI18n } from "../i18n/context";
import type { SurfaceKey, TranslateFor } from "../i18n/types";
import { COMMON_STRINGS } from "../i18n/strings.common";
import { BADGEEDITOR_STRINGS } from "../i18n/strings.badgeeditor";

/** English for every key this surface can render. Hosts index this by key. */
export const designStudioStrings = {
  ...COMMON_STRINGS,
  ...BADGEEDITOR_STRINGS,
};

/** The keys this surface can render — its slice, plural variants collapsed. */
export type StringKey = SurfaceKey<typeof designStudioStrings>;

/** A translator over this surface's keys. What `useT()` returns. */
export type T = TranslateFor<StringKey>;

/**
 * What a host passes as the `translate` prop. Same shape as `T`: the host
 * resolves, this surface only ever asks for keys its slice carries.
 */
export type Translate = T;

export const { useT, resolveEnglish } =
  createSurfaceI18n(designStudioStrings);

/** BCP-47 tag for Intl formatting, from the same provider as `useT`. */
export { useLocale } from "../i18n/context";
