// @pheedloop/design-studio/i18n — the merged manifest, for host build steps that
// seed a catalog. At runtime take `designStudioStrings` and the helpers from the
// entry point you already use; those are scoped to one surface.

import type { StringKey } from "./strings";
import type { TranslateFor } from "./types";

export { STRINGS } from "./strings";
export type { ManifestKey, StringKey } from "./strings";
export { interpolate } from "./interpolate";
export { formatList, formatNumber } from "./format";
export type { Vars } from "./types";

/**
 * A translator over every key in the manifest. Defined here rather than in
 * types.ts, which stays free of any dependency on the merged manifest so the
 * slices can depend on it.
 */
export type Translate = TranslateFor<StringKey>;
