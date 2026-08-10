// ---------------------------------------------------------------------------
// Map editor strings
// ---------------------------------------------------------------------------
//
// Keys must start with `editor.` and may only be referenced from src/editor/**.
// A string shared with another surface goes in strings.common.ts instead — note
// that several src/editor modules ARE pulled into the viewers (BackgroundImage,
// DxfDrawing, useCanvasControls, iconRegistry); strings rendered by those belong
// in common, not here.
//
// This is the largest slice by far (~745 sites once migrated). If it becomes
// unwieldy it splits into strings.editor.tools.ts / .panels.ts / .menu.ts with no
// change to any public type or import — everything funnels through EDITOR_STRINGS.
//
// FORMAT (enforced by scripts/verify-strings.ts): entries sorted by key, one
// `"key": "English",` per line, two-space indent.

export const EDITOR_STRINGS = {} as const satisfies Record<string, string>;
