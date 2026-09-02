import { InlineRenameField } from "@/components/InlineRenameField";
import { PiPencilSimple, PiStorefront } from "react-icons/pi";
import type { EditorMode } from "@/editor/types";
import type { FeatureMap } from "@/tiers";
import { useT } from "@/editor/i18n";
import { IconButton } from "@/components/IconButton";
import { TrophyIcon } from "@/editor/components/ui";

/**
 * Header row: map name (click to rename) + Design / Placement mode icon buttons.
 */
export function ToolSidebarHeader({
  mapName,
  onMapNameChange,
  nameEditable = true,
  editorMode,
  onEditorModeChange,
  isDirty,
  objectsState,
  placementIcon = <PiStorefront size={16} />,
}: {
  mapName: string;
  onMapNameChange: (name: string) => void;
  nameEditable?: boolean;
  editorMode: EditorMode;
  onEditorModeChange: (mode: EditorMode) => void;
  isDirty?: boolean;
  /** Capability of the "objects" feature, gating the Placement Mode toggle. */
  objectsState: FeatureMap["objects"];
  /** Icon for the Placement (object) mode button — booths by default, tables
   *  for the seatplanner. */
  placementIcon?: React.ReactNode;
}) {
  const t = useT();

  return (
    <div className="px-3 py-3 border-b border-gray-100 flex items-center gap-2 min-w-0">
      {isDirty && (
        <span
          className="shrink-0 text-red-500 font-bold text-sm leading-none"
          title={t("editor.toolbar.unsavedChanges")}
        >
          *
        </span>
      )}
      {!nameEditable ? (
        <span className="flex-1 text-base font-semibold text-text-heading truncate">
          {mapName}
        </span>
      ) : (
        <InlineRenameField
          value={mapName}
          onCommit={onMapNameChange}
          title={t("editor.toolbar.clickToRename")}
        />
      )}
      {/* Design mode is the default state, so its button sits on the left. */}
      <IconButton
        size="sm"
        active={editorMode === "design"}
        onClick={() => onEditorModeChange("design")}
        title={t("editor.mode.design")}
      >
        <PiPencilSimple size={16} />
      </IconButton>
      {objectsState !== "hidden" &&
        (objectsState === "locked" ? (
          <span
            className="relative inline-flex shrink-0"
            title={t("editor.premiumFeature")}
          >
            <IconButton size="sm" disabled>
              {placementIcon}
            </IconButton>
            <span className="absolute -top-0.5 -right-0.5 pointer-events-none">
              <TrophyIcon size={12} />
            </span>
          </span>
        ) : (
          <IconButton
            size="sm"
            active={editorMode === "placement"}
            onClick={() => onEditorModeChange("placement")}
            title={t("editor.mode.placement")}
          >
            {placementIcon}
          </IconButton>
        ))}
    </div>
  );
}
