import { useRef } from "react";
import { useDismiss } from "@/hooks/useDismiss";
import { Button } from "@/components/Button";

export interface ContextMenuAction {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

export interface ContextMenuDivider {
  type: "divider";
}

export type ContextMenuItem = ContextMenuAction | ContextMenuDivider;

function isDivider(item: ContextMenuItem): item is ContextMenuDivider {
  return "type" in item && item.type === "divider";
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useDismiss(ref, onClose);

  return (
    <div
      ref={ref}
      className="fixed bg-white border border-border-neutral-light rounded-md shadow-lg py-1 z-[9999]"
      style={{ left: x, top: y }}
    >
      {items.map((item, i) =>
        isDivider(item) ? (
          <div
            key={`divider-${i}`}
            className="my-1 border-t border-border-neutral-faint"
          />
        ) : (
          <Button
            key={item.label}
            variant="ghost"
            color={item.danger ? "negative" : "neutral"}
            className="w-full justify-start rounded-none"
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            {item.label}
          </Button>
        ),
      )}
    </div>
  );
}
