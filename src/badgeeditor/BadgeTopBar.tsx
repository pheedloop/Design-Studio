import { useState, type ReactNode } from "react";
import { PiIdentificationBadge, PiBug } from "react-icons/pi";
import { DropdownMenu, MenuButton } from "@/editor/components/ui";
import type { MenuEntry } from "@/editor/components/ui";
import { Row } from "@/components/Row";

interface BadgeTopBarProps {
  fileMenuItems?: MenuEntry[];
  editMenuItems?: MenuEntry[];
  viewMenuItems?: MenuEntry[];
  /** Right-aligned controls (e.g. preview-data picker + full-preview toggle). */
  rightActions?: ReactNode;
  /** When true, shows the debug affordance (badge_layout JSON viewer). */
  debug?: boolean;
  onDebugClick?: () => void;
}

/**
 * Badge editor menu bar. Mirrors the map editor's TopBar (same MenuButton /
 * DropdownMenu primitives and styling) so the two editors feel identical;
 * empty menus are simply not rendered.
 */
export function BadgeTopBar({
  fileMenuItems = [],
  editMenuItems = [],
  viewMenuItems = [],
  rightActions,
  debug,
  onDebugClick,
}: BadgeTopBarProps) {
  const [open, setOpen] = useState<string | null>(null);
  const close = () => setOpen(null);

  const menu = (id: string, label: string, items: MenuEntry[]) =>
    items.length > 0 ? (
      <div className="relative">
        <MenuButton
          open={open === id}
          onMouseDown={e => {
            e.stopPropagation();
            setOpen(prev => (prev === id ? null : id));
          }}
        >
          {label}
        </MenuButton>
        {open === id && <DropdownMenu items={items} onClose={close} />}
      </div>
    ) : null;

  return (
    <div className="flex items-center bg-white border-b border-border-neutral-light">
      <div className="flex items-center justify-center w-12 shrink-0 h-10 border-r border-border-neutral-light text-text-subtle">
        <PiIdentificationBadge size={20} />
      </div>
      {menu("file", "File", fileMenuItems)}
      {menu("edit", "Edit", editMenuItems)}
      {menu("view", "View", viewMenuItems)}
      <div className="flex-1" />
      {rightActions && (
        <Row gap="xs" align="center" className="px-3">
          {rightActions}
        </Row>
      )}
      {debug && (
        <MenuButton
          onClick={onDebugClick}
          title="Debug: View badge_layout JSON"
        >
          <PiBug size={16} />
          <span className="text-[11px]">Debug</span>
        </MenuButton>
      )}
    </div>
  );
}
