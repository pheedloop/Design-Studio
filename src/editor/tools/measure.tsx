import type { ToolDefinition } from "./types";
import { useMeasureInteraction } from "./hooks/useMeasureInteraction";
import type { MeasureState } from "./hooks/useMeasureInteraction";
import { MeasurePreview } from "./previews/MeasurePreview";
import { ToolMeasureIcon } from "@/icons/icons";

export const measureTool: ToolDefinition<MeasureState> = {
  id: "measure",
  labelKey: "editor.tool.measure",
  shortcut: "M",
  icon: <ToolMeasureIcon size={20} />,
  cursor: "crosshair",
  feature: "scaleCalibration",
  whenLocked: "hide",

  useInteraction: ctx => useMeasureInteraction(ctx),

  PreviewComponent: MeasurePreview,

  optionsBar: [],
  propertiesPanel: [],
  contextMenu: [],
};
