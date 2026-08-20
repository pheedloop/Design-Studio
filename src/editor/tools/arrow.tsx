import { PiArrowUpRight } from "react-icons/pi";
import type { ToolDefinition } from "./types";
import { useLineInteraction } from "./hooks/useLineInteraction";
import type { LinePreviewState } from "./hooks/useLineInteraction";
import { ArrowPreview } from "./previews/ArrowPreview";
import { LineEndpointHandles } from "./handles/LineEndpointHandles";

export const arrowTool: ToolDefinition<LinePreviewState | null> = {
  id: "arrow",
  labelKey: "editor.tool.arrow",
  shortcut: "A",
  icon: <PiArrowUpRight size={20} />,
  cursor: "crosshair",

  useInteraction: ctx =>
    useLineInteraction(ctx, (line, { defaults }) => {
      const anchorX = (line.x1 + line.x2) / 2;
      const anchorY = (line.y1 + line.y2) / 2;
      return {
        type: "element",
        element: {
          id: crypto.randomUUID(),
          type: "shape",
          geometry: {
            shape: "arrow",
            x: anchorX,
            y: anchorY,
            points: [
              line.x1 - anchorX,
              line.y1 - anchorY,
              line.x2 - anchorX,
              line.y2 - anchorY,
            ],
          },
          properties: {
            name: "Arrow",
            color: defaults.stroke,
            strokeWidth: defaults.strokeWidth,
            zIndex: 1,
            arrowHead: { style: "triangle", size: 12 },
          },
        },
      };
    }),

  PreviewComponent: ArrowPreview,
  HandleComponent: LineEndpointHandles,

  ownsGeometry: ["arrow"],
  optionsBar: ["stroke", "strokeWidth"],
  propertiesPanel: ["name", "length", "arrowHeadStyle", "arrowHeadSize"],
  contextMenu: ["delete"],
};
