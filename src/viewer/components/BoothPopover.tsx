import { useDismiss } from "@/hooks/useDismiss";
import type { Exhibitor } from "@/viewer/types";
import { usePopoverPosition } from "@/viewer/hooks/usePopoverPosition";
import { ExhibitorLogo } from "./ExhibitorLogo";
import { useT } from "@/viewer/i18n";

interface BoothPopoverProps {
  boothCode: string;
  exhibitor: Exhibitor | null;
  x: number;
  y: number;
  onClose: () => void;
  onGetDirections?: () => void;
  /** When provided, the exhibitor card becomes a clickable link to the
   *  exhibitor (e.g. the host app navigates to the exhibitor profile). */
  onExhibitorClick?: (exhibitor: Exhibitor) => void;
}

export function BoothPopover({
  boothCode,
  exhibitor,
  x,
  y,
  onClose,
  onGetDirections,
  onExhibitorClick,
}: BoothPopoverProps) {
  const t = useT();
  const { ref, pos } = usePopoverPosition(x, y);

  useDismiss(ref, onClose);

  return (
    <div
      ref={ref}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-[9999] min-w-[180px]"
      style={{ left: pos.left, top: pos.top }}
    >
      <div className="text-center text-[11px] font-medium text-gray-400">
        {boothCode}
      </div>
      {exhibitor ? (
        onExhibitorClick ? (
          <button
            type="button"
            onClick={() => onExhibitorClick(exhibitor)}
            className="mt-1 flex w-full flex-col items-center gap-2 rounded-md px-2 py-2 text-center hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <ExhibitorLogo exhibitor={exhibitor} />
            <div className="text-sm font-medium text-gray-900 line-clamp-2">
              {exhibitor.name}
            </div>
          </button>
        ) : (
          <div className="mt-1 flex flex-col items-center gap-2 text-center">
            <ExhibitorLogo exhibitor={exhibitor} />
            <div className="text-sm font-medium text-gray-900 line-clamp-2">
              {exhibitor.name}
            </div>
          </div>
        )
      ) : (
        <div className="mt-1 text-center text-[11px] text-gray-400">
          {t("viewer.booth.noExhibitor")}
        </div>
      )}
      {onGetDirections && (
        <button
          onClick={() => onGetDirections()}
          className="mt-2 w-full text-xs font-medium text-blue-600 hover:bg-blue-50 rounded px-2 py-1.5 cursor-pointer transition-colors text-left"
        >
          {t("viewer.getDirections")}
        </button>
      )}
    </div>
  );
}
