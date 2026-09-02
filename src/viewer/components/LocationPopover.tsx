import { Popover } from "./Popover";
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

  return (
    <Popover x={x} y={y} onClose={onClose}>
      <div className="text-xs font-semibold text-text-caption uppercase tracking-wide">
        {t(TYPE_NAME[type])}
      </div>
      <div className="mt-1 text-sm font-medium text-text-heading">{name}</div>
      {onGetDirections && (
        <button
          onClick={onGetDirections}
          className="mt-2 w-full text-xs font-medium text-blue-600 hover:bg-blue-50 rounded px-2 py-1.5 cursor-pointer transition-colors text-left"
        >
          {t("viewer.getDirections")}
        </button>
      )}
    </Popover>
  );
}
