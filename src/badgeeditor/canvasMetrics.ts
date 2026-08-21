import { DPI } from "./model";

// Canvas renders at 96px per inch (the legacy DPI); zoom is layered on top via
// useCanvasControls' `scale`.
export const PPI = DPI;
export const QR_BASE_PX = 75;
export const PANEL_CORNER_IN = 0.25; // corner fillet
