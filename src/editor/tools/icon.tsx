import { PiSticker } from "react-icons/pi";
import type { ToolDefinition } from "./types";
import { useClickPlaceInteraction } from "./hooks/useClickPlaceInteraction";

export const iconTool: ToolDefinition<null> = {
  id: "icon",
  labelKey: "editor.tool.icon",
  shortcut: "I",
  icon: <PiSticker size={20} />,
  cursor: "crosshair",

  useInteraction: ctx =>
    useClickPlaceInteraction(ctx, (point, toolCtx) => {
      if (!toolCtx.activeIconName) return { type: "none" };
      return {
        type: "element",
        element: {
          id: crypto.randomUUID(),
          type: "icon",
          geometry: {
            shape: "rect",
            x: point.x - 20,
            y: point.y - 20,
            width: 40,
            height: 40,
          },
          properties: {
            name: "Icon",
            iconName: toolCtx.activeIconName,
            color: toolCtx.defaults.fill,
            zIndex: 2,
          },
        },
      };
    }),

  ownsElementType: "icon",
  optionsBar: ["fill"],
  propertiesPanel: ["name", "width", "height", "rotation"],
  contextMenu: ["delete"],
};
