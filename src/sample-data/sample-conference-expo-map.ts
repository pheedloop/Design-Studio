import type { FloorPlanData } from "@/types";
import rawData from "./Conference_Expo_2026.json";

/**
 * Conference & Expo Hall 2026 sample map.
 * 150 booths (numeric codes 1–150) across 5 back-to-back row pairs × 15 columns.
 * 4 session areas + 4 meeting rooms on a 1600×1300 canvas at 7px/ft.
 * No background image — booths are drawn directly on a blank canvas.
 */
export const conferenceExpoMap: FloorPlanData =
  rawData as unknown as FloorPlanData;
