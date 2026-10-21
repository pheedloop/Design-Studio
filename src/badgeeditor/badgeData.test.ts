import { describe, expect, it } from "vitest";
import { ticketsForField, type BadgeTicketData } from "./badgeData";
import type { BadgeField } from "./model";

const tickets: BadgeTicketData[] = [
  { name: "Gala", code: "GALA" },
  { name: "Expo", code: "EXPO" },
  { name: "Main", code: "MAIN" },
  { name: "Legacy" },
];
const field = (extra: Partial<BadgeField>) =>
  ({ kind: "tickets", ...extra }) as BadgeField;
const names = (f: BadgeField) => ticketsForField(f, tickets).map(t => t.name);

describe("ticketsForField", () => {
  it.each([
    ["no codes: purchase order, capped at numRows", {}, ["Gala"]],
    ["no codes, numRows 3", { numRows: 3 }, ["Gala", "Expo", "Main"]],
    [
      "codes filter and order the tickets",
      { ticketCodes: ["MAIN", "GALA"], numRows: 5 },
      ["Main", "Gala"],
    ],
    [
      "numRows caps after ordering",
      { ticketCodes: ["MAIN", "GALA"], numRows: 1 },
      ["Main"],
    ],
    [
      "tickets without a matching code are dropped",
      { ticketCodes: ["NOPE"], numRows: 5 },
      [],
    ],
  ])("%s", (_, extra, expected) => {
    expect(names(field(extra))).toEqual(expected);
  });
});
