export { SeatPlanViewer } from "./SeatPlanViewer";
export { SeatPlanCanvas } from "./components/SeatPlanCanvas";
export type { SeatPlanCanvasProps } from "./components/SeatPlanCanvas";
export { occupancyLevel, occupancyColor, isEligible } from "./logic";
export type { OccupancyLevel } from "./logic";
export type {
  SeatPlanMode,
  SeatTableState,
  SeatTicket,
  SeatOccupant,
  SeatFilterOption,
  SeatPlanViewerProps,
} from "./types";
export type { FloorPlanData, FloorPlanElement } from "../types";

// Scoped to this surface: re-exporting the merged manifest here would ship
// every other surface's English with this one.
export { designStudioStrings, resolveEnglish } from "./i18n";
// For hosts whose catalog is a plain dictionary: resolveEnglish gives the
// uninterpolated key, interpolate fills it in after the lookup.
export { interpolate } from "../i18n/interpolate";
// Narrowed to this surface: another surface's key is a compile error.
export type { Translate, T, StringKey } from "./i18n";
export type { Vars } from "../i18n/types";
