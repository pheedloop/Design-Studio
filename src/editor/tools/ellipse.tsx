import { PiCircle } from "react-icons/pi";
import type { ToolDefinition } from "./types";
import { useClickDragInteraction } from "./hooks/useClickDragInteraction";
import type { DrawingRect } from "./hooks/useClickDragInteraction";
import { EllipsePreview } from "./previews/EllipsePreview";

export const ellipseTool: ToolDefinition<DrawingRect | null> = {
  id: "ellipse",
  labelKey: "editor.tool.ellipse",
  shortcut: "O",
  icon: <PiCircle size={20} />,
  cursor: "crosshair",

  useInteraction: (ctx) =>
    useClickDragInteraction(ctx, (rect, { defaults }) => ({
      type: "element",
      element: {
        id: crypto.randomUUID(),
        type: "shape",
        geometry: {
          shape: "ellipse",
          x: rect.x,
          y: rect.y,
          radiusX: rect.width / 2,
          radiusY: rect.height / 2,
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

  PreviewComponent: EllipsePreview,

  ownsGeometry: ["ellipse"],
  optionsBar: ["fill", "stroke", "strokeWidth"],
  propertiesPanel: ["name", "width", "height", "rotation"],
  contextMenu: ["delete"],
};
