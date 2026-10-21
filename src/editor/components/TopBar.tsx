import { useRef, useState } from "react";
import { PiBug, PiQuestion } from "react-icons/pi";
import { Row } from "@/components/Row";
import { DropdownMenu, MenuButton } from "./ui";
import type { MenuEntry } from "./ui";
import { useT } from "@/editor/i18n";
import { MapIcon } from "@/icons/icons";

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
  const t = useT();
  const [open, setOpen] = useState<string | null>(null);
  const openRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(null);

  const menu = (id: string, label: string, items: MenuEntry[]) => (
    <div ref={open === id ? openRef : undefined} className="relative">
      <MenuButton
        open={open === id}
        aria-haspopup="menu"
        aria-expanded={open === id}
        onClick={() => setOpen(prev => (prev === id ? null : id))}
      >
        {label}
      </MenuButton>
      {open === id && (
        <DropdownMenu items={items} onClose={close} anchorRef={openRef} />
      )}
    </div>
  );

  return (
    <Row
      align="center"
      className="bg-white border-b border-border-neutral-light"
    >
      <Row
        align="center"
        justify="center"
        className="w-12 shrink-0 h-10 border-r border-border-neutral-light text-text-subtle"
      >
        <MapIcon size={20} />
      </Row>
      {menu("file", t("editor.menu.file"), fileMenuItems)}
      {menu("edit", t("editor.menu.edit"), editMenuItems)}
      {menu("view", t("editor.menu.view"), viewMenuItems)}
      {menu("tools", t("editor.menu.tools"), toolsMenuItems)}
      <MenuButton
        onClick={() => {
          close();
          onLegendClick?.();
        }}
      >
        {t("common.legend")}
      </MenuButton>
      <div className="flex-1" />
      <MenuButton onClick={onHelpClick} title={t("editor.topBar.help")}>
        <PiQuestion size={16} />
      </MenuButton>
      {debug && (
        <MenuButton
          onClick={onDebugClick}
          title={t("editor.topBar.debugTitle")}
        >
          <PiBug size={16} />
          <span className="text-xs">{t("editor.topBar.debug")}</span>
        </MenuButton>
      )}
    </Row>
  );
}
