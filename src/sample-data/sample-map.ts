import type { FloorPlanData } from "@/types";
import bgImage from "./Empty Exhibit Hall.png";
import rawData from "./Main_Exhibition_Hall.json";

// JSON imports widen string-literal fields (e.g. `background.kind`) to `string`,
// so narrow through a properly-typed value rather than the raw import.
const typedData = rawData as unknown as FloorPlanData;

export const sampleMap: FloorPlanData = {
  ...typedData,
  background:
    typedData.background?.kind === "image"
      ? { ...typedData.background, url: bgImage }
      : typedData.background,
};
