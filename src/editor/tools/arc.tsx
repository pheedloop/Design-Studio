import { PiBezierCurve } from "react-icons/pi";
import type { ToolDefinition } from "./types";
import { useArcInteraction } from "./hooks/useArcInteraction";
import type { ArcToolState } from "./hooks/useArcInteraction";
import { ArcPreview } from "./previews/ArcPreview";
import { ArcControlHandle } from "./handles/ArcControlHandle";

export const arcTool: ToolDefinition<ArcToolState> = {
  id: "arc",
  labelKey: "editor.tool.arc",
  shortcut: "C",
  icon: <PiBezierCurve size={20} />,
  cursor: "crosshair",

  useInteraction: ctx =>
    useArcInteraction(ctx, (arc, { defaults }) => ({
      type: "element",
      element: {
        id: crypto.randomUUID(),
        type: "shape",
        geometry: {
          shape: "arc",
          x: arc.x1,
          y: arc.y1,
          points: [
            0,
            0,
            arc.cx - arc.x1,
            arc.cy - arc.y1,
            arc.x2 - arc.x1,
            arc.y2 - arc.y1,
          ],
        },
        properties: {
          name: "Arc",
          color: defaults.stroke,
          strokeWidth: defaults.strokeWidth,
          zIndex: 1,
        },
      },
    })),

  PreviewComponent: ArcPreview,
  HandleComponent: ArcControlHandle,

  ownsGeometry: ["arc"],
  optionsBar: ["stroke", "strokeWidth"],
  propertiesPanel: ["name", "length"],
  contextMenu: ["delete"],
};
