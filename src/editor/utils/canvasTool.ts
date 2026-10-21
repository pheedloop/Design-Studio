import type { ActiveTool, EditorMode } from "@/editor/types";
import type { LayerId } from "@/types/FloorPlanData";

// Background and pathing take no drawing tools, and pathing has its own tool
// set, so the content tool waits untouched for the return to content.
export function resolveCanvasTool(
  activeTool: ActiveTool,
  activeLayerId: LayerId,
  editorMode: EditorMode,
): { drawToolId: ActiveTool | null; isPanTool: boolean } {
  const takesDesignTools =
    activeLayerId !== "background" && activeLayerId !== "pathing";
  return {
    drawToolId:
      takesDesignTools && activeTool !== "select" && activeTool !== "hand"
        ? activeTool
        : null,
    // In placement mode the canvas stays selectable so placed objects can be
    // moved (Space / middle-mouse still pan).
    isPanTool:
      activeTool === "hand" &&
      editorMode === "design" &&
      activeLayerId !== "pathing",
  };
}
