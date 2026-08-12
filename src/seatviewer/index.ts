export { SeatPlanViewer } from "./SeatPlanViewer";
export { SeatPlanCanvas } from "./components/SeatPlanCanvas";
export type { SeatPlanCanvasProps } from "./components/SeatPlanCanvas";
export {
  occupancyLevel,
  occupancyColor,
  isEligible,
  seatEligibility,
  SEAT_FLAG_LABEL_KEYS,
} from "./logic";
export type {
  OccupancyLevel,
  SeatBlockReason,
  SeatFlagReason,
  SeatEligibility,
} from "./logic";
export type {
  SeatPlanMode,
  SeatTableState,
  SeatTicket,
  SeatOccupant,
  SeatFilterOption,
  SeatPlanViewerProps,
} from "./types";
export type { FloorPlanData, FloorPlanElement } from "../types";

export { designStudioStrings, resolveEnglish } from "./i18n";
// resolveEnglish gives the uninterpolated English; interpolate it after the lookup.
export { interpolate } from "../i18n/interpolate";
// Narrowed to this surface: another surface's key is a compile error.
export type { Translate, T, StringKey } from "./i18n";
export type { Vars } from "../i18n/types";
export type { TranslateContent } from "../i18n/content";
