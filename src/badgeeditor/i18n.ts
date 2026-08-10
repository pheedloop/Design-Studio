import { createSurfaceI18n } from "../i18n/context";
import { COMMON_STRINGS } from "../i18n/strings.common";
import { BADGEEDITOR_STRINGS } from "../i18n/strings.badgeeditor";

/** English for every key this surface can render. Hosts index this by key. */
export const designStudioStrings = {
  ...COMMON_STRINGS,
  ...BADGEEDITOR_STRINGS,
};

export const { useT, defaultTranslate, createTranslate, resolveEnglish } =
  createSurfaceI18n(designStudioStrings);

/** BCP-47 tag for Intl formatting, from the same provider as `useT`. */
export { useLocale } from "../i18n/context";
