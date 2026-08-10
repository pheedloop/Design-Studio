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
export { designStudioStrings, createTranslate, defaultTranslate, resolveEnglish } from "./i18n";
export type { Translate, Vars, Lookup, T } from "../i18n/types";
export type { StringKey } from "../i18n/strings";
