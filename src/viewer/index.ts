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

// Scoped to this surface: re-exporting the merged manifest here would ship
// every other surface's English with this one.
export { designStudioStrings, resolveEnglish } from "./i18n";
export type { Translate, Vars, T } from "../i18n/types";
export type { StringKey } from "../i18n/strings";
