import { createSurfaceI18n } from "../i18n/context";
import { COMMON_STRINGS } from "../i18n/strings.common";
import { VIEWER_STRINGS } from "../i18n/strings.viewer";

/** English for every key this surface can render. Hosts index this by key. */
export const designStudioStrings = {
  ...COMMON_STRINGS,
  ...VIEWER_STRINGS,
};

export const { useT, resolveEnglish } =
  createSurfaceI18n(designStudioStrings);

/** BCP-47 tag for Intl formatting, from the same provider as `useT`. */
export { useLocale } from "../i18n/context";
