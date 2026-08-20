import { useRef, useState } from "react";
import {
  PiMagnifyingGlass,
  PiCheck,
  PiCaretDown,
  PiWarningCircle,
} from "react-icons/pi";
import type {
  SeatFilterOption,
  SeatPlanMode,
  SeatTableState,
  SeatTicket,
} from "../types";
import { isEligible, seatEligibility, SEAT_FLAG_LABEL_KEYS } from "../logic";
import { useT } from "../i18n";

interface TicketPanelProps {
  mode: SeatPlanMode;
  tickets: SeatTicket[];
  /** Total across all pages; `tickets` is only what has loaded so far. */
  totalTickets?: number;
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
 *  - admin: a left rail — multi-select over the event-wide list, with search,
 *    filter chips and infinite scroll.
 *  - attendee: a collapsible strip above the canvas — single-select rows over
 *    the attendee's own tickets.
 */
export function TicketPanel({
  mode,
  tickets,
  totalTickets,
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
  const t = useT();
  const listRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(true);
  const isAdmin = mode === "admin";

  const handleScroll = () => {
    const el = listRef.current;
    if (!el || !hasMore || loading || !onLoadMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) onLoadMore();
  };

  const seatPill = (tableCode: string) => (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full text-[#14653a] bg-[rgba(0,168,99,0.12)] whitespace-nowrap">
      <span className="size-1.5 rounded-full bg-[#00a863]" />
      {tableLabel?.(tableCode) ?? tableCode}
    </span>
  );

  const attendeeName = (ticket: SeatTicket) =>
    `${ticket.attendee.firstName} ${ticket.attendee.lastName}`;

  const renderAdminRow = (ticket: SeatTicket) => {
    const isSel = selectedCodes.has(ticket.code);
    const disabled = openTable
      ? !isEligible(ticket, openTable, mode) && !isSel
      : false;
    // Admins may seat against the rules — surface the mismatch instead of blocking.
    const flags =
      openTable && !disabled ? seatEligibility(ticket, openTable).flags : [];

    return (
      <button
        key={ticket.code}
        type="button"
        aria-pressed={isSel}
        disabled={disabled}
        onClick={() => onToggle(ticket.code)}
        className={`w-full text-left flex items-start gap-2.5 p-3 border-b border-gray-200 transition-colors ${
          isSel
            ? "bg-primary-100 shadow-[inset_2px_0_0_var(--color-primary-600)]"
            : "hover:bg-gray-100"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`size-[18px] mt-0.5 shrink-0 grid place-items-center border rounded ${
            isSel
              ? "bg-primary-600 border-primary-600 text-white"
              : "bg-white border-gray-300"
          }`}
        >
          {isSel && <PiCheck size={12} strokeWidth={2} />}
        </span>
        <span className="min-w-0 flex-1 flex flex-col gap-1">
          <span className="flex items-start gap-2">
            <span className="flex-1 min-w-0 text-sm font-medium text-gray-700 leading-snug line-clamp-2">
              {attendeeName(ticket)}
            </span>
            {ticket.tableCode && (
              <span className="shrink-0">{seatPill(ticket.tableCode)}</span>
            )}
          </span>
          <span className="text-sm text-gray-500 leading-snug break-words">
            <span className="text-gray-600 font-medium">
              {ticket.ticketName}
            </span>
            {/* Guest tickets carry no email — don't leave the separator dangling. */}
            {ticket.attendee.email ? ` · ${ticket.attendee.email}` : ""}
          </span>
          {flags.length > 0 && (
            <span className="mt-0.5 flex flex-wrap gap-1.5">
              {flags.map(f => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full text-[#8a5300] bg-[rgba(240,169,46,0.16)]"
                >
                  <PiWarningCircle size={12} />
                  {t(SEAT_FLAG_LABEL_KEYS[f])}
                </span>
              ))}
            </span>
          )}
        </span>
      </button>
    );
  };

  const renderAttendeeRow = (ticket: SeatTicket) => {
    const isSel = selectedCodes.has(ticket.code);

    const label = (
      <span className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
        <span className="truncate text-sm font-medium text-gray-700">
          {attendeeName(ticket)}
        </span>
        <span className="truncate text-sm text-gray-500">
          {ticket.ticketName}
        </span>
      </span>
    );

    if (ticket.tableCode) {
      return (
        <div
          key={ticket.code}
          className="w-full flex items-center gap-3 px-4 py-2.5 border-b border-gray-200"
        >
          <span className="size-[18px] shrink-0 grid place-items-center rounded-full bg-[#00a863] text-white">
            <PiCheck size={11} strokeWidth={3} />
          </span>
          {label}
          <span className="shrink-0 flex items-center gap-2.5">
            {seatPill(ticket.tableCode)}
            {!lockSeatSelectionPage && onClearTicket && (
              <button
                type="button"
                onClick={() => onClearTicket(ticket)}
                className="text-xs font-medium text-primary-600 hover:underline cursor-pointer"
              >
                {t("seatviewer.tickets.clear")}
              </button>
            )}
          </span>
        </div>
      );
    }

    const disabled = openTable
      ? !isEligible(ticket, openTable, mode) && !isSel
      : false;
    return (
      <button
        key={ticket.code}
        type="button"
        role="radio"
        aria-checked={isSel}
        disabled={disabled}
        onClick={() => onToggle(ticket.code)}
        className={`w-full text-left flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 transition-colors ${
          isSel
            ? "bg-primary-100 shadow-[inset_2px_0_0_var(--color-primary-600)]"
            : "hover:bg-gray-100"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`size-[18px] shrink-0 grid place-items-center border rounded-full ${
            isSel
              ? "bg-primary-600 border-primary-600 text-white"
              : "bg-white border-gray-300"
          }`}
        >
          {isSel && <span className="size-2 rounded-full bg-white" />}
        </span>
        {label}
        <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full text-gray-500 bg-gray-200 whitespace-nowrap">
          <span className="size-1.5 rounded-full bg-gray-400" />
          {t("seatviewer.tickets.noTable")}
        </span>
      </button>
    );
  };

  if (!isAdmin) {
    const selected = tickets.find(tk => selectedCodes.has(tk.code));
    const summary = selected
      ? t("seatviewer.tickets.selected", { name: attendeeName(selected) })
      : t("seatviewer.tickets.pickPrompt");

    return (
      <aside className="shrink-0 bg-card border-b border-gray-200">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(prev => !prev)}
          className="w-full flex items-center gap-2 px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
        >
          <h2 className="text-base font-medium text-gray-700 m-0">
            {t("seatviewer.tickets.yours")}
          </h2>
          <span className="text-sm text-gray-400 tabular-nums">
            {tickets.length}
          </span>
          <span className="flex-1 min-w-0 text-sm text-gray-500 truncate">
            {summary}
          </span>
          <PiCaretDown
            size={16}
            className={`shrink-0 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {expanded && (
          <div
            className="max-h-56 overflow-y-auto scrollbar border-t border-gray-200"
            role="radiogroup"
          >
            {tickets.map(renderAttendeeRow)}
            {loading && (
              <div className="p-3 text-sm text-gray-400">
                {t("seatviewer.loading")}
              </div>
            )}
            {!loading && tickets.length === 0 && (
              <div className="p-3 text-sm text-gray-400">
                {t("seatviewer.tickets.noneYours")}
              </div>
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
          <h2 className="text-base font-medium text-gray-700 m-0">
            {t("seatviewer.tickets.holders")}
          </h2>
          <span className="text-sm text-gray-400 tabular-nums">
            {t("seatviewer.tickets.counts", {
              total: totalTickets ?? tickets.length,
              selected: selectedCodes.size,
            })}
          </span>
        </div>
        <div className="relative">
          <PiMagnifyingGlass
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={t("seatviewer.tickets.searchPlaceholder")}
            aria-label={t("seatviewer.tickets.searchLabel")}
            className="w-full text-sm text-gray-700 pl-8 pr-2.5 py-2 border border-gray-200 rounded-lg bg-gray-100 focus:outline-2 focus:outline-primary-600 focus:bg-white"
          />
        </div>
        {filterOptions && filterOptions.length > 0 && (
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label={t("seatviewer.tickets.filterLabel")}
          >
            {filterOptions.map(opt => {
              const active = activeFilterIds?.includes(opt.id) ?? false;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onFilterToggle?.(opt.id)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                    active
                      ? "bg-primary-600 text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar"
      >
        {tickets.map(renderAdminRow)}

        {loading && (
          <div className="p-3 text-sm text-gray-400 text-center">
            {t("seatviewer.loading")}
          </div>
        )}
        {!loading && tickets.length === 0 && (
          <div className="p-6 text-sm text-gray-400 text-center">
            {t("seatviewer.tickets.noMatch")}
          </div>
        )}
      </div>
    </aside>
  );
}
