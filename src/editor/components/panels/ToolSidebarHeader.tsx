import { useEffect, useRef, useState } from "react";
import { PiPencilSimple, PiStorefront } from "react-icons/pi";
import type { EditorMode } from "@/editor/types";
import type { FeatureMap } from "@/tiers";
import { useT } from "@/editor/i18n";
import { IconButton, TrophyIcon } from "@/editor/components/ui";

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
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(mapName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) onMapNameChange(trimmed);
    else setDraft(mapName);
    setEditing(false);
  };

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
        <span className="flex-1 text-base font-semibold text-gray-800 truncate">
          {mapName}
        </span>
      ) : editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(mapName);
              setEditing(false);
            }
          }}
          className="flex-1 text-base font-semibold text-gray-800 bg-white border border-primary-400 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary-400"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(mapName);
            setEditing(true);
          }}
          className="flex-1 text-left text-base font-semibold text-gray-800 truncate hover:text-primary-600 transition-colors"
          title={t("editor.toolbar.clickToRename")}
        >
          {mapName}
        </button>
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
