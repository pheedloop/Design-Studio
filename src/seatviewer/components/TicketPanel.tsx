import { useRef, useState } from "react";
import { PiMagnifyingGlass, PiCheck, PiCaretDown } from "react-icons/pi";
import type { SeatFilterOption, SeatPlanMode, SeatTableState, SeatTicket } from "../types";
import { isEligible } from "../logic";

interface TicketPanelProps {
  mode: SeatPlanMode;
  tickets: SeatTicket[];
  selectedCodes: ReadonlySet<string>;
  onToggle: (code: string) => void;
  /** When a table is open, tickets ineligible for it are disabled (table-first path). */
  openTable: SeatTableState | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterOptions?: SeatFilterOption[];
  activeFilterIds?: string[];
  onFilterToggle?: (id: string) => void;
  /** Resolve a tableCode to its display name (e.g. "Table 7"); falls back to the code. */
  tableLabel?: (code: string) => string | undefined;
  /** Attendee mode: clear the ticket's current seat. Hidden when lockSeatSelectionPage. */
  onClearTicket?: (ticket: SeatTicket) => void;
  lockSeatSelectionPage?: boolean;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

/**
 * List of ticket holders, in one of two shapes.
 *  - admin: a left rail — multi-select, search and infinite scroll over the
 *    event-wide list.
 *  - attendee: a collapsible strip above the canvas — single-select over the
 *    handful of tickets one attendee holds, with a Clear affordance on seated
 *    ones. A rail would spend a fixed column on two or three rows.
 */
export function TicketPanel({
  mode,
  tickets,
  selectedCodes,
  onToggle,
  openTable,
  searchTerm,
  onSearchChange,
  filterOptions,
  activeFilterIds,
  onFilterToggle,
  tableLabel,
  onClearTicket,
  lockSeatSelectionPage,
  loading,
  hasMore,
  onLoadMore,
}: TicketPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(true);
  const isAdmin = mode === "admin";

  const handleScroll = () => {
    const el = listRef.current;
    if (!el || !hasMore || loading || !onLoadMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) onLoadMore();
  };

  const renderTicket = (t: SeatTicket) => {
    const isSel = selectedCodes.has(t.code);
    const assignedCode = t.tableCode;

    const nameEl = (
      <span className="flex-1 min-w-0 text-sm font-medium text-gray-700 leading-snug line-clamp-2">
        {t.attendee.firstName} {t.attendee.lastName}
      </span>
    );
    const capEl = (
      <span className="text-sm text-gray-500 leading-snug break-words">
        <span className="text-gray-600 font-medium">{t.ticketName}</span> · {t.attendee.email}
      </span>
    );
    const seatPill = (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full text-[#14653a] bg-[rgba(0,168,99,0.12)]">
        <span className="size-1.5 rounded-full bg-[#00a863]" />
        {tableLabel?.(assignedCode!) ?? assignedCode}
      </span>
    );

    const shell = isAdmin
      ? "w-full border-b border-gray-200"
      : "w-full sm:w-64 shrink-0 rounded-lg border border-gray-200";

    // Attendee: a seated ticket isn't selectable — show seat + Clear only.
    if (!isAdmin && assignedCode) {
      return (
        <div key={t.code} className={`flex items-start gap-2.5 p-3 bg-card ${shell}`}>
          <span className="size-[18px] mt-0.5 shrink-0 grid place-items-center rounded-full bg-[#00a863] text-white">
            <PiCheck size={11} strokeWidth={3} />
          </span>
          <span className="min-w-0 flex-1 flex flex-col gap-1">
            {nameEl}
            {capEl}
            <span className="flex items-center gap-2.5 mt-0.5">
              {seatPill}
              {!lockSeatSelectionPage && onClearTicket && (
                <button
                  type="button"
                  onClick={() => onClearTicket(t)}
                  className="text-xs font-medium text-primary-600 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </span>
          </span>
        </div>
      );
    }

    const disabled = openTable ? !isEligible(t, openTable, mode) && !isSel : false;
    const selectedEmphasis = isAdmin
      ? "bg-primary-100 shadow-[inset_2px_0_0_var(--color-primary-600)]"
      : "bg-primary-100 ring-2 ring-primary-600";
    return (
      <button
        key={t.code}
        type="button"
        role={isAdmin ? undefined : "radio"}
        aria-checked={isAdmin ? undefined : isSel}
        aria-pressed={isAdmin ? isSel : undefined}
        disabled={disabled}
        onClick={() => onToggle(t.code)}
        className={`text-left flex items-start gap-2.5 p-3 transition-colors ${shell} ${
          isSel ? selectedEmphasis : "bg-card hover:bg-gray-100"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`size-[18px] mt-0.5 shrink-0 grid place-items-center border ${
            isAdmin ? "rounded" : "rounded-full"
          } ${isSel ? "bg-primary-600 border-primary-600 text-white" : "bg-white border-gray-300"}`}
        >
          {isSel && (isAdmin
            ? <PiCheck size={12} strokeWidth={2} />
            : <span className="size-2 rounded-full bg-white" />)}
        </span>
        <span className="min-w-0 flex-1 flex flex-col gap-1">
          <span className="flex items-start gap-2">
            {nameEl}
            {isAdmin && assignedCode && <span className="shrink-0">{seatPill}</span>}
          </span>
          {capEl}
          {!isAdmin && (
            <span className="mt-0.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full text-gray-500 bg-gray-200">
                <span className="size-1.5 rounded-full bg-gray-400" />
                No table yet
              </span>
            </span>
          )}
        </span>
      </button>
    );
  };

  if (!isAdmin) {
    const selected = tickets.find((t) => selectedCodes.has(t.code));
    const summary = selected
      ? `${selected.attendee.firstName} ${selected.attendee.lastName} selected`
      : "Pick a ticket, then choose an available table.";

    return (
      <aside className="shrink-0 bg-card border-b border-gray-200">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full flex items-center gap-2 px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
        >
          <h2 className="text-base font-medium text-gray-700 m-0">Your tickets</h2>
          <span className="text-sm text-gray-400 tabular-nums">{tickets.length}</span>
          <span className="flex-1 min-w-0 text-sm text-gray-500 truncate">{summary}</span>
          <PiCaretDown
            size={16}
            className={`shrink-0 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {expanded && (
          <div
            className="flex flex-wrap gap-2 px-4 pb-3 max-h-64 overflow-y-auto scrollbar"
            role="radiogroup"
          >
            {tickets.map(renderTicket)}
            {loading && <div className="p-3 text-sm text-gray-400">Loading…</div>}
            {!loading && tickets.length === 0 && (
              <div className="p-3 text-sm text-gray-400">You have no tickets for this plan.</div>
            )}
          </div>
        )}
      </aside>
    );
  }

  return (
    <aside className="w-80 shrink-0 bg-card border-r border-gray-200 flex flex-col min-h-0">
      <div className="p-4 border-b border-gray-200 flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-base font-medium text-gray-700 m-0">Ticket holders</h2>
          <span className="text-sm text-gray-400 tabular-nums">
            {tickets.length} shown · {selectedCodes.size} selected
          </span>
        </div>
        <div className="relative">
          <PiMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name or email"
            aria-label="Search ticket holders"
            className="w-full text-sm text-gray-700 pl-8 pr-2.5 py-2 border border-gray-200 rounded-lg bg-gray-100 focus:outline-2 focus:outline-primary-600 focus:bg-white"
          />
        </div>
        {filterOptions && filterOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter ticket holders">
            {filterOptions.map((opt) => {
              const active = activeFilterIds?.includes(opt.id) ?? false;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onFilterToggle?.(opt.id)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                    active ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div ref={listRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scrollbar">
        {tickets.map(renderTicket)}

        {loading && <div className="p-3 text-sm text-gray-400 text-center">Loading…</div>}
        {!loading && tickets.length === 0 && (
          <div className="p-6 text-sm text-gray-400 text-center">No ticket holders match.</div>
        )}
      </div>
    </aside>
  );
}
