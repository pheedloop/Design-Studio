import { describe, expect, it } from "vitest";
import { pseudoTranslate } from "./useDemoLocale";

// The pseudo-locale is the manual QA harness. If it stops substituting
// variables, every screenshot shows literal {{placeholders}} and looks like the
// library is broken when it is not — so the composition is worth pinning.

describe("pseudoTranslate", () => {
  it("accents and brackets a plain string", () => {
    const out = pseudoTranslate("viewer.legend.title");
    expect(out.startsWith("[")).toBe(true);
    expect(out).toContain("Łéğéñð");
  });

  it("substitutes variables rather than leaving placeholders on screen", () => {
    const out = pseudoTranslate("common.labelWithCount", { label: "Booths", count: 3 });
    expect(out).not.toContain("{{");
    expect(out).toContain("Booths");
    expect(out).toContain("3");
  });

  it("keeps interpolated values readable so host data stays distinguishable", () => {
    const out = pseudoTranslate("seatviewer.tickets.selected", { name: "Ada Lovelace" });
    expect(out).toContain("Ada Lovelace");
  });

  it("selects the plural variant before transforming", () => {
    expect(pseudoTranslate("seatviewer.table.seatsFree", { count: 1, total: 8 })).toContain(
      "şéáţ",
    );
    expect(pseudoTranslate("seatviewer.table.seatsFree", { count: 3, total: 8 })).toContain(
      "şéáţş",
    );
  });

  it("falls back to the key itself for an unknown key", () => {
    expect(pseudoTranslate("viewer.nope")).toContain("ñóƥé");
  });
});
