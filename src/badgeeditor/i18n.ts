// Badge editor i18n, bound to this surface's English slice. See
// src/i18n/context.tsx for why the binding is per-surface.
//
// The badge editor is not a published entry point, but carries the same contract
// so it is ready the day it becomes one.

import { createSurfaceI18n } from "../i18n/context";
import { BADGEEDITOR_STRINGS } from "../i18n/strings.badgeeditor";
import { COMMON_STRINGS } from "../i18n/strings.common";

/** English for every key the badge editor can render. Hosts index this by key. */
export const designStudioStrings = {
  ...COMMON_STRINGS,
  ...BADGEEDITOR_STRINGS,
};

export const { useT, defaultTranslate, createTranslate, resolveEnglish } =
  createSurfaceI18n(designStudioStrings);
