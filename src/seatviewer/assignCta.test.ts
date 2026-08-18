import { describe, expect, it } from "vitest";
import { createSurfaceI18n } from "../i18n/context";
import { COMMON, SEATVIEWER } from "../i18n/strings";
import { assignCta } from "./labels";
import type { SeatPlanMode, SeatTableState, SeatTicket } from "./types";

const { defaultTranslate: t } = createSurfaceI18n({
  common: COMMON,
  seatviewer: SEATVIEWER,
});

const table = (over: Partial<SeatTableState> = {}): SeatTableState => ({
  tableCode: "T1",
  seatCount: 8,
  occupancy: 0,
  isLocked: false,
  eligibleTicketCodes: ["VIP"],
  tags: [],
  ...over,
});

const ticket = (over: Partial<SeatTicket> = {}): SeatTicket => ({
  code: "P1",
  ticketCode: "VIP",
  ticketName: "VIP Gala",
  attendee: { firstName: "Ada", lastName: "Lovelace", email: "a@x.com" },
  tableCode: null,
  seatSelectionCode: null,
  attendeeTags: [],
  ...over,
});

function cta(
  mode: SeatPlanMode,
  over: {
    openTable?: SeatTableState | null;
    assignableCodes?: string[];
    selected?: SeatTicket[];
    tableNames?: [string, string][];
  } = {},
) {
  const selected = over.selected ?? [];
  return assignCta({
    openTable: over.openTable === undefined ? table() : over.openTable,
    mode,
    assignableCodes: over.assignableCodes ?? [],
    selectedCodes: new Set(selected.map((s) => s.code)),
    ticketByCode: new Map(selected.map((s) => [s.code, s])),
    tableNameByCode: new Map(over.tableNames ?? []),
  }, t);
}

describe("table-level blocks (both modes)", () => {
  it("is inert with no table open", () => {
    expect(cta("admin", { openTable: null })).toEqual({ label: "Assign", disabled: true });
  });

  it("explains a locked table", () => {
    const r = cta("attendee", { openTable: table({ isLocked: true }) });
    expect(r.disabled).toBe(true);
    expect(r.label).toBe("Table locked");
    expect(r.hint).toBe("This table isn’t open for selection.");
  });

  it("explains a full table", () => {
    const r = cta("admin", { openTable: table({ seatCount: 4, occupancy: 4 }) });
    expect(r.label).toBe("Table full");
    expect(r.hint).toBe("No seats left at this table.");
  });
});

describe("admin", () => {
  it("counts the assignable selection", () => {
    const three = [ticket({ code: "a" }), ticket({ code: "b" }), ticket({ code: "c" })];
    const r = cta("admin", { assignableCodes: ["a", "b", "c"], selected: three });
    expect(r).toEqual({
      label: "Assign 3 ticket holders",
      disabled: false,
      hint: undefined,
    });
  });

  // Was "Assign {{count}} selected", with no singular form for a locale to inflect.
  it("uses the singular label for one holder", () => {
    const one = [ticket({ code: "a" })];
    const r = cta("admin", { assignableCodes: ["a"], selected: one });
    expect(r.label).toBe("Assign 1 ticket holder");
  });

  it("warns that rule-mismatched picks get seated anyway, with the right plural", () => {
    const wrong = (code: string) => ticket({ code, ticketCode: "GA" });
    const three = [ticket({ code: "a" }), wrong("b"), wrong("c")];
    expect(cta("admin", { assignableCodes: ["a", "b"], selected: three }).hint).toBe(
      "1 of 2 doesn’t meet this table’s rules — they’ll be seated anyway.",
    );
    expect(cta("admin", { assignableCodes: ["a", "b", "c"], selected: three }).hint).toBe(
      "2 of 3 don’t meet this table’s rules — they’ll be seated anyway.",
    );
  });

  it("asks for a selection when nothing is assignable", () => {
    expect(cta("admin").label).toBe("Select ticket holders");
    expect(cta("admin").hint).toBeUndefined();

    const r = cta("admin", { selected: [ticket({ tableCode: "T9" })] });
    expect(r.hint).toBe("Everyone selected is already seated. Clear a seat to move them.");
  });
});

describe("attendee", () => {
  it("asks for a ticket first", () => {
    const r = cta("attendee");
    expect(r.label).toBe("Select a ticket first");
    expect(r.hint).toBe("Choose one of your tickets above.");
  });

  it("names the table an already-seated ticket is at", () => {
    const seated = ticket({ tableCode: "T9" });
    const r = cta("attendee", { selected: [seated], tableNames: [["T9", "Head Table"]] });
    expect(r.label).toBe("Ticket already seated");
    expect(r.hint).toBe("Ada is at Head Table. Clear it to move.");
  });

  it("falls back to the table code when it has no name", () => {
    const seated = ticket({ tableCode: "T9" });
    expect(cta("attendee", { selected: [seated] }).hint).toBe(
      "Ada is at T9. Clear it to move.",
    );
  });

  it("rejects an ineligible ticket type", () => {
    const wrong = ticket({ ticketCode: "GA", ticketName: "General Admission" });
    const r = cta("attendee", { selected: [wrong] });
    expect(r.label).toBe("Not eligible");
    expect(r.hint).toBe("General Admission can’t be seated at this table.");
  });

  it("rejects a tag-reserved table", () => {
    const r = cta("attendee", {
      openTable: table({ tags: ["sponsor"] }),
      selected: [ticket()],
    });
    expect(r.label).toBe("Reserved table");
    expect(r.hint).toBe("This table is reserved for a specific group.");
  });

  it("allows a matching tag through", () => {
    const r = cta("attendee", {
      openTable: table({ tags: ["sponsor"] }),
      selected: [ticket({ attendeeTags: ["sponsor"] })],
    });
    expect(r).toEqual({ label: "Assign Ada here", disabled: false });
  });

  it("offers the assign action for an eligible ticket", () => {
    expect(cta("attendee", { selected: [ticket()] })).toEqual({
      label: "Assign Ada here",
      disabled: false,
    });
  });
});
