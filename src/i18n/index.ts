// @pheedloop/design-studio/i18n — the merged manifest, for host build steps that
// seed a catalog. At runtime take `designStudioStrings` and the helpers from the
// entry point you already use; those are scoped to one surface.

export { STRINGS } from "./strings";
export type { ManifestKey, StringKey } from "./strings";
export { interpolate } from "./interpolate";
export { formatList, formatNumber } from "./format";
export type { Lookup, T, Translate, Vars } from "./types";
