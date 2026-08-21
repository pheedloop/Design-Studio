import { useDismiss } from "@/hooks/useDismiss";
import { usePopoverPosition } from "@/viewer/hooks/usePopoverPosition";

interface PopoverProps {
  /** Tap/click point the popover is anchored to, in viewport coordinates. */
  x: number;
  y: number;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * The floating card the map viewer shows on a tap: positioned next to the tap
 * point and clamped to the viewport, dismissed on an outside press or Escape.
 *
 * BoothPopover and LocationPopover each carried this shell, and their class
 * strings were byte-identical — so a change to the card's padding or elevation
 * had to be made twice to stay consistent.
 */
export function Popover({ x, y, onClose, children }: PopoverProps) {
  const { ref, pos } = usePopoverPosition(x, y);
  useDismiss(ref, onClose);

  return (
    <div
      ref={ref}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-[9999] min-w-[180px]"
      style={{ left: pos.left, top: pos.top }}
    >
      {children}
    </div>
  );
}
