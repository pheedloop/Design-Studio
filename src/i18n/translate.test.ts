import { describe, expect, it } from "vitest";
import { createSurfaceI18n } from "./context";
import { interpolate } from "./interpolate";
import type { Vars } from "./types";

// Fixture keys are deliberately not real manifest keys, so the returned functions
// are widened past StringKey.
type LooseTranslate = (key: string, vars?: Vars) => string;

const STRINGS = {
  viewer: {
    "legend.title": "Legend",
    hello: "Hello {{name}}",
  },
  seatviewer: {
    seatsFree_one: "{{count}} seat free",
    seatsFree_other: "{{count}} seats free",
  },
};

function surface() {
  const s = createSurfaceI18n(STRINGS);
  return {
    defaultTranslate: s.defaultTranslate as unknown as LooseTranslate,
    resolveEnglish: s.resolveEnglish as unknown as LooseTranslate,
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

describe("the host adapter shape documented in the README", () => {
  // What a host without an i18n runtime writes. The i18next variant collapses to
  // `i18n.t(resolveEnglish(key, opts), opts)` — same order, done by i18next.
  const adapt = (catalogue: Record<string, string>): LooseTranslate => {
    const { resolveEnglish } = surface();
    return (key, vars) => {
      const english = resolveEnglish(key, vars);
      return interpolate(catalogue[english] ?? english, vars);
    };
  };

  it("looks the catalogue up by the UNINTERPOLATED English", () => {
    // The ordering that matters. Interpolating first would produce "Hello Ada",
    // which no catalogue is keyed by, so every string with a variable in it
    // would silently fall back to English.
    const t = adapt({ "Hello {{name}}": "Bonjour {{name}}" });
    expect(t("viewer.hello", { name: "Ada" })).toBe("Bonjour Ada");
  });

  it("looks up the plural-selected English, not the base key", () => {
    const t = adapt({
      "{{count}} seat free": "{{count}} place libre",
      "{{count}} seats free": "{{count}} places libres",
    });
    expect(t("seatviewer.seatsFree", { count: 1 })).toBe("1 place libre");
    expect(t("seatviewer.seatsFree", { count: 3 })).toBe("3 places libres");
  });

  it("falls back to English for anything the catalogue has not got", () => {
    const t = adapt({ Legend: "Légende" });
    expect(t("viewer.legend.title")).toBe("Légende");
    expect(t("viewer.hello", { name: "Ada" })).toBe("Hello Ada");
  });
});
