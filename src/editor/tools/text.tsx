import { PiTextT } from "react-icons/pi";
import type { ToolDefinition } from "./types";
import { useClickPlaceInteraction } from "./hooks/useClickPlaceInteraction";

export const textTool: ToolDefinition<null> = {
  id: "text",
  labelKey: "editor.tool.text",
  shortcut: "T",
  icon: <PiTextT size={20} />,
  cursor: "crosshair",

  useInteraction: (ctx) =>
    useClickPlaceInteraction(ctx, (point, { defaults }) => ({
      type: "element",
      element: {
        id: crypto.randomUUID(),
        type: "label",
        geometry: {
          shape: "rect",
          x: point.x,
          y: point.y,
          width: 150,
          height: 30,
        },
        properties: {
          name: "Text",
          text: "Text",
          fontSize: 16,
          fontWeight: "normal",
          textAlign: "left",
          color: defaults.fill,
          zIndex: 2,
        },
      },
    })),

  ownsElementType: "label",
  optionsBar: ["fill"],
  propertiesPanel: ["text", "fontSize", "fontWeight", "fontStyle", "textDecoration", "textAlign", "width", "height", "rotation"],
  contextMenu: ["delete"],
};
