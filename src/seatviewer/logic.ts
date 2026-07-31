import type { SeatTableState, SeatTicket, SeatPlanMode } from "./types";

export type OccupancyLevel = "available" | "half" | "low" | "full";

type OccupancyInput = Pick<SeatTableState, "seatCount" | "occupancy" | "isLocked">;

/**
 * Availability bucket for a table, matching the existing Charmander legend:
 * full/locked → grey, >50% free → green, 10–50% → amber, <10% → red.
 */
export function occupancyLevel(table: OccupancyInput): OccupancyLevel {
  if (table.isLocked || table.seatCount <= 0 || table.occupancy >= table.seatCount) return "full";
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
  full: "#9aa6b8",
};

export function occupancyColor(table: OccupancyInput): string {
  return OCCUPANCY_FILL[occupancyLevel(table)];
}

export interface OccupancyLegendItem {
  level: OccupancyLevel;
  label: string;
  color: string;
}

/** Legend entries describing the occupancy color scale, in order. */
export const OCCUPANCY_LEGEND: OccupancyLegendItem[] = [
  { level: "available", label: "Open (>50% free)", color: OCCUPANCY_FILL.available },
  { level: "half", label: "Filling (10–50%)", color: OCCUPANCY_FILL.half },
  { level: "low", label: "Almost full (<10%)", color: OCCUPANCY_FILL.low },
  { level: "full", label: "Full / locked", color: OCCUPANCY_FILL.full },
];

/** Seating a ticket here is impossible, in either mode. */
export type SeatBlockReason = "locked" | "full" | "seated";

/** The table's own rules say no. Attendee mode refuses; admin mode warns. */
export type SeatFlagReason = "ticketType" | "tag";

export interface SeatEligibility {
  block: SeatBlockReason | null;
  flags: SeatFlagReason[];
}

export const SEAT_FLAG_LABELS: Record<SeatFlagReason, string> = {
  ticketType: "Ticket type isn’t on this table’s list",
  tag: "Missing a tag this table requires",
};

/**
 * Why a ticket may not belong at a table, split by severity. An empty
 * allowlist (`eligibleTicketCodes` / `tags`) means the table is unrestricted —
 * the same convention the backend uses on the attendee seat-selection path.
 */
export function seatEligibility(ticket: SeatTicket, table: SeatTableState): SeatEligibility {
  const flags: SeatFlagReason[] = [];
  if (table.eligibleTicketCodes.length > 0 && !table.eligibleTicketCodes.includes(ticket.ticketCode)) {
    flags.push("ticketType");
  }
  if (table.tags.length > 0 && !ticket.attendeeTags.some((t) => table.tags.includes(t))) {
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
export function isEligible(ticket: SeatTicket, table: SeatTableState, mode: SeatPlanMode): boolean {
  const { block, flags } = seatEligibility(ticket, table);
  if (block) return false;
  return mode === "admin" || flags.length === 0;
}
