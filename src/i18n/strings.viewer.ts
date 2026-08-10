// ---------------------------------------------------------------------------
// Map viewer strings
// ---------------------------------------------------------------------------
//
// Keys must start with `viewer.` and may only be referenced from src/viewer/**.
// A string shared with another surface goes in strings.common.ts instead.
//
// FORMAT (enforced by scripts/verify-strings.ts): entries sorted by key, one
// `"key": "English",` per line, two-space indent.

export const VIEWER_STRINGS = {
  "viewer.legend.title": "Legend",
  "viewer.legend.unlabeled": "Unlabeled",
} as const satisfies Record<string, string>;
