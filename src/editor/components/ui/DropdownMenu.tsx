import { useEffect, useRef } from "react";
import { useDismiss } from "@/hooks/useDismiss";
import { MenuItem } from "./MenuItem";

export interface MenuItemConfig {
  /** Row key, for menus whose labels can repeat. Defaults to the label. */
  id?: string;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  /** Show the premium trophy badge (a usage-tier locked feature). */
  premium?: boolean;
  onClick?: () => void;
}

export interface MenuDivider {
  type: "divider";
}

export type MenuEntry = MenuItemConfig | MenuDivider;

function isMenuDivider(entry: MenuEntry): entry is MenuDivider {
  return "type" in entry && entry.type === "divider";
}

interface DropdownMenuProps {
  items: MenuEntry[];
  onClose: () => void;
  /** Holds the trigger too, so pressing it toggles rather than dismissing and
   * reopening. The trigger is its `aria-haspopup` element; focus returns there. */
  anchorRef: React.RefObject<HTMLElement | null>;
  fullWidth?: boolean;
}

export function DropdownMenu({
  items,
  onClose,
  anchorRef,
  fullWidth,
}: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  useDismiss(anchorRef, onClose);

  useEffect(() => {
    enabledItems(menuRef.current)[0]?.focus();
  }, []);

  const closeToTrigger = () => {
    onClose();
    anchorRef.current?.querySelector<HTMLElement>("[aria-haspopup]")?.focus();
  };

  // Keys the menu handles stop here, so the editor's window shortcuts (arrow
  // nudge, Escape deselect, Space to pan) don't also act on them.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = enabledItems(menuRef.current);
    const index = items.indexOf(document.activeElement as HTMLElement);
    const focusAt = (i: number) =>
      items[(i + items.length) % items.length]?.focus();
    switch (e.key) {
      case "ArrowDown":
        focusAt(index + 1);
        break;
      case "ArrowUp":
        focusAt(index - 1);
        break;
      case "Home":
        focusAt(0);
        break;
      case "End":
        focusAt(items.length - 1);
        break;
      case "Escape":
        closeToTrigger();
        break;
      case "Tab":
        onClose();
        return;
      case "Enter":
      case " ":
        e.stopPropagation();
        return;
      default:
        return;
    }
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      ref={menuRef}
      role="menu"
      onKeyDown={handleKeyDown}
      className={`absolute top-full left-0 mt-0 bg-white border border-border-neutral-light rounded-md shadow-lg py-xxxs z-dialog ${
        fullWidth ? "right-0" : "min-w-[200px]"
      }`}
    >
      {items.map((entry, i) =>
        isMenuDivider(entry) ? (
          <div
            key={`divider-${i}`}
            role="separator"
            className="my-xxxs border-t border-border-neutral-faint"
          />
        ) : (
          <MenuItem
            key={entry.id ?? entry.label}
            {...entry}
            onClick={() => {
              entry.onClick?.();
              closeToTrigger();
            }}
          />
        ),
      )}
    </div>
  );
}

function enabledItems(menu: HTMLElement | null): HTMLElement[] {
  return Array.from(
    menu?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') ??
      [],
  );
}
