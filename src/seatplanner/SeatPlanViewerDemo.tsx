import { useMemo, useRef, useState, useCallback } from "react";
import { Checkbox } from "@/components/Checkbox";
import { SeatPlanViewer } from "@/seatviewer";
import type {
  SeatOccupant,
  SeatPlanMode,
  SeatTicket,
  Translate,
} from "@/seatviewer";
import { seatPlanMap } from "@/sample-data/seatplan-map";
import { seatPlanState } from "@/sample-data/seatplan-state";
import {
  buildSeatPlanRoster,
  MY_TICKET_CODES,
} from "@/sample-data/seatplan-roster";

const MINE = new Set<string>(MY_TICKET_CODES);

// Only tables actually placed on the map are interactive; build the demo around those.
const MAPPED_CODES = new Set(
  seatPlanMap.elements
    .filter(el => el.type === "table" && el.properties.tableCode)
    .map(el => el.properties.tableCode as string),
);
const BASE_TABLES = seatPlanState.filter(t => MAPPED_CODES.has(t.tableCode));

/**
 * Demo host for the seat plan viewer. Stands in for Charmander: holds one roster
 * of ticket holders in local state. Table occupancy and the per-table occupant
 * list are both derived from that roster, so the list and the floor always agree.
 */
export function SeatPlanViewerDemo({ translate }: { translate?: Translate }) {
  const [viewerMode, setViewerMode] = useState<SeatPlanMode>("admin");
  const [lockSelection, setLockSelection] = useState(false);
  const [hideDetails, setHideDetails] = useState(false);

  const [tickets, setTickets] = useState<SeatTicket[]>(() =>
    buildSeatPlanRoster(BASE_TABLES),
  );
  const [search, setSearch] = useState("");
  const [seatFilter, setSeatFilter] = useState<"all" | "seated" | "unseated">(
    "all",
  );
  const [openCode, setOpenCode] = useState<string | null>(null);
  const selCounter = useRef(9000);

  const FILTER_OPTIONS = [
    { id: "all", label: "All" },
    { id: "seated", label: "Seated" },
    { id: "unseated", label: "Unseated" },
  ];

  // Occupancy per table is the count of tickets currently seated there.
  const tables = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tickets)
      if (t.tableCode)
        counts.set(t.tableCode, (counts.get(t.tableCode) ?? 0) + 1);
    return BASE_TABLES.map(t => ({
      ...t,
      occupancy: counts.get(t.tableCode) ?? 0,
    }));
  }, [tickets]);

  const visibleTickets = useMemo(() => {
    if (viewerMode === "attendee") return tickets.filter(t => MINE.has(t.code));
    const q = search.trim().toLowerCase();
    return tickets.filter(t => {
      if (seatFilter === "seated" && !t.tableCode) return false;
      if (seatFilter === "unseated" && t.tableCode) return false;
      if (
        q &&
        !(
          `${t.attendee.firstName} ${t.attendee.lastName}`
            .toLowerCase()
            .includes(q) || t.attendee.email.toLowerCase().includes(q)
        )
      )
        return false;
      return true;
    });
  }, [tickets, search, seatFilter, viewerMode]);

  const occupants = useMemo<SeatOccupant[]>(() => {
    if (!openCode) return [];
    return tickets
      .filter(t => t.tableCode === openCode)
      .map(t => ({
        code: t.code,
        firstName: t.attendee.firstName,
        lastName: t.attendee.lastName,
        email: t.attendee.email,
        organization: t.attendee.organization,
        seatSelectionCode: t.seatSelectionCode,
      }));
  }, [tickets, openCode]);

  const handleAssign = useCallback(
    ({
      tableCode,
      purchaseCodes,
    }: {
      tableCode: string;
      purchaseCodes: string[];
    }) => {
      setTickets(prev =>
        prev.map(t =>
          purchaseCodes.includes(t.code)
            ? { ...t, tableCode, seatSelectionCode: selCounter.current++ }
            : t,
        ),
      );
    },
    [],
  );

  const handleUnassign = useCallback(
    ({ seatSelectionCode }: { seatSelectionCode: number }) => {
      setTickets(prev =>
        prev.map(t =>
          t.seatSelectionCode === seatSelectionCode
            ? { ...t, tableCode: null, seatSelectionCode: null }
            : t,
        ),
      );
    },
    [],
  );

  const tab = (m: SeatPlanMode, label: string) => (
    <button
      type="button"
      onClick={() => setViewerMode(m)}
      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
        viewerMode === m
          ? "bg-white text-text-heading shadow-sm"
          : "text-text-caption hover:text-text-heading"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-3 py-1.5 bg-surface-neutral border-b border-border-neutral-light text-xs shrink-0">
        <div className="flex items-center gap-1 bg-surface-muted rounded p-0.5">
          {tab("admin", "Admin")}
          {tab("attendee", "Attendee")}
        </div>
        {viewerMode === "attendee" && (
          <div className="flex items-center gap-4 text-text-body">
            <Checkbox
              label="Lock selection"
              checked={lockSelection}
              onChange={setLockSelection}
            />
            <Checkbox
              label="Hide attendee details"
              checked={hideDetails}
              onChange={setHideDetails}
            />
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <SeatPlanViewer
          key={viewerMode}
          mode={viewerMode}
          data={seatPlanMap}
          tables={tables}
          tickets={visibleTickets}
          totalTickets={visibleTickets.length}
          searchTerm={search}
          onSearchChange={setSearch}
          filterOptions={FILTER_OPTIONS}
          activeFilterIds={[seatFilter]}
          onFilterToggle={id =>
            setSeatFilter(id as "all" | "seated" | "unseated")
          }
          occupants={occupants}
          onTableOpen={setOpenCode}
          onAssign={handleAssign}
          onUnassign={handleUnassign}
          lockSeatSelectionPage={viewerMode === "attendee" && lockSelection}
          hideAttendeeDetails={viewerMode === "attendee" && hideDetails}
          translate={translate}
        />
      </div>
    </div>
  );
}
