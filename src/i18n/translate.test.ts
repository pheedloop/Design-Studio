import { describe, expect, it, vi } from "vitest";
import { createSurfaceI18n } from "./context";
import type { Vars } from "./types";

// Fixture keys are deliberately not real manifest keys, so the returned functions
// are widened past StringKey.
type LooseTranslate = (key: string, vars?: Vars) => string;
type LooseLookup = (english: string, key: string) => string | undefined;

const STRINGS = {
  "viewer.legend.title": "Legend",
  "viewer.hello": "Hello {{name}}",
  "seatviewer.seatsFree_one": "{{count}} seat free",
  "seatviewer.seatsFree_other": "{{count}} seats free",
};

function surface() {
  const s = createSurfaceI18n(STRINGS);
  return {
    defaultTranslate: s.defaultTranslate as unknown as LooseTranslate,
    resolveEnglish: s.resolveEnglish as unknown as LooseTranslate,
    createTranslate: s.createTranslate as unknown as (
      lookup: LooseLookup,
    ) => LooseTranslate,
  };
}

describe("defaultTranslate — the no-host-translator path", () => {
  it("renders the built-in English", () => {
    expect(surface().defaultTranslate("viewer.legend.title")).toBe("Legend");
  });

  it("interpolates", () => {
    expect(surface().defaultTranslate("viewer.hello", { name: "Ada" })).toBe(
      "Hello Ada",
    );
  });

  it("selects and interpolates the plural variant", () => {
    const { defaultTranslate } = surface();
    expect(defaultTranslate("seatviewer.seatsFree", { count: 1 })).toBe("1 seat free");
    expect(defaultTranslate("seatviewer.seatsFree", { count: 4 })).toBe("4 seats free");
  });

  it("never returns empty for an unknown key", () => {
    expect(surface().defaultTranslate("viewer.nope")).toBe("viewer.nope");
  });
});

describe("resolveEnglish — what a host passes as its defaultValue", () => {
  it("returns the template uninterpolated", () => {
    expect(surface().resolveEnglish("viewer.hello", { name: "Ada" })).toBe(
      "Hello {{name}}",
    );
  });

  it("is plural-selected", () => {
    expect(surface().resolveEnglish("seatviewer.seatsFree", { count: 1 })).toBe(
      "{{count}} seat free",
    );
  });
});

describe("createTranslate — resolution order", () => {
  it("hands the lookup the UNINTERPOLATED English", () => {
    // If interpolation ran first the lookup would get "Hello Ada", match
    // nothing, and fall back to English silently.
    const lookup = vi.fn<LooseLookup>(() => undefined);
    surface().createTranslate(lookup)("viewer.hello", { name: "Ada" });

    expect(lookup).toHaveBeenCalledWith("Hello {{name}}", "viewer.hello");
  });

  it("hands the lookup the plural-selected English", () => {
    const lookup = vi.fn<LooseLookup>(() => undefined);
    const t = surface().createTranslate(lookup);

    t("seatviewer.seatsFree", { count: 1 });
    expect(lookup).toHaveBeenLastCalledWith("{{count}} seat free", "seatviewer.seatsFree");

    t("seatviewer.seatsFree", { count: 9 });
    expect(lookup).toHaveBeenLastCalledWith("{{count}} seats free", "seatviewer.seatsFree");
  });

  it("interpolates the translation AFTER the lookup", () => {
    const t = surface().createTranslate(() => "Bonjour {{name}}");
    expect(t("viewer.hello", { name: "Ada" })).toBe("Bonjour Ada");
  });

  it("translates a counted string end to end against an English-keyed catalogue", () => {
    const ugc: Record<string, string> = {
      "{{count}} seat free": "{{count}} place libre",
      "{{count}} seats free": "{{count}} places libres",
    };
    const t = surface().createTranslate((english) => ugc[english]);

    expect(t("seatviewer.seatsFree", { count: 1 })).toBe("1 place libre");
    expect(t("seatviewer.seatsFree", { count: 3 })).toBe("3 places libres");
  });

  it("falls back to English when the lookup misses", () => {
    const t = surface().createTranslate(() => undefined);
    expect(t("viewer.legend.title")).toBe("Legend");
  });

  it("falls back to English when the lookup returns an empty string", () => {
    const t = surface().createTranslate(() => "");
    expect(t("viewer.legend.title")).toBe("Legend");
  });

  it("falls back to English for a key the catalogue has never seen", () => {
    const t = surface().createTranslate((english) =>
      english === "Legend" ? "Légende" : undefined,
    );
    expect(t("viewer.legend.title")).toBe("Légende");
    expect(t("viewer.hello", { name: "Ada" })).toBe("Hello Ada");
  });
});
