// Public API for the badge editor library export.
export { BadgeEditor } from "./BadgeEditor";
export type { BadgeEditorProps } from "./BadgeEditor";
export { flatten, inflate } from "./serialize";
export { FIELD_DEFS } from "./fields";
export type {
  BadgeDocument,
  BadgePage,
  BadgeField,
  FoldType,
  SlotType,
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

// Scoped to this surface: re-exporting the merged manifest here would ship
// every other surface's English with this one.
export { designStudioStrings, resolveEnglish } from "./i18n";
// For hosts whose catalog is a plain dictionary: resolveEnglish gives the
// uninterpolated key, interpolate fills it in after the lookup.
export { interpolate } from "../i18n/interpolate";
export type { Translate, Vars, T } from "../i18n/types";
export type { StringKey } from "../i18n/strings";
