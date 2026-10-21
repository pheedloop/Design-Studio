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
  /** Holds the trigger too, so pressing it toggles rather than dismissing and reopening. */
  anchorRef: React.RefObject<HTMLElement | null>;
  fullWidth?: boolean;
}

export function DropdownMenu({
  items,
  onClose,
  anchorRef,
  fullWidth,
}: DropdownMenuProps) {
  useDismiss(anchorRef, onClose);

  return (
    <div
      className={`absolute top-full left-0 mt-0 bg-white border border-border-neutral-light rounded-md shadow-lg py-xxxs z-dialog ${
        fullWidth ? "right-0" : "min-w-[200px]"
      }`}
    >
      {items.map((entry, i) =>
        isMenuDivider(entry) ? (
          <div
            key={`divider-${i}`}
            className="my-xxxs border-t border-border-neutral-faint"
          />
        ) : (
          <MenuItem
            key={entry.id ?? entry.label}
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
