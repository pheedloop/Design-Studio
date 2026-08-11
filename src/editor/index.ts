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

export { designStudioStrings, resolveEnglish } from "./i18n";
// resolveEnglish gives the uninterpolated English; interpolate it after the lookup.
export { interpolate } from "../i18n/interpolate";
// Narrowed to this surface: another surface's key is a compile error.
export type { Translate, T, StringKey } from "./i18n";
export type { Vars } from "../i18n/types";
