// ---------------------------------------------------------------------------
// The merged manifest
// ---------------------------------------------------------------------------
//
// The single source of truth for every translatable string in the library,
// assembled from the per-surface slices.
//
// IMPORTANT: no component may import this module for its VALUE. It exists for
// two consumers only:
//   1. the ./i18n subpath, which host apps import at BUILD time to seed a
//      catalog (ditto's src/locales/en-CA.json, under a `designStudio` namespace)
//   2. scripts/verify-strings.ts
//
// Rollup does not tree-shake object properties, so a single ~900-entry literal is
// atomic — importing it from src/viewer would ship the editor's several hundred
// English strings into Charmander's mobile webview. Components get English from
// their own surface shim (src/viewer/i18n.ts, …) instead, which binds only
// COMMON_STRINGS + that surface's slice. scripts/verify-strings.ts enforces this.
//
// Types are the exception, and deliberately so: StringKey spans every key but
// erases at compile time, so it costs nothing to use it everywhere. Types global,
// values sliced.

import { BADGEEDITOR_STRINGS } from "./strings.badgeeditor";
import { COMMON_STRINGS } from "./strings.common";
import { EDITOR_STRINGS } from "./strings.editor";
import { SEATVIEWER_STRINGS } from "./strings.seatviewer";
import { VIEWER_STRINGS } from "./strings.viewer";

export const STRINGS = {
  ...COMMON_STRINGS,
  ...VIEWER_STRINGS,
  ...SEATVIEWER_STRINGS,
  ...EDITOR_STRINGS,
  ...BADGEEDITOR_STRINGS,
};

/** Every literal key present in the manifest, plural variants included. */
export type ManifestKey = keyof typeof STRINGS;

// A plural string is stored as two entries (`…_one`, `…_other`) but is CALLED by
// its unsuffixed base with a `count`. So the callable key set drops the variants
// and adds back the bases recovered from the `_other` ones.
type PluralBase<K> = K extends `${infer B}_other` ? B : never;

/**
 * The keys `t(…)` and a host `Translate` actually accept. A typo is a compile
 * error — that is the whole guardrail, since the repo has no test runner.
 */
export type StringKey =
  | Exclude<ManifestKey, `${string}_one` | `${string}_other`>
  | PluralBase<ManifestKey>;
