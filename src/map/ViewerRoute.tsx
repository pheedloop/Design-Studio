import { MapViewer } from "@/viewer";
import type { Tier } from "@/editor";
import type { Translate } from "@/i18n";
import type { ViewerMode } from "@/viewer/types";
import type { FloorPlanData } from "@/types";
import { exhibitionHallMap } from "@/sample-data/exhibition-hall-map";
import { conferenceExpoExhibitors } from "@/sample-data/sample-exhibitors";

export type Viewport = "desktop" | "mobile";

function loadViewerData(): FloorPlanData | null {
  try {
    const raw = localStorage.getItem("map-editor:floorplan");
    if (!raw) return null;
    return JSON.parse(raw) as FloorPlanData;
  } catch {
    return null;
  }
}

export function ViewerRoute({
  viewport,
  mode,
  tier,
  translate,
}: {
  viewport: Viewport;
  mode: ViewerMode;
  tier: Tier;
  translate?: Translate;
}) {
  const data = loadViewerData() ?? exhibitionHallMap;
  const viewer = (
    <MapViewer
      data={data}
      exhibitors={conferenceExpoExhibitors}
      mode={mode}
      tier={tier}
      translate={translate}
    />
  );

  if (viewport === "mobile") {
    return (
      <div className="h-full flex items-center justify-center bg-gray-800 overflow-hidden">
        <div
          className="bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-gray-700"
          style={{ width: 390, height: 844 }}
        >
          {viewer}
        </div>
      </div>
    );
  }

  return viewer;
}
