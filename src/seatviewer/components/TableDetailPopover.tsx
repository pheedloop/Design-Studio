import { PiX } from "react-icons/pi";
import { Button } from "@/components/Button";
import { IconButton } from "@/components/IconButton";
import type { SeatOccupant, SeatTableState } from "@/seatviewer/types";
import { occupancyLevel, type OccupancyLevel } from "@/seatviewer/logic";
import { useT } from "@/seatviewer/i18n";
import { occupantHeading } from "@/seatviewer/labels";

interface TableDetailPopoverProps {
  table: SeatTableState;
  tableName: string;
  occupants: SeatOccupant[];
  occupantsLoading?: boolean;
  hideAttendeeDetails?: boolean;
  /** Whether per-occupant Remove is offered (false in attendee mode when locked). */
  allowUnassign?: boolean;
  /** Assign CTA, computed by the shell so admin/attendee messaging stays centralized. */
  assignLabel: string;
  assignDisabled: boolean;
  assignHint?: string;
  assigning?: boolean;
  onAssign: () => void;
  onUnassign: (seatSelectionCode: number) => void;
  onClose: () => void;
}

const OCC_BADGE: Record<OccupancyLevel, string> = {
  available: "text-[#14653a] bg-[rgba(0,168,99,0.12)]",
  half: "text-[#8a5a00] bg-[rgba(255,168,0,0.16)]",
  low: "text-[#b42318] bg-[rgba(235,87,87,0.16)]",
  full: "text-text-body bg-surface-muted",
};

function initials(o: SeatOccupant): string {
  return `${o.firstName?.[0] ?? ""}${o.lastName?.[0] ?? ""}`.toUpperCase();
}

/**
 * Floating table-detail card anchored near the clicked table. Shows current
 * occupants (unless hidden) and the assign action for the selected tickets.
 */
export function TableDetailPopover({
  table,
  tableName,
  occupants,
  occupantsLoading,
  hideAttendeeDetails,
  allowUnassign = true,
  assignLabel,
  assignDisabled,
  assignHint,
  assigning,
  onAssign,
  onUnassign,
  onClose,
}: TableDetailPopoverProps) {
  const t = useT();
  const level = occupancyLevel(table);
  const seatsFree = Math.max(0, table.seatCount - table.occupancy);

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t("seatviewer.table.details", { name: tableName })}
      className="absolute z-[9999] w-72 max-w-[calc(100%-24px)] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-contrast border border-border-neutral rounded-xl shadow-[0_16px_48px_rgba(38,59,90,0.28)] overflow-hidden"
    >
      <div className="flex items-start gap-xxs p-3 border-b border-border-neutral-light">
        <div className="flex-1 min-w-0">
          <h3 className="m-0 text-base font-medium text-text-body">
            {tableName}
          </h3>
          <span className="text-xs text-text-subtle tabular-nums">
            {t("seatviewer.table.seatsFree", {
              count: seatsFree,
              total: table.seatCount,
            })}
          </span>
        </div>
        <span
          className={`text-xs font-medium tabular-nums px-2 py-0.5 rounded-full whitespace-nowrap ${OCC_BADGE[level]}`}
        >
          {table.occupancy}/{table.seatCount}
        </span>
        <IconButton
          variant="bare"
          size="sm"
          aria-label={t("seatviewer.table.close")}
          onClick={onClose}
        >
          <PiX size={16} />
        </IconButton>
      </div>

      {!hideAttendeeDetails && (
        <div className="max-h-44 overflow-y-auto scrollbar">
          <div className="px-3 pt-2.5 pb-1 text-[10px] tracking-wider uppercase text-text-subtle font-semibold">
            {occupantHeading(
              {
                loading: !!occupantsLoading,
                hasOccupants: occupants.length > 0,
                locked: table.isLocked,
              },
              t,
            )}
          </div>
          {occupants.map(o => (
            <div
              key={o.code}
              className="flex items-center gap-snug px-3 py-1.5"
            >
              <span className="size-6 shrink-0 grid place-items-center rounded-full text-[10px] font-semibold bg-primary-100 text-primary-600">
                {initials(o)}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-text-body truncate">
                  {o.firstName} {o.lastName}
                </span>
                <span className="block text-xs text-text-caption truncate">
                  {o.organization || o.email}
                </span>
              </span>
              {allowUnassign && o.seatSelectionCode != null && (
                <button
                  type="button"
                  onClick={() => onUnassign(o.seatSelectionCode as number)}
                  className="shrink-0 text-xs text-text-subtle hover:text-[#b42318] hover:bg-[rgba(235,87,87,0.12)] px-1.5 py-1 rounded cursor-pointer"
                >
                  {t("seatviewer.table.remove")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="p-3 border-t border-border-neutral-light bg-surface-neutral">
        <Button
          variant="solid"
          color="primary"
          size="lg"
          className="w-full"
          disabled={assignDisabled || assigning}
          onClick={onAssign}
        >
          {assigning ? t("seatviewer.table.assigning") : assignLabel}
        </Button>
        {assignHint && (
          <p className="text-xs text-text-caption text-center mt-2 m-0">
            {assignHint}
          </p>
        )}
      </div>
    </div>
  );
}
