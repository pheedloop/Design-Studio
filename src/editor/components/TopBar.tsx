import { useState } from "react";
import { PiMapTrifold, PiBug, PiQuestion } from "react-icons/pi";
import { DropdownMenu, MenuButton } from "./ui";
import type { MenuEntry } from "./ui";

interface TopBarProps {
  debug?: boolean;
  onDebugClick?: () => void;
  onHelpClick?: () => void;
  onLegendClick?: () => void;
  fileMenuItems?: MenuEntry[];
  editMenuItems?: MenuEntry[];
  viewMenuItems?: MenuEntry[];
  toolsMenuItems?: MenuEntry[];
}

export function TopBar({
  debug,
  onDebugClick,
  onHelpClick,
  onLegendClick,
  fileMenuItems = [],
  editMenuItems = [],
  viewMenuItems = [],
  toolsMenuItems = [],
}: TopBarProps) {
  const [fileOpen, setFileOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const closeAll = () => {
    setFileOpen(false);
    setEditOpen(false);
    setViewOpen(false);
    setToolsOpen(false);
  };

  return (
    <div className="flex items-center bg-white border-b border-gray-200">
      <div className="flex items-center justify-center w-12 shrink-0 h-10 border-r border-gray-200 text-gray-400">
        <PiMapTrifold size={20} />
      </div>
      <div className="relative">
        <MenuButton open={fileOpen} onMouseDown={(e) => { e.stopPropagation(); closeAll(); setFileOpen((prev) => !prev); }}>
          File
        </MenuButton>
        {fileOpen && <DropdownMenu items={fileMenuItems} onClose={() => setFileOpen(false)} />}
      </div>
      <div className="relative">
        <MenuButton open={editOpen} onMouseDown={(e) => { e.stopPropagation(); closeAll(); setEditOpen((prev) => !prev); }}>
          Edit
        </MenuButton>
        {editOpen && <DropdownMenu items={editMenuItems} onClose={() => setEditOpen(false)} />}
      </div>
      <div className="relative">
        <MenuButton open={viewOpen} onMouseDown={(e) => { e.stopPropagation(); closeAll(); setViewOpen((prev) => !prev); }}>
          View
        </MenuButton>
        {viewOpen && <DropdownMenu items={viewMenuItems} onClose={() => setViewOpen(false)} />}
      </div>
      <div className="relative">
        <MenuButton open={toolsOpen} onMouseDown={(e) => { e.stopPropagation(); closeAll(); setToolsOpen((prev) => !prev); }}>
          Tools
        </MenuButton>
        {toolsOpen && <DropdownMenu items={toolsMenuItems} onClose={() => setToolsOpen(false)} />}
      </div>
      <MenuButton onClick={() => { closeAll(); onLegendClick?.(); }}>Legend</MenuButton>
      <div className="flex-1" />
      <MenuButton onClick={onHelpClick} title="Help & Shortcuts">
        <PiQuestion size={16} />
      </MenuButton>
      {debug && (
        <MenuButton onClick={onDebugClick} title="Debug: View Map JSON">
          <PiBug size={16} />
          <span className="text-[11px]">Debug</span>
        </MenuButton>
      )}
    </div>
  );
}
