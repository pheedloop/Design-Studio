import { BADGEEDITOR_STRINGS } from "./strings.badgeeditor";
import { COMMON_STRINGS } from "./strings.common";
import { EDITOR_STRINGS } from "./strings.editor";
import { SEATVIEWER_STRINGS } from "./strings.seatviewer";
import { VIEWER_STRINGS } from "./strings.viewer";

/**
 * Every string, merged. For the ./i18n subpath (host build steps seeding a
 * catalog) and scripts/verify-strings.ts only — no component may import this for
 * its value, or that surface's bundle gains every other surface's English.
 */
export const STRINGS = {
  ...COMMON_STRINGS,
  ...VIEWER_STRINGS,
  ...SEATVIEWER_STRINGS,
  ...EDITOR_STRINGS,
  ...BADGEEDITOR_STRINGS,
};

/** Every literal key, plural variants included. */
export type ManifestKey = keyof typeof STRINGS;

type PluralBase<K> = K extends `${infer B}_other` ? B : never;

/** The keys `t()` accepts — plural variants collapse to their base. */
export type StringKey =
  | Exclude<ManifestKey, `${string}_one` | `${string}_other`>
  | PluralBase<ManifestKey>;
