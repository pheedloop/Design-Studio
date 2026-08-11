import type { SurfaceKey } from "./types";
import { BADGEEDITOR_STRINGS } from "./strings.badgeeditor";
import { COMMON_STRINGS } from "./strings.common";
import { EDITOR_STRINGS } from "./strings.editor";
import { SEATVIEWER_STRINGS } from "./strings.seatviewer";
import { VIEWER_STRINGS } from "./strings.viewer";

/**
 * Every string, merged. For the ./i18n subpath (host build steps seeding a
 * catalog) only — no component may import this for its value, or that surface's
 * bundle gains every other surface's English. An eslint rule enforces it.
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

/**
 * Every key any surface may render. Individual surfaces narrow this to their own
 * slice — see `SurfaceKey` and each surface's i18n.ts.
 */
export type StringKey = SurfaceKey<typeof STRINGS>;
