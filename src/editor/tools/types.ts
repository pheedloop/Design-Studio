import type { StringKey } from "@/editor/i18n";
import type Konva from "konva";
import type {
  FloorPlanData,
  FloorPlanElement,
  Geometry,
  Dimensions,
  Point,
} from "@/types";
import type { DrawingDefaults } from "@/editor/components/panels/OptionsBar";
import type {
  OptionsBarField,
  PropertiesPanelField,
  ContextMenuAction,
} from "@/editor/components/canvas/elements/types";

// Re-export so tool definitions can import everything from tools/types
export type { OptionsBarField, PropertiesPanelField, ContextMenuAction };

// ---------------------------------------------------------------------------
// Tool interaction — what the active tool returns to Canvas
// ---------------------------------------------------------------------------

export interface ToolInteraction<TState = unknown> {
  handleMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  handleMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  handleMouseUp: () => void;
  handleDoubleClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  handleKeyDown?: (e: KeyboardEvent) => void;
  /** Cancel in-progress operation (e.g. Escape pressed) */
  cancel?: () => void;
  cursor: string;
  state: TState;
}

// ---------------------------------------------------------------------------
// Tool context — what Canvas/MapEditor provide to the active tool
// ---------------------------------------------------------------------------

export interface ToolContext {
  stageRef: React.RefObject<Konva.Stage | null>;
  position: { x: number; y: number };
  scale: number;
  data: FloorPlanData;
  defaults: DrawingDefaults;
  onComplete: (result: ToolResult) => void;
  /** Currently selected icon name (used by icon tool) */
  activeIconName?: string | null;
}

// ---------------------------------------------------------------------------
// Tool result — standardised completion payload
// ---------------------------------------------------------------------------

export type ToolResult =
  | { type: "element"; element: FloorPlanElement }
  | { type: "measurement"; p1: Point; p2: Point }
  | { type: "none" };

// ---------------------------------------------------------------------------
// Tool definition — the full, self-contained description of a tool
// ---------------------------------------------------------------------------

export interface ToolDefinition<TState = unknown> {
  id: string;
  labelKey: StringKey;
  shortcut?: string;
  icon: React.ReactNode;
  cursor: string;

  /** Hook that drives canvas interaction while this tool is active */
  useInteraction: (ctx: ToolContext) => ToolInteraction<TState>;

  /** Preview rendered on the drawing overlay layer while the tool is active */
  PreviewComponent?: React.FC<{
    state: TState;
    scale: number;
    dimensions: Dimensions;
  }>;

  /**
   * Handle component rendered when an element CREATED by this tool is selected.
   * (e.g. line endpoint handles, arc control point, polygon vertex handles)
   */
  HandleComponent?: React.FC<{
    element: FloorPlanElement;
    onGeometryUpdate: (id: string, updates: Partial<Geometry>) => void;
  }>;

  /**
   * Which geometry shapes this tool "owns".
   * Used to look up HandleComponent and UI config for existing elements.
   */
  ownsGeometry?: string[];

  /**
   * For tools that create elements with a specific element type (e.g. booth, label, icon),
   * used for disambiguation when multiple tools share the same geometry shape.
   * Checked before ownsGeometry in lookups.
   */
  ownsElementType?: string;

  // --- UI config (replaces ShapeConfig) ---
  optionsBar: OptionsBarField[];
  propertiesPanel: PropertiesPanelField[];
  contextMenu: ContextMenuAction[];

  /**
   * Build a FloorPlanElement from raw tool output + current drawing defaults.
   * Tools that don't create elements (measure) omit this.
   */
  createElement?: (
    rawResult: unknown,
    defaults: DrawingDefaults,
  ) => FloorPlanElement;
}
