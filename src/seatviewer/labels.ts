import type { T } from "./i18n";
import { seatEligibility } from "./logic";
import type { SeatPlanMode, SeatTableState, SeatTicket } from "./types";

export function occupantHeading(
  state: { loading: boolean; hasOccupants: boolean; locked: boolean },
  t: T,
): string {
  if (state.loading) return t("seatviewer.loading");
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
  const {
    openTable,
    mode,
    assignableCodes,
    selectedCodes,
    ticketByCode,
    tableNameByCode,
  } = input;

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
    if (assignableCodes.length === 0) {
      return {
        label: t("seatviewer.assign.selectHolders"),
        disabled: true,
        hint:
          selectedCodes.size > 0 ? t("seatviewer.assign.allSeated") : undefined,
      };
    }
    // Admins seat through a rule mismatch — say how many, don't block.
    const flagged = assignableCodes.filter(code => {
      const ticket = ticketByCode.get(code);
      return ticket
        ? seatEligibility(ticket, openTable).flags.length > 0
        : false;
    }).length;
    return {
      label: t("seatviewer.assign.selectedCount", {
        count: assignableCodes.length,
      }),
      disabled: false,
      hint:
        flagged > 0
          ? t("seatviewer.assign.someFlagged", {
              count: flagged,
              total: assignableCodes.length,
            })
          : undefined,
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

  const { block, flags } = seatEligibility(ticket, openTable);
  if (block === "seated") {
    const at = tableNameByCode.get(ticket.tableCode!) ?? ticket.tableCode!;
    return {
      label: t("seatviewer.assign.alreadySeated"),
      disabled: true,
      hint: t("seatviewer.assign.alreadySeatedHint", {
        name: ticket.attendee.firstName,
        table: at,
      }),
    };
  }
  if (flags.includes("ticketType")) {
    return {
      label: t("seatviewer.assign.notEligible"),
      disabled: true,
      hint: t("seatviewer.assign.notEligibleHint", {
        ticket: ticket.ticketName,
      }),
    };
  }
  if (flags.includes("tag")) {
    return {
      label: t("seatviewer.assign.reserved"),
      disabled: true,
      hint: t("seatviewer.assign.reservedHint"),
    };
  }
  return {
    label: t("seatviewer.assign.assignNamed", {
      name: ticket.attendee.firstName,
    }),
    disabled: false,
  };
}
