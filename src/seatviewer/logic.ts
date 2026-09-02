import { GRAY_400 } from "@/canvasColors";
import type { StringKey } from "./i18n";
import type { SeatTableState, SeatTicket, SeatPlanMode } from "./types";

export type OccupancyLevel = "available" | "half" | "low" | "full";

type OccupancyInput = Pick<
  SeatTableState,
  "seatCount" | "occupancy" | "isLocked"
>;

/**
 * Availability bucket for a table, matching the existing Charmander legend:
 * full/locked → grey, >50% free → green, 10–50% → amber, <10% → red.
 */
export function occupancyLevel(table: OccupancyInput): OccupancyLevel {
  if (
    table.isLocked ||
    table.seatCount <= 0 ||
    table.occupancy >= table.seatCount
  )
    return "full";
  const freePct = ((table.seatCount - table.occupancy) / table.seatCount) * 100;
  if (freePct > 50) return "available";
  if (freePct >= 10) return "half";
  return "low";
}

/**
 * Konva fill color per availability level. Mid-toned (not the HTML wash) so the
 * white table label stays legible on the canvas.
 */
const OCCUPANCY_FILL: Record<OccupancyLevel, string> = {
  available: "#34b87a",
  half: "#f0a92e",
  low: "#e25c5c",
  full: GRAY_400,
};

export function occupancyColor(table: OccupancyInput): string {
  return OCCUPANCY_FILL[occupancyLevel(table)];
}

export interface OccupancyLegendItem {
  level: OccupancyLevel;
  /** Module scope, so no hook reaches here — the render site translates. */
  labelKey: StringKey;
  color: string;
}

/** Legend entries describing the occupancy color scale, in order. */
export const OCCUPANCY_LEGEND: OccupancyLegendItem[] = [
  {
    level: "available",
    labelKey: "seatviewer.legend.available",
    color: OCCUPANCY_FILL.available,
  },
  {
    level: "half",
    labelKey: "seatviewer.legend.half",
    color: OCCUPANCY_FILL.half,
  },
  {
    level: "low",
    labelKey: "seatviewer.legend.low",
    color: OCCUPANCY_FILL.low,
  },
  {
    level: "full",
    labelKey: "seatviewer.legend.full",
    color: OCCUPANCY_FILL.full,
  },
];

/** Seating a ticket here is impossible, in either mode. */
export type SeatBlockReason = "locked" | "full" | "seated";

/** The table's own rules say no. Attendee mode refuses; admin mode warns. */
export type SeatFlagReason = "ticketType" | "tag";

export interface SeatEligibility {
  block: SeatBlockReason | null;
  flags: SeatFlagReason[];
}

/** Module scope, so no hook reaches here — the render site translates. */
export const SEAT_FLAG_LABEL_KEYS: Record<SeatFlagReason, StringKey> = {
  ticketType: "seatviewer.flag.ticketType",
  tag: "seatviewer.flag.tag",
};

/**
 * Why a ticket may not belong at a table, split by severity. An empty
 * allowlist (`eligibleTicketCodes` / `tags`) means the table is unrestricted —
 * the same convention the backend uses on the attendee seat-selection path.
 */
export function seatEligibility(
  ticket: SeatTicket,
  table: SeatTableState,
): SeatEligibility {
  const flags: SeatFlagReason[] = [];
  if (
    table.eligibleTicketCodes.length > 0 &&
    !table.eligibleTicketCodes.includes(ticket.ticketCode)
  ) {
    flags.push("ticketType");
  }
  if (
    table.tags.length > 0 &&
    !ticket.attendeeTags.some(t => table.tags.includes(t))
  ) {
    flags.push("tag");
  }

  let block: SeatBlockReason | null = null;
  if (table.isLocked) block = "locked";
  else if (table.occupancy >= table.seatCount) block = "full";
  else if (ticket.tableCode) block = "seated";

  return { block, flags };
}

/**
 * Whether the assign path stays open. Admin assigns through a rule mismatch and
 * carries the flag into the UI; attendee mode treats the same mismatch as a stop.
 */
export function isEligible(
  ticket: SeatTicket,
  table: SeatTableState,
  mode: SeatPlanMode,
): boolean {
  const { block, flags } = seatEligibility(ticket, table);
  if (block) return false;
  return mode === "admin" || flags.length === 0;
}
