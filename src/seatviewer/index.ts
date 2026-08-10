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
