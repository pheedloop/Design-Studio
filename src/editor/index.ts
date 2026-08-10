export { MapEditor } from "./MapEditor";
export {
  captureFloorPlanThumbnail,
  THUMBNAIL_MAX_EDGE,
} from "./utils/captureThumbnail";
export { definePlacementCategory } from "./placement/types";
export type { PlacementCategory } from "./placement/types";
export type { FloorPlanData, Background, BackgroundImageData, BackgroundDxfData } from "../types";
export type { ExhibitorBooth, SessionLocation, MeetingRoom } from "../viewer/types";
export type { Tier, FeatureKey, FeatureOverride } from "../tiers";

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
export type { Translate, Vars, Lookup, T } from "../i18n/types";
export type { StringKey } from "../i18n/strings";
