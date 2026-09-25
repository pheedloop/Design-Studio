// Public API for the badge editor library export.
export { BadgeEditor } from "./BadgeEditor";
export type { BadgeEditorProps } from "./BadgeEditor";
export { flatten, inflate } from "./serialize";
export type { InflateOptions } from "./serialize";
export { createDocumentFromPreset } from "./presets";
export { FIELD_DEFS } from "./fields";
export type {
  BadgeDocument,
  BadgePage,
  BadgeField,
  BadgeCustomField,
  BadgePreset,
  FoldType,
  HolePunch,
  HolePunchShape,
  FlattenResult,
  LegacyLayoutEntry,
} from "./model";
export type {
  BadgeData,
  AttendeeOption,
  AttendeeProvider,
  BadgeTicketData,
  BadgeSessionData,
} from "./badgeData";

export {
  designStudioStrings,
  resolveEnglish,
  resolveEnglishPair,
} from "./i18n";
// Both give uninterpolated English; interpolate after the lookup. resolveEnglish
// is the string to display; resolveEnglishPair is for catalogues keyed by English.
export { interpolate } from "@/i18n/interpolate";
// Narrowed to this surface: another surface's key is a compile error.
export type { Translate, T, StringKey } from "./i18n";
export type { Vars } from "@/i18n/types";
