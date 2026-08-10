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
export { designStudioStrings, resolveEnglish } from "./i18n";
// For hosts whose catalog is a plain dictionary: resolveEnglish gives the
// uninterpolated key, interpolate fills it in after the lookup.
export { interpolate } from "../i18n/interpolate";
export type { Translate, Vars, T } from "../i18n/types";
export type { StringKey } from "../i18n/strings";
