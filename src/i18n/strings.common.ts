// ---------------------------------------------------------------------------
// Common strings
// ---------------------------------------------------------------------------
//
// Reserved for modules imported ACROSS surface directories — src/utils/*, and
// any src/editor component pulled into the viewers (ViewerCanvas imports
// BackgroundImage/DxfDrawing; SeatPlanCanvas imports ViewerElement). Those
// modules render under whichever surface's provider happens to be mounted, so a
// `viewer.*` key used there would have no English fallback under the editor.
//
// Everything else belongs in its own surface's slice. Keep this file small.
//
// FORMAT (enforced by scripts/verify-strings.ts): entries sorted by key, one
// `"key": "English",` per line, two-space indent. The verify script parses this
// file textually rather than importing it, and the sort keeps merges conflict-free.

export const COMMON_STRINGS = {} as const satisfies Record<string, string>;
