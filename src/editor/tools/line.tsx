import { PiLineSegment } from "react-icons/pi";
import type { ToolDefinition } from "./types";
import { useLineInteraction } from "./hooks/useLineInteraction";
import type { LinePreviewState } from "./hooks/useLineInteraction";
import { LinePreview } from "./previews/LinePreview";
import { LineEndpointHandles } from "./handles/LineEndpointHandles";

export const lineTool: ToolDefinition<LinePreviewState | null> = {
  id: "line",
  labelKey: "editor.tool.line",
  shortcut: "L",
  icon: <PiLineSegment size={20} />,
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
            shape: "line",
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
            name: "Line",
            color: defaults.stroke,
            strokeWidth: defaults.strokeWidth,
            zIndex: 1,
          },
        },
      };
    }),

  PreviewComponent: LinePreview,
  HandleComponent: LineEndpointHandles,

  ownsGeometry: ["line"],
  optionsBar: ["stroke", "strokeWidth"],
  propertiesPanel: ["name", "length"],
  contextMenu: ["delete"],
};
