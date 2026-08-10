// ---------------------------------------------------------------------------
// Badge editor strings
// ---------------------------------------------------------------------------
//
// Keys must start with `badgeeditor.` and may only be referenced from
// src/badgeeditor/**.
//
// The badge editor is not a published entry point (no package.json#exports
// entry, no vite lib entry) — it ships only in the demo app. It still carries
// the same i18n contract so it is ready the day it is published.
//
// FORMAT (enforced by scripts/verify-strings.ts): entries sorted by key, one
// `"key": "English",` per line, two-space indent.

export const BADGEEDITOR_STRINGS = {} as const satisfies Record<string, string>;
