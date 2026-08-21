import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
  PiCursorFill,
  PiHandFill,
  PiPaintBrush,
  PiEraser,
  PiSquare,
} from "react-icons/pi";
import type { ActiveTool, EditorMode, PathingTool } from "@/editor/types";
import { TOOL_REGISTRY } from "@/editor/tools/registry";
import type { FeatureMap } from "@/tiers";
import { showTrophy } from "@/tiers";
import { IconPicker } from "./IconPicker";
import { getIconEntry } from "@/editor/utils/iconRegistry";
import type { PlacementRecords } from "@/editor/hooks/usePlacementRecords";
import type { PlacementCategory } from "@/editor/placement/types";
import { useT } from "@/editor/i18n";
import { ToolRow, type ToolDef } from "./ToolRow";
import { ToolSidebarHeader } from "./ToolSidebarHeader";
import { PlacementPanel } from "./PlacementPanel";
import type { AutoArrangeRecord } from "./PlacementPanel";

// ---------------------------------------------------------------------------
// Tool lists
// ---------------------------------------------------------------------------

const handDef: ToolDef<ActiveTool> = {
  id: "hand",
  labelKey: "editor.tool.hand",
  shortcut: "H",
  icon: <PiHandFill size={16} />,
};

const selectDef: ToolDef<ActiveTool> = {
  id: "select",
  labelKey: "editor.tool.select",
  shortcut: "V",
  icon: <PiCursorFill size={16} />,
};

const toolDefs: ToolDef<ActiveTool>[] = TOOL_REGISTRY.map(t => ({
  id: t.id as ActiveTool,
  labelKey: t.labelKey,
  shortcut: t.shortcut,
  icon: t.icon,
}));

const pathingToolDefs: ToolDef<PathingTool>[] = [
  {
    id: "select",
    labelKey: "editor.tool.select",
    shortcut: "V",
    icon: <PiCursorFill size={16} />,
  },
  {
    id: "paintWalkable",
    labelKey: "editor.tool.paintWalkable",
    shortcut: "W",
    icon: <PiPaintBrush size={16} />,
  },
  {
    id: "paintImpassable",
    labelKey: "editor.tool.eraseImpassable",
    shortcut: "E",
    icon: <PiEraser size={16} />,
  },
  {
    id: "rectFill",
    labelKey: "editor.tool.rectangleFill",
    shortcut: "R",
    icon: <PiSquare size={16} />,
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Header row: map name (click to rename) + Design / Placement mode icon buttons.
 */
// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ToolSidebarProps {
  activeTool: ActiveTool;
  activeIconName: string | null;
  onToolChange: (tool: ActiveTool) => void;
  onIconSelect?: (iconId: string) => void;
  isPathingMode?: boolean;
  /** Background layer active — only the background image/color applies (no drawing). */
  isBackgroundLayer?: boolean;
  activePathingTool?: PathingTool;
  onPathingToolChange?: (tool: PathingTool) => void;
  editorMode: EditorMode;
  onEditorModeChange: (mode: EditorMode) => void;
  mapName: string;
  onMapNameChange: (name: string) => void;
  /** When false, the map name is shown read-only (no inline rename). Default true. */
  nameEditable?: boolean;
  isDirty?: boolean;
  placementRecords: PlacementRecords;
  onAutoArrange: (
    category: PlacementCategory,
    records: AutoArrangeRecord[],
    shape: "rect" | "ellipse",
  ) => void;
  /** Resolved usage-tier capabilities. */
  features: FeatureMap;
  /** Icon for the Placement (object) mode button — booths by default, tables
   *  for the seatplanner. */
  placementIcon?: React.ReactNode;
}

export function ToolSidebar({
  activeTool,
  activeIconName,
  onToolChange,
  onIconSelect,
  isPathingMode,
  isBackgroundLayer,
  activePathingTool,
  onPathingToolChange,
  editorMode,
  onEditorModeChange,
  mapName,
  onMapNameChange,
  nameEditable = true,
  isDirty,
  placementRecords,
  onAutoArrange,
  features,
  placementIcon,
}: ToolSidebarProps) {
  const t = useT();
  const iconRowRef = useRef<HTMLDivElement>(null);
  const showIconPicker = activeTool === "icon" && !!onIconSelect;

  // The picker anchors to the icon row's DOM rect — a live measurement, not
  // state, so it has to be read after layout (useLayoutEffect), never during
  // render (refs, and the DOM they point to, aren't render-safe to read). A
  // stale rect while hidden is harmless — rendering is gated on
  // `showIconPicker` regardless, so there's nothing to reset here.
  const [iconAnchorRect, setIconAnchorRect] = useState<DOMRect | null>(null);
  useLayoutEffect(() => {
    if (!showIconPicker) return;
    const el = iconRowRef.current;
    if (!el) return;
    setIconAnchorRect(el.getBoundingClientRect());
  }, [showIconPicker]);

  // Pathing mode overrides the normal sidebar
  if (isPathingMode && onPathingToolChange && activePathingTool) {
    return (
      <div className="flex flex-col w-64 shrink-0 bg-white border-r border-gray-200 overflow-hidden">
        <div className="px-3 py-3 border-b border-gray-100">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 leading-none mb-1">
            {t("editor.pathing.layerTitle")}
          </div>
          <div className="text-base font-semibold text-gray-800 truncate">
            {mapName}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-1 px-1">
          {pathingToolDefs.map(tool => (
            <ToolRow
              key={tool.id}
              tool={tool}
              isActive={activePathingTool === tool.id}
              onClick={() => onPathingToolChange(tool.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Background layer holds only the map's background image/color (edited in the
  // properties panel), so the drawing tools don't apply here.
  if (isBackgroundLayer) {
    return (
      <div className="flex flex-col w-64 shrink-0 bg-white border-r border-gray-200 overflow-hidden">
        <div className="px-3 py-3 border-b border-gray-100">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 leading-none mb-1">
            {t("editor.background.layerTitle")}
          </div>
          <div className="text-base font-semibold text-gray-800 truncate">
            {mapName}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-1 px-1">
          <ToolRow
            tool={handDef}
            isActive={activeTool === "hand"}
            onClick={() => onToolChange("hand")}
          />
          <ToolRow
            tool={selectDef}
            isActive={activeTool === "select"}
            onClick={() => onToolChange("select")}
          />
          <p className="px-2 py-3 text-xs text-gray-400 leading-relaxed">
            {t("editor.background.layerHint")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-64 shrink-0 bg-white border-r border-gray-200 overflow-hidden">
        {/* Map name + mode switcher */}
        <ToolSidebarHeader
          mapName={mapName}
          onMapNameChange={onMapNameChange}
          nameEditable={nameEditable}
          editorMode={editorMode}
          onEditorModeChange={onEditorModeChange}
          isDirty={isDirty}
          objectsState={features.objects}
          placementIcon={placementIcon}
        />

        {/* Tab content */}
        {editorMode === "design" ? (
          <div className="flex-1 overflow-y-auto py-1 px-1">
            <ToolRow
              tool={handDef}
              isActive={activeTool === "hand"}
              onClick={() => onToolChange("hand")}
            />
            <ToolRow
              tool={selectDef}
              isActive={activeTool === "select"}
              onClick={() => onToolChange("select")}
            />
            {features.drawingTools !== "hidden" &&
              toolDefs
                // The measure tool is meaningless without real-world scale, so it
                // follows the scaleCalibration feature.
                .filter(
                  tool =>
                    !(
                      tool.id === "measure" &&
                      features.scaleCalibration === "hidden"
                    ),
                )
                .map(tool => {
                  const displayTool =
                    tool.id === "icon" && activeIconName
                      ? (() => {
                          const entry = getIconEntry(activeIconName);
                          if (!entry) return tool;
                          const ActiveIcon = entry.component;
                          return { ...tool, icon: <ActiveIcon size={16} /> };
                        })()
                      : tool;

                  return (
                    <div
                      key={tool.id}
                      ref={tool.id === "icon" ? iconRowRef : null}
                    >
                      <ToolRow
                        tool={displayTool}
                        isActive={activeTool === tool.id}
                        onClick={() => onToolChange(tool.id)}
                        disabled={features.drawingTools === "locked"}
                        locked={showTrophy("drawingTools", features)}
                      />
                    </div>
                  );
                })}
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            <PlacementPanel
              records={placementRecords}
              onAutoArrange={onAutoArrange}
            />
          </div>
        )}
      </div>
      {showIconPicker &&
        iconAnchorRect &&
        createPortal(
          <div className="pl-map-editor">
            <IconPicker
              anchorRect={iconAnchorRect}
              selectedId={activeIconName}
              onSelect={iconId => onIconSelect!(iconId)}
              onClose={() => onToolChange("select")}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
