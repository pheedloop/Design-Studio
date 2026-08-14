import { describe, expect, it } from "vitest";
import { createSurfaceI18n } from "./context";
import { COMMON, EDITOR, SEATVIEWER, VIEWER, flattenNamespaces } from "./strings";

const { defaultTranslate: t } = createSurfaceI18n({ common: COMMON, editor: EDITOR });

describe("editor plurals", () => {
  // Was `element{count > 1 ? "s" : ""}` — a count ternary at the call site, which
  // no locale with a different plural rule could follow.
  it("selects the clipped-element variant from count", () => {
    expect(t("editor.resize.clipped", { count: 1 })).toBe(
      "1 element will be outside the new canvas bounds.",
    );
    expect(t("editor.resize.clipped", { count: 4 })).toBe(
      "4 elements will be outside the new canvas bounds.",
    );
  });

  // Was a bare "{n} unsupported entities were skipped.", wrong at n = 1.
  it("selects the skipped-entity variant from count", () => {
    expect(t("editor.background.skipped", { count: 1 })).toBe(
      "1 unsupported entity was skipped.",
    );
    expect(t("editor.background.skipped", { count: 3 })).toBe(
      "3 unsupported entities were skipped.",
    );
  });
});

describe("the manifest", () => {
  const flat = flattenNamespaces({
    common: COMMON,
    viewer: VIEWER,
    seatviewer: SEATVIEWER,
    editor: EDITOR,
  });

  it("pairs every _one with an _other", () => {
    const keys = Object.keys(flat);
    const singulars = keys.filter((key) => key.endsWith("_one"));
    expect(singulars.length).toBeGreaterThan(0);
    for (const key of singulars) {
      expect(keys).toContain(`${key.slice(0, -"_one".length)}_other`);
    }
  });
});
