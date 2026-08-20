import { useEffect, useRef } from "react";
import { Button } from "@/editor/components/ui";

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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed bg-white border border-gray-200 rounded-md shadow-lg py-1 z-[9999]"
      style={{ left: x, top: y }}
    >
      {items.map((item, i) =>
        isDivider(item) ? (
          <div key={`divider-${i}`} className="my-1 border-t border-gray-100" />
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
