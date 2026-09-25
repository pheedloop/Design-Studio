import { DPI } from "./model";

// Canvas renders at 96px per inch (the legacy DPI); zoom is layered on top via
// useCanvasControls' `scale`.
export const PPI = DPI;
export const QR_BASE_PX = 75;

const MM_PER_INCH = 25.4;

export const mmToPx = (mm: number): number => (mm / MM_PER_INCH) * PPI;
