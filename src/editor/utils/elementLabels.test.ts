import { describe, expect, it } from "vitest";
import { elementTypeLabel } from "./elementLabels";
import { createSurfaceI18n } from "../../i18n/context";
import { COMMON, EDITOR } from "../../i18n/strings";
import type { ElementType, Geometry } from "../../types";
import type { T } from "../i18n";

const { defaultTranslate } = createSurfaceI18n({ common: COMMON, editor: EDITOR });
const t = defaultTranslate as T;

const element = (type: ElementType, shape: Geometry["shape"], arrowHead = false) =>
  ({
    type,
    geometry: { shape } as Geometry,
    properties: arrowHead ? { arrowHead: { style: "triangle" } } : {},
  }) as Parameters<typeof elementTypeLabel>[0];

describe("elementTypeLabel", () => {
  it("names a non-shape element by its type", () => {
    // Was: the header rendered the raw enum, so a booth read "booth" and a
    // walkway read "walkway", untranslated in every locale.
    expect(elementTypeLabel(element("booth", "rect"), t)).toBe("Booth");
    expect(elementTypeLabel(element("walkway", "rect"), t)).toBe("Walkway");
    expect(elementTypeLabel(element("session_area", "rect"), t)).toBe(
      "Session Location",
    );
    expect(elementTypeLabel(element("meeting_room", "rect"), t)).toBe(
      "Meeting Room",
    );
  });

  it("names a shape by its geometry", () => {
    expect(elementTypeLabel(element("shape", "ellipse"), t)).toBe("Ellipse");
    expect(elementTypeLabel(element("shape", "polygon"), t)).toBe("Polygon");
  });

  it("names a shape carrying an arrowhead an arrow, whatever its geometry", () => {
    expect(elementTypeLabel(element("shape", "line", true), t)).toBe("Arrow");
  });
});
