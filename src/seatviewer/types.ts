import type { FloorPlanData } from "@/types";
import type { Tier, FeatureKey, FeatureOverride } from "@/tiers";
import type { Translate } from "./i18n";
import type { TranslateContent } from "@/i18n/content";

export type SeatPlanMode = "admin" | "attendee";

/**
 * Per-table assignment + eligibility state, supplied by the host (Charmander) and
 * joined to FloorPlanData table elements by `element.properties.tableCode`.
 * Mirrors the existing Charmander `TableDetails` shape.
 */
export interface SeatTableState {
  tableCode: string;
  seatCount: number;
  occupancy: number;
  isLocked: boolean;
  /** Ticket-type codes allowed at this table (the per-table allowlist). */
  eligibleTicketCodes: string[];
  /** Eligibility tags; empty = no tag restriction. */
  tags: string[];
}

/**
 * A ticket holder row. Admin mode receives the full (paginated) event list;
 * attendee mode receives only the attendee's own tickets.
 */
export interface SeatTicket {
  /** Purchase code — primary key used when assigning. */
  code: string;
  /** Ticket-type code — matched against SeatTableState.eligibleTicketCodes. */
  ticketCode: string;
  ticketName: string;
  attendee: {
    firstName: string;
    lastName: string;
    email: string;
    organization?: string;
  };
  /** Currently-assigned table code, or null if unassigned. */
  tableCode: string | null;
  /** Seat-selection id — primary key used when unassigning. */
  seatSelectionCode: number | null;
  attendeeTags: string[];
}

/** A filter chip for the admin ticket list. The host owns the actual filtering. */
export interface SeatFilterOption {
  id: string;
  label: string;
}

/** A person currently seated at a table (lazy-loaded when a table is opened). */
export interface SeatOccupant {
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  organization?: string;
  /** Seat-selection id for this occupant — enables per-occupant unassign. */
  seatSelectionCode?: number | null;
}

/**
 * Presentational contract for the seat plan viewer. The host owns all data
 * fetching and API calls; the viewer renders and emits intent via callbacks.
 * The assign payload is uniform (`purchaseCodes: string[]`) in both modes — the
 * host routes it to the bulk or single endpoint as appropriate.
 */
export interface SeatPlanViewerProps {
  mode: SeatPlanMode;
  data: FloorPlanData;
  tables: SeatTableState[];

  // Ticket panel
  tickets: SeatTicket[];
  /**
   * Total matching the current search/filter, across all pages. `tickets` only
   * holds what has been paged in so far, so the count has to come from the host.
   */
  totalTickets?: number;
  ticketsLoading?: boolean;
  hasMoreTickets?: boolean;
  onLoadMoreTickets?: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  /** Filter chips for the admin list. The host owns filtering (production = API-driven). */
  filterOptions?: SeatFilterOption[];
  /** Ids of the currently-active filter chips. */
  activeFilterIds?: string[];
  /** Fired when a filter chip is toggled; the host updates its query/filtering. */
  onFilterToggle?: (id: string) => void;

  // Table occupants (lazy)
  occupants?: SeatOccupant[];
  occupantsLoading?: boolean;
  onTableOpen?: (tableCode: string) => void;

  // Mutations
  onAssign: (input: {
    tableCode: string;
    purchaseCodes: string[];
  }) => Promise<void> | void;
  onUnassign: (input: { seatSelectionCode: number }) => Promise<void> | void;

  // Attendee-mode constraints (mirror Charmander flags)
  lockSeatSelectionPage?: boolean;
  hideAttendeeDetails?: boolean;

  tier?: Tier;
  features?: Partial<Record<FeatureKey, FeatureOverride>>;

  /** Omit for built-in English. Must be referentially stable. */
  translate?: Translate;
  /**
   * Resolves author-entered text, which has no manifest key. Must be referentially
   * stable. Ticket holders' names are never passed through it.
   */
  translateContent?: TranslateContent;
  /** BCP-47 tag for number and list formatting. */
  locale?: string;
}
