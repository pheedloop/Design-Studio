import { useEffect, useRef } from "react";
import type { Exhibitor } from "../types";

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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-[9999] min-w-[180px]"
      style={{ left: x + 12, top: y - 20 }}
    >
      <div className="text-xs font-semibold text-gray-800">{boothCode}</div>
      {exhibitor ? (
        onExhibitorClick ? (
          <button
            type="button"
            onClick={() => onExhibitorClick(exhibitor)}
            className="flex items-center gap-2 mt-1.5 w-full text-left rounded px-1 py-0.5 -mx-1 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            {exhibitor.logo && (
              <img
                src={exhibitor.logo}
                alt=""
                className="w-8 h-8 rounded shrink-0"
              />
            )}
            <div className="text-sm font-medium text-gray-900">
              {exhibitor.name}
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-2 mt-1.5">
            {exhibitor.logo && (
              <img
                src={exhibitor.logo}
                alt=""
                className="w-8 h-8 rounded shrink-0"
              />
            )}
            <div className="text-sm font-medium text-gray-900">
              {exhibitor.name}
            </div>
          </div>
        )
      ) : (
        <div className="mt-1 text-[11px] text-gray-400">
          No exhibitor assigned
        </div>
      )}
      {onGetDirections && (
        <button
          onClick={() => onGetDirections()}
          className="mt-2 w-full text-xs font-medium text-blue-600 hover:bg-blue-50 rounded px-2 py-1.5 cursor-pointer transition-colors text-left"
        >
          Get directions to here
        </button>
      )}
    </div>
  );
}
