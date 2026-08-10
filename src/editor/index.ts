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

// Scoped to this surface: re-exporting the merged manifest here would ship
// every other surface's English with this one.
export { designStudioStrings, createTranslate, defaultTranslate, resolveEnglish } from "./i18n";
export type { Translate, Vars, Lookup, T } from "../i18n/types";
export type { StringKey } from "../i18n/strings";
