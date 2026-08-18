export { MapViewer } from "./MapViewer";
export type {
  Exhibitor,
  ViewerMode,
  HoveredItem,
  LocationClick,
} from "./types";
export type { Tier, FeatureKey, FeatureOverride } from "../tiers";
// Re-export the data schema so host apps can type the `data` prop they pass in.
export type { FloorPlanData, FloorPlanElement } from "../types";

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
export type { TranslateContent } from "../i18n/content";
