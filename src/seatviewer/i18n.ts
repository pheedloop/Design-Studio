import { createSurfaceI18n } from "../i18n/context";
import { COMMON_STRINGS } from "../i18n/strings.common";
import { SEATVIEWER_STRINGS } from "../i18n/strings.seatviewer";

/** English for every key this surface can render. Hosts index this by key. */
export const designStudioStrings = {
  ...COMMON_STRINGS,
  ...SEATVIEWER_STRINGS,
};

export const { useT, defaultTranslate, createTranslate, resolveEnglish } =
  createSurfaceI18n(designStudioStrings);
