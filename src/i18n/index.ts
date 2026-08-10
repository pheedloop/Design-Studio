// ---------------------------------------------------------------------------
// The ./i18n subpath — @pheedloop/design-studio/i18n
// ---------------------------------------------------------------------------
//
// The MERGED manifest, for host build steps that need every key at once: ditto
// seeds src/locales/en-CA.json from it under a `designStudio` namespace, so its
// translators see DS strings alongside every other key in the app.
//
//   import { STRINGS } from "@pheedloop/design-studio/i18n";
//   writeFileSync("src/locales/en-CA.json", JSON.stringify({ designStudio: STRINGS }, null, 2));
//
// Import this at BUILD time only. At runtime, take `designStudioStrings` and the
// translator helpers from the entry point you already use (/viewer, /seatviewer,
// /editor) — those are scoped to one surface, so they do not drag the other
// surfaces' English into your bundle. Charmander never needs this subpath at all.

export { STRINGS } from "./strings";
export type { ManifestKey, StringKey } from "./strings";
export { interpolate } from "./interpolate";
export { formatList, formatNumber } from "./format";
export type { Lookup, T, Translate, Vars } from "./types";
