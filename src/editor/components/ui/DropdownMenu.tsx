import { useRef } from "react";
import { useDismiss } from "@/hooks/useDismiss";
import { MenuItem } from "./MenuItem";

export interface MenuItemConfig {
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
}

export function DropdownMenu({ items, onClose }: DropdownMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useDismiss(ref, onClose);

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-0 bg-white border border-border-neutral-light rounded-md shadow-lg py-1 min-w-[200px] z-dialog"
    >
      {items.map((entry, i) =>
        isMenuDivider(entry) ? (
          <div
            key={`divider-${i}`}
            className="my-1 border-t border-border-neutral-faint"
          />
        ) : (
          <MenuItem
            key={entry.label}
            {...entry}
            onClick={() => {
              entry.onClick?.();
              onClose();
            }}
          />
        ),
      )}
    </div>
  );
}
