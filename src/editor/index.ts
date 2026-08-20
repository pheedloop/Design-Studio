export { MapEditor } from "./MapEditor";
export {
  captureFloorPlanThumbnail,
  THUMBNAIL_MAX_EDGE,
} from "./utils/captureThumbnail";
export { definePlacementCategory } from "./placement/types";
export type { PlacementCategory } from "./placement/types";
export type {
  FloorPlanData,
  Background,
  BackgroundImageData,
  BackgroundDxfData,
} from "../types";
export type {
  ExhibitorBooth,
  SessionLocation,
  MeetingRoom,
} from "../viewer/types";
export type { Tier, FeatureKey, FeatureOverride } from "../tiers";

export {
  designStudioStrings,
  resolveEnglish,
  resolveEnglishPair,
} from "./i18n";
// Both give uninterpolated English; interpolate after the lookup. resolveEnglish
// is the string to display; resolveEnglishPair is for catalogues keyed by English.
export { interpolate } from "../i18n/interpolate";
// Narrowed to this surface: another surface's key is a compile error.
export type { Translate, T, StringKey } from "./i18n";
export type { Vars } from "../i18n/types";
