import { createSurfaceI18n } from "../i18n/context";
import { COMMON_STRINGS } from "../i18n/strings.common";
import { EDITOR_STRINGS } from "../i18n/strings.editor";

/** English for every key this surface can render. Hosts index this by key. */
export const designStudioStrings = {
  ...COMMON_STRINGS,
  ...EDITOR_STRINGS,
};

export const { useT, defaultTranslate, createTranslate, resolveEnglish } =
  createSurfaceI18n(designStudioStrings);
