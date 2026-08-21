import { useDismiss } from "@/hooks/useDismiss";
import { usePopoverPosition } from "@/viewer/hooks/usePopoverPosition";
import { TYPE_NAME } from "@/viewer/utils/elementTypes";
import { useT } from "@/viewer/i18n";

interface LocationPopoverProps {
  name: string;
  type: "session_area" | "meeting_room";
  x: number;
  y: number;
  onClose: () => void;
  onGetDirections?: () => void;
}

export function LocationPopover({
  name,
  type,
  x,
  y,
  onClose,
  onGetDirections,
}: LocationPopoverProps) {
  const t = useT();
  const { ref, pos } = usePopoverPosition(x, y);

  useDismiss(ref, onClose);

  return (
    <div
      ref={ref}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-[9999] min-w-[180px]"
      style={{ left: pos.left, top: pos.top }}
    >
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {t(TYPE_NAME[type])}
      </div>
      <div className="mt-1 text-sm font-medium text-gray-900">{name}</div>
      {onGetDirections && (
        <button
          onClick={onGetDirections}
          className="mt-2 w-full text-xs font-medium text-blue-600 hover:bg-blue-50 rounded px-2 py-1.5 cursor-pointer transition-colors text-left"
        >
          {t("viewer.getDirections")}
        </button>
      )}
    </div>
  );
}
