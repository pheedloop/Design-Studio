// Two jobs: strings rendered by modules imported across surface directories, and
// vocabulary more than one surface shows. A viewer.* key cannot be used from
// src/editor, so anything both render lives here or it duplicates.
// Entries stay sorted, one per line — scripts/verify-strings.ts parses this text.

export const COMMON_STRINGS = {
  "common.area": "{{value}} sq {{unit}}",
  "common.labelWithCount": "{{label}} ({{count}})",
  "common.legend": "Legend",
  "common.loading": "Loading…",
  "common.measurement": "{{value}} {{unit}}",
  "common.type.booth": "Booth",
  "common.type.meetingRoom": "Meeting Room",
  "common.unit.ft": "ft",
  "common.unit.m": "m",
  "common.unit.px": "px",
  "common.walkingTime": "~{{count}} min",
  "common.walkingTimeUnderMinute": "< 1 min",
} as const satisfies Record<string, string>;
