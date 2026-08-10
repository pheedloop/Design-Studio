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

// ---------------------------------------------------------------------------
// Internationalization
// ---------------------------------------------------------------------------
//
// `designStudioStrings` is this surface's English, keyed by the same stable keys
// `translate` receives. Deliberately scoped to this surface: the merged manifest
// is one object literal and Rollup does not tree-shake object properties, so
// re-exporting it here would ship every other surface's English with this one.
// Host build steps that want all of it import "@pheedloop/design-studio/i18n".
export { designStudioStrings, createTranslate, defaultTranslate, resolveEnglish } from "./i18n";
export type { Translate, Vars, Lookup, T, StringKey } from "../i18n";
