import type { Exhibitor, HoveredItem } from "@/viewer/types";
import { usePopoverPosition } from "@/viewer/hooks/usePopoverPosition";
import { ExhibitorLogo } from "./ExhibitorLogo";
import { TYPE_NAME } from "@/viewer/utils/elementTypes";
import { useT } from "@/viewer/i18n";

interface HoverTooltipProps {
  item: HoveredItem;
  /** Element label (booth code / session or room name). */
  name: string;
  /** Exhibitor occupying the booth, if any (booths only). */
  exhibitor: Exhibitor | null;
  /** Booth is reserved for another exhibitor — shown as unavailable. */
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
export function HoverTooltip({
  item,
  name,
  exhibitor,
  reserved,
  x,
  y,
}: HoverTooltipProps) {
  const t = useT();
  const { ref, pos } = usePopoverPosition(x, y);

  return (
    <div
      ref={ref}
      className="fixed pointer-events-none bg-white border border-border-neutral-light rounded-lg shadow-lg px-3 py-2 z-[9998] min-w-[140px] max-w-[240px]"
      style={{ left: pos.left, top: pos.top }}
    >
      {item.type === "booth" && exhibitor ? (
        <div className="flex flex-col items-center gap-1.5 text-center">
          <ExhibitorLogo exhibitor={exhibitor} size="sm" />
          <span className="text-sm font-medium text-text-heading line-clamp-2">
            {exhibitor.name}
          </span>
          {name && <span className="text-[11px] text-text-subtle">{name}</span>}
        </div>
      ) : (
        <>
          {name && (
            <div className="text-xs font-semibold text-text-heading truncate">
              {name}
            </div>
          )}
          {item.type === "booth" ? (
            reserved ? (
              <div className="mt-0.5 text-[11px] font-medium text-amber-600">
                {t("viewer.booth.reserved")}
              </div>
            ) : (
              <div className="mt-0.5 text-[11px] text-text-subtle">
                {t("viewer.booth.unoccupied")}
              </div>
            )
          ) : (
            <div className="mt-0.5 text-[11px] font-medium text-text-subtle uppercase tracking-wide">
              {t(
                TYPE_NAME[
                  item.type === "session_area" ? "session_area" : "meeting_room"
                ],
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
