// @pheedloop/design-studio/i18n — the merged manifest, for host build steps that
// seed a catalog. At runtime take `designStudioStrings` and the helpers from the
// entry point you already use; those are scoped to one surface.

import {
  BADGEEDITOR,
  COMMON,
  EDITOR,
  SEATVIEWER,
  VIEWER,
  flattenNamespaces,
} from "./strings";
import type { Flattened, TranslateFor } from "./types";
import type { SurfaceKey } from "./types";

const GROUPS = {
  common: COMMON,
  viewer: VIEWER,
  seatviewer: SEATVIEWER,
  editor: EDITOR,
  badgeeditor: BADGEEDITOR,
};

/** Every string, flattened to the keys `t()` accepts. */
export const STRINGS = flattenNamespaces(GROUPS) as Flattened<typeof GROUPS>;

export type ManifestKey = keyof typeof STRINGS;

export type StringKey = SurfaceKey<typeof STRINGS>;

export type Translate = TranslateFor<StringKey>;

export { interpolate } from "./interpolate";
export { formatList, formatNumber } from "./format";
export type { Vars } from "./types";
