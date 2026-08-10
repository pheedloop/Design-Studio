import { createSurfaceI18n } from "../i18n/context";
import { COMMON_STRINGS } from "../i18n/strings.common";
import { VIEWER_STRINGS } from "../i18n/strings.viewer";

/** English for every key this surface can render. Hosts index this by key. */
export const designStudioStrings = {
  ...COMMON_STRINGS,
  ...VIEWER_STRINGS,
};

export const { useT, defaultTranslate, createTranslate, resolveEnglish } =
  createSurfaceI18n(designStudioStrings);
