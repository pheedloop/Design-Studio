import { useDismiss } from "@/hooks/useDismiss";
import { usePopoverPosition } from "@/viewer/hooks/usePopoverPosition";

interface PopoverProps {
  /** Anchor point, in viewport coordinates. */
  x: number;
  y: number;
  onClose: () => void;
  children: React.ReactNode;
}

/** Floating card anchored to a tap point, clamped to the viewport. */
export function Popover({ x, y, onClose, children }: PopoverProps) {
  const { ref, pos } = usePopoverPosition(x, y);
  useDismiss(ref, onClose);

  return (
    <div
      ref={ref}
      className="fixed bg-white border border-border-neutral-light rounded-lg shadow-lg p-xs z-dialog min-w-[180px]"
      style={{ left: pos.left, top: pos.top }}
    >
      {children}
    </div>
  );
}
