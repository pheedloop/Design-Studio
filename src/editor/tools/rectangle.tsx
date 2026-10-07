import type { ToolDefinition } from "./types";
import { useClickDragInteraction } from "./hooks/useClickDragInteraction";
import type { DrawingRect } from "./hooks/useClickDragInteraction";
import { RectPreview } from "./previews/RectPreview";
import { ToolRectangleIcon } from "@/icons/icons";

export const rectangleTool: ToolDefinition<DrawingRect | null> = {
  id: "rectangle",
  labelKey: "editor.tool.rectangle",
  shortcut: "R",
  icon: <ToolRectangleIcon size={20} />,
  cursor: "crosshair",

  useInteraction: ctx =>
    useClickDragInteraction(ctx, (rect, { defaults }) => ({
      type: "element",
      element: {
        id: crypto.randomUUID(),
        type: "shape",
        geometry: {
          shape: "rect",
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        },
        properties: {
          name: "",
          color: defaults.fill,
          strokeColor: defaults.stroke,
          strokeWidth: defaults.strokeWidth,
          zIndex: 1,
        },
      },
    })),

  PreviewComponent: RectPreview,

  ownsGeometry: ["rect"],
  optionsBar: ["fill", "stroke", "strokeWidth"],
  propertiesPanel: ["name", "width", "height", "rotation"],
  contextMenu: ["delete"],
};
