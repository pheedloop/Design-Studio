// Map viewer i18n, bound to this surface's English slice. See src/i18n/context.tsx
// for why the binding is per-surface rather than over the merged manifest.

import { createSurfaceI18n } from "../i18n/context";
import { COMMON_STRINGS } from "../i18n/strings.common";
import { VIEWER_STRINGS } from "../i18n/strings.viewer";

/** English for every key the map viewer can render. Hosts index this by key. */
export const designStudioStrings = {
  ...COMMON_STRINGS,
  ...VIEWER_STRINGS,
};

export const { useT, defaultTranslate, createTranslate, resolveEnglish } =
  createSurfaceI18n(designStudioStrings);
