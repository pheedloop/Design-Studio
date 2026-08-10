// Strings rendered by modules imported across surface directories (src/utils, and
// the src/editor canvas components the viewers pull in). Keep it small.
// Entries stay sorted, one per line — scripts/verify-strings.ts parses this text.

export const COMMON_STRINGS = {
  "common.area": "{{value}} sq {{unit}}",
  "common.labelWithCount": "{{label}} ({{count}})",
  "common.loading": "Loading…",
  "common.measurement": "{{value}} {{unit}}",
  "common.unit.ft": "ft",
  "common.unit.m": "m",
  "common.unit.px": "px",
  // Single key rather than a plural pair: English does not inflect the "min"
  // abbreviation, so both forms would be identical English. `count` is still
  // passed, so a host whose language does inflect can supply its own variants.
  "common.walkingTime": "~{{count}} min",
  "common.walkingTimeUnderMinute": "< 1 min",
} as const satisfies Record<string, string>;
