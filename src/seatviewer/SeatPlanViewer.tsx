import { useCallback, useEffect, useMemo, useState } from "react";
import type { SeatPlanViewerProps } from "./types";
import { isEligible, occupancyColor } from "./logic";
import { SeatPlanCanvas } from "./components/SeatPlanCanvas";
import { TicketPanel } from "./components/TicketPanel";
import { TableDetailPopover } from "./components/TableDetailPopover";
import { OccupancyLegend } from "./components/OccupancyLegend";
import { I18nProvider } from "../i18n/I18nProvider";
import { useT } from "./i18n";

/**
 * Presentational seat plan viewer. Renders a FloorPlanData with per-table
 * assignment state and lets the operator assign ticket holders to tables.
 * The host owns all data + API calls; this component emits intent via callbacks.
 */
export function SeatPlanViewer({
  translate,
  locale,
  ...props
}: SeatPlanViewerProps) {
  return (
    <I18nProvider translate={translate} locale={locale}>
      <SeatPlanViewerInner {...props} />
    </I18nProvider>
  );
}

/** Split so the body can consume the context the wrapper provides. */
function SeatPlanViewerInner(props: Omit<SeatPlanViewerProps, "translate" | "locale">) {
  const {
    mode,
    data,
    tables,
    tickets,
    ticketsLoading,
    hasMoreTickets,
    onLoadMoreTickets,
    searchTerm = "",
    onSearchChange,
    filterOptions,
    activeFilterIds,
    onFilterToggle,
    occupants = [],
    occupantsLoading,
    onTableOpen,
    onAssign,
    onUnassign,
    hideAttendeeDetails,
    lockSeatSelectionPage,
  } = props;

  const t = useT();

  const [selectedCodes, setSelectedCodes] = useState<ReadonlySet<string>>(new Set());
  const [openTableCode, setOpenTableCode] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  const tableByCode = useMemo(
    () => new Map(tables.map((t) => [t.tableCode, t])),
    [tables],
  );
  const ticketByCode = useMemo(
    () => new Map(tickets.map((t) => [t.code, t])),
    [tickets],
  );
  const tableNameByCode = useMemo(() => {
    const m = new Map<string, string>();
    for (const el of data.elements) {
      if (el.type === "table" && el.properties.tableCode) {
        m.set(el.properties.tableCode, el.properties.name || el.properties.tableCode);
      }
    }
    return m;
  }, [data.elements]);

  const openTable = openTableCode ? tableByCode.get(openTableCode) ?? null : null;

  // Tables for which no currently-selected ticket is eligible → dimmed.
  const dimmedTableCodes = useMemo(() => {
    if (selectedCodes.size === 0) return null;
    const selected = [...selectedCodes].map((c) => ticketByCode.get(c)).filter(Boolean);
    const dimmed = new Set<string>();
    for (const t of tables) {
      const anyEligible = selected.some((tk) => isEligible(tk!, t, mode));
      if (!anyEligible) dimmed.add(t.tableCode);
    }
    return dimmed;
  }, [selectedCodes, tables, ticketByCode, mode]);

  const getTableColor = useCallback(
    (code: string) => {
      const t = tableByCode.get(code);
      return t ? occupancyColor(t) : undefined;
    },
    [tableByCode],
  );

  const toggleTicket = useCallback(
    (code: string) => {
      setSelectedCodes((prev) => {
        const next = new Set(prev);
        if (mode === "attendee") {
          // single-select
          next.clear();
          if (!prev.has(code)) next.add(code);
        } else if (next.has(code)) {
          next.delete(code);
        } else {
          next.add(code);
        }
        return next;
      });
    },
    [mode],
  );

  const handleTableClick = useCallback(
    (tableCode: string) => {
      setOpenTableCode((prev) => {
        const next = prev === tableCode ? null : tableCode;
        if (next) onTableOpen?.(next);
        return next;
      });
    },
    [onTableOpen],
  );

  const closePopover = useCallback(() => {
    setOpenTableCode(null);
  }, []);

  // Dismiss the open popover on Escape.
  useEffect(() => {
    if (!openTableCode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePopover();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openTableCode, closePopover]);

  // Selected tickets that are eligible for the open table.
  const assignableCodes = useMemo(() => {
    if (!openTable) return [];
    return [...selectedCodes].filter((c) => {
      const t = ticketByCode.get(c);
      return t && isEligible(t, openTable, mode);
    });
  }, [selectedCodes, openTable, ticketByCode, mode]);

  const handleAssign = useCallback(async () => {
    if (!openTable || assignableCodes.length === 0) return;
    setAssigning(true);
    try {
      await Promise.resolve(onAssign({ tableCode: openTable.tableCode, purchaseCodes: assignableCodes }));
      setSelectedCodes(new Set());
      closePopover();
    } finally {
      setAssigning(false);
    }
  }, [openTable, assignableCodes, onAssign, closePopover]);

  const handleUnassign = useCallback(
    async (seatSelectionCode: number) => {
      await Promise.resolve(onUnassign({ seatSelectionCode }));
    },
    [onUnassign],
  );

  const handleClearTicket = useCallback(
    (ticket: { seatSelectionCode: number | null }) => {
      if (ticket.seatSelectionCode != null) handleUnassign(ticket.seatSelectionCode);
    },
    [handleUnassign],
  );

  // Assign CTA (label/disabled/hint) — centralized so admin & attendee read correctly.
  const assignCta = useMemo((): { label: string; disabled: boolean; hint?: string } => {
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
  }, [openTable, mode, assignableCodes, selectedCodes, ticketByCode, tableNameByCode, t]);

  return (
    <div
      className={`pl-map-editor flex h-full min-h-0 bg-gray-100 relative ${
        mode === "attendee" ? "flex-col" : ""
      }`}
    >
      <TicketPanel
        mode={mode}
        tickets={tickets}
        selectedCodes={selectedCodes}
        onToggle={toggleTicket}
        openTable={openTable}
        searchTerm={searchTerm}
        onSearchChange={(t) => onSearchChange?.(t)}
        filterOptions={filterOptions}
        activeFilterIds={activeFilterIds}
        onFilterToggle={onFilterToggle}
        tableLabel={(code) => tableNameByCode.get(code)}
        onClearTicket={handleClearTicket}
        lockSeatSelectionPage={lockSeatSelectionPage}
        loading={ticketsLoading}
        hasMore={hasMoreTickets}
        onLoadMore={onLoadMoreTickets}
      />

      <SeatPlanCanvas
        data={data}
        getTableColor={getTableColor}
        highlightedTableCode={openTableCode}
        dimmedTableCodes={dimmedTableCodes}
        onTableClick={handleTableClick}
        onBackgroundClick={closePopover}
      >
        <OccupancyLegend />
        {openTable && (
          <TableDetailPopover
            table={openTable}
            tableName={tableNameByCode.get(openTable.tableCode) ?? openTable.tableCode}
            occupants={occupants}
            occupantsLoading={occupantsLoading}
            hideAttendeeDetails={hideAttendeeDetails}
            allowUnassign={mode === "admin" || !lockSeatSelectionPage}
            assignLabel={assignCta.label}
            assignDisabled={assignCta.disabled}
            assignHint={assignCta.hint}
            assigning={assigning}
            onAssign={handleAssign}
            onUnassign={handleUnassign}
            onClose={closePopover}
          />
        )}
      </SeatPlanCanvas>
    </div>
  );
}
