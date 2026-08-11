import type { T } from "./i18n";
import type { SeatPlanMode, SeatTableState, SeatTicket } from "./types";

export function occupantHeading(
  state: { loading: boolean; hasOccupants: boolean; locked: boolean },
  t: T,
): string {
  if (state.loading) return t("common.loading");
  if (state.hasOccupants) return t("seatviewer.table.seatedHere");
  if (state.locked) return t("seatviewer.table.locked");
  return t("seatviewer.table.empty");
}

/** Outside the component so the branches test without mounting a Konva canvas. */
export function assignCta(
  input: {
    openTable: SeatTableState | null;
    mode: SeatPlanMode;
    assignableCodes: string[];
    selectedCodes: ReadonlySet<string>;
    ticketByCode: Map<string, SeatTicket>;
    tableNameByCode: Map<string, string>;
  },
  t: T,
): { label: string; disabled: boolean; hint?: string } {
  const { openTable, mode, assignableCodes, selectedCodes, ticketByCode, tableNameByCode } =
    input;

    if (!openTable) return { label: t("seatviewer.assign.cta"), disabled: true };
    if (openTable.isLocked)
      return {
        label: t("seatviewer.assign.tableLocked"),
        disabled: true,
        hint: t("seatviewer.assign.tableLockedHint"),
      };
    if (openTable.occupancy >= openTable.seatCount)
      return {
        label: t("seatviewer.assign.tableFull"),
        disabled: true,
        hint: t("seatviewer.assign.tableFullHint"),
      };

    if (mode === "admin") {
      if (assignableCodes.length > 0) {
        const extra = selectedCodes.size - assignableCodes.length;
        return {
          label: t("seatviewer.assign.selectedCount", { count: assignableCodes.length }),
          disabled: false,
          hint:
            extra > 0
              ? t("seatviewer.assign.someIneligible", {
                  count: extra,
                  total: selectedCodes.size,
                })
              : undefined,
        };
      }
      return {
        label: t("seatviewer.assign.selectEligible"),
        disabled: true,
        hint:
          selectedCodes.size > 0 ? t("seatviewer.assign.noneEligible") : undefined,
      };
    }

    // attendee — single select
    const code = [...selectedCodes][0];
    const ticket = code ? ticketByCode.get(code) : undefined;
    if (!ticket)
      return {
        label: t("seatviewer.assign.selectTicket"),
        disabled: true,
        hint: t("seatviewer.assign.selectTicketHint"),
      };
    if (ticket.tableCode) {
      const at = tableNameByCode.get(ticket.tableCode) ?? ticket.tableCode;
      return {
        label: t("seatviewer.assign.alreadySeated"),
        disabled: true,
        hint: t("seatviewer.assign.alreadySeatedHint", {
          name: ticket.attendee.firstName,
          table: at,
        }),
      };
    }
    if (!openTable.eligibleTicketCodes.includes(ticket.ticketCode)) {
      return {
        label: t("seatviewer.assign.notEligible"),
        disabled: true,
        hint: t("seatviewer.assign.notEligibleHint", { ticket: ticket.ticketName }),
      };
    }
    if (openTable.tags.length > 0 && !ticket.attendeeTags.some((tag) => openTable.tags.includes(tag))) {
      return {
        label: t("seatviewer.assign.reserved"),
        disabled: true,
        hint: t("seatviewer.assign.reservedHint"),
      };
    }
    return {
      label: t("seatviewer.assign.assignNamed", { name: ticket.attendee.firstName }),
      disabled: false,
    };
  }
