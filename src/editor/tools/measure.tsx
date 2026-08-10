import { PiRuler } from "react-icons/pi";
import type { ToolDefinition } from "./types";
import { useMeasureInteraction } from "./hooks/useMeasureInteraction";
import type { MeasureState } from "./hooks/useMeasureInteraction";
import { MeasurePreview } from "./previews/MeasurePreview";

export const measureTool: ToolDefinition<MeasureState> = {
  id: "measure",
  labelKey: "editor.tool.measure",
  shortcut: "M",
  icon: <PiRuler size={20} />,
  cursor: "crosshair",

  useInteraction: (ctx) => useMeasureInteraction(ctx),

  PreviewComponent: MeasurePreview,

  optionsBar: [],
  propertiesPanel: [],
  contextMenu: [],
};
