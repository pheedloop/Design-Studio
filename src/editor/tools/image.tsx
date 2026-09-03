import { PiImage } from "react-icons/pi";
import type { ToolDefinition } from "./types";
import { useClickPlaceInteraction } from "./hooks/useClickPlaceInteraction";
import { placedImageSize } from "@/editor/utils/placedImageSize";

export const imageTool: ToolDefinition<null> = {
  id: "image",
  labelKey: "editor.tool.image",
  shortcut: "G",
  icon: <PiImage size={20} />,
  cursor: "crosshair",

  useInteraction: ctx =>
    useClickPlaceInteraction(ctx, (point, toolCtx) => {
      const image = toolCtx.activeImage;
      if (!image) return { type: "none" };

      const { width, height } = placedImageSize(image);
      return {
        type: "element",
        element: {
          id: crypto.randomUUID(),
          type: "image",
          geometry: {
            shape: "rect",
            x: point.x - width / 2,
            y: point.y - height / 2,
            width,
            height,
          },
          properties: {
            name: image.name,
            imageUrl: image.url,
            color: "transparent",
            zIndex: 2,
          },
        },
      };
    }),

  ownsElementType: "image",
  optionsBar: [],
  propertiesPanel: ["name", "width", "height", "rotation"],
  contextMenu: ["delete"],
};
