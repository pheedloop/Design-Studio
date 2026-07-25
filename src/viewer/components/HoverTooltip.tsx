import type { Exhibitor, HoveredItem } from "../types";
import { usePopoverPosition } from "../hooks/usePopoverPosition";

interface HoverTooltipProps {
  item: HoveredItem;
  /** Element label (booth code / session or room name). */
  name: string;
  /** Exhibitor occupying the booth, if any (booths only). */
  exhibitor: Exhibitor | null;
  /** Booth is reserved for another exhibitor (booth picker) — shown so the user
   *  knows it's unavailable without having to click it. */
  reserved?: boolean;
  x: number;
  y: number;
}

/**
 * Lightweight, non-interactive hover tooltip (desktop). Mirrors the legacy
 * Leaflet `bindTooltip` behaviour: booth label + exhibitor (or "Unoccupied"),
 * or the location type for sessions/meeting rooms. `pointer-events-none` so it
 * never captures the mouse and never triggers a flicker on the underlying
 * shape. The interactive card lives in the click popovers.
 */
export function HoverTooltip({ item, name, exhibitor, reserved, x, y }: HoverTooltipProps) {
  const { ref, pos } = usePopoverPosition(x, y);

  return (
    <div
      ref={ref}
      className="fixed pointer-events-none bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 z-[9998] min-w-[140px] max-w-[240px]"
      style={{ left: pos.left, top: pos.top }}
    >
      {name && (
        <div className="text-xs font-semibold text-gray-800 truncate">
          {name}
        </div>
      )}
      {item.type === "booth" ? (
        exhibitor ? (
          <div className="flex items-center gap-2 mt-1">
            {exhibitor.logo && (
              <img
                src={exhibitor.logo}
                alt=""
                className="w-6 h-6 rounded shrink-0"
              />
            )}
            <span className="text-xs text-gray-600 truncate">
              {exhibitor.name}
            </span>
          </div>
        ) : reserved ? (
          <div className="mt-0.5 text-[11px] font-medium text-amber-600">
            Reserved
          </div>
        ) : (
          <div className="mt-0.5 text-[11px] text-gray-400">Unoccupied</div>
        )
      ) : (
        <div className="mt-0.5 text-[11px] font-medium text-gray-400 uppercase tracking-wide">
          {item.type === "session_area" ? "Session Area" : "Meeting Room"}
        </div>
      )}
    </div>
  );
}
