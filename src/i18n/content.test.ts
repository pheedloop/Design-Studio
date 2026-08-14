import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { FloorPlanData } from "../types";
import { useSearch } from "../viewer/hooks/useSearch";
import { translateExhibitors, translateFloorPlan } from "./content";

const FR: Record<string, string> = {
  "Casual Play Hall": "Salle de jeu libre",
  "Main Stage": "Scène principale",
  Sponsors: "Commanditaires",
  "Wizards of the Coast": "Sorciers de la Côte",
};
const translate = (text: string) => FR[text] ?? text;

function plan(): FloorPlanData {
  return {
    elements: [
      {
        id: "a",
        type: "session_area",
        geometry: { kind: "rect", x: 0, y: 0, width: 10, height: 10 },
        properties: { name: "Casual Play Hall", color: "#fff", zIndex: 1 },
      },
      {
        id: "b",
        type: "text",
        geometry: { kind: "rect", x: 0, y: 0, width: 10, height: 10 },
        properties: { text: "Main Stage", color: "#fff", zIndex: 2 },
      },
      {
        id: "c",
        type: "booth",
        geometry: { kind: "rect", x: 0, y: 0, width: 10, height: 10 },
        properties: { name: "B-101", color: "#fff", zIndex: 3 },
      },
    ],
    legend: {
      entries: [{ id: "l1", label: "Sponsors", color: "#000", visible: true }],
      position: "top-left",
      visible: true,
    },
  } as unknown as FloorPlanData;
}

describe("translateFloorPlan", () => {
  it("translates element names", () => {
    const out = translateFloorPlan(plan(), translate);
    expect(out.elements[0].properties.name).toBe("Salle de jeu libre");
  });

  it("translates text-element content and legend labels", () => {
    const out = translateFloorPlan(plan(), translate);
    expect(out.elements[1].properties.text).toBe("Scène principale");
    expect(out.legend.entries[0].label).toBe("Commanditaires");
  });

  it("leaves text with no catalog entry as authored", () => {
    const out = translateFloorPlan(plan(), translate);
    expect(out.elements[2].properties.name).toBe("B-101");
  });

  it("does not touch identity or geometry", () => {
    const before = plan();
    const out = translateFloorPlan(before, translate);
    expect(out.elements.map(e => e.id)).toEqual(["a", "b", "c"]);
    expect(out.elements[0].geometry).toEqual(before.elements[0].geometry);
    expect(out.elements[0].properties.color).toBe("#fff");
  });

  it("does not mutate the input", () => {
    const before = plan();
    translateFloorPlan(before, translate);
    expect(before.elements[0].properties.name).toBe("Casual Play Hall");
  });

  it("leaves an unnamed element unnamed rather than translating \"\"", () => {
    const source = plan();
    source.elements[0].properties.name = "";
    const out = translateFloorPlan(source, translate);
    expect(out.elements[0].properties.name).toBe("");
  });

  // An entry translated to "" used to blank the label on the map; a catalog with
  // a hole in it should read as English, not as nothing.
  it("keeps the authored text when the catalog entry is empty", () => {
    const blank = (text: string) => (text === "Casual Play Hall" ? "" : text);
    const out = translateFloorPlan(plan(), blank);
    expect(out.elements[0].properties.name).toBe("Casual Play Hall");
  });
});

describe("search sees what the list shows", () => {
  // The bug this guards: translating at the render site but not in the search
  // index leaves the user unable to find a row they can plainly read.
  it("matches the translated name, and no longer the English one", () => {
    const elements = translateFloorPlan(plan(), translate).elements;
    const { result } = renderHook(() => useSearch(elements, []));

    act(() => result.current.setQuery("Salle de jeu"));
    expect(result.current.results.map(r => r.name)).toEqual([
      "Salle de jeu libre",
    ]);

    act(() => result.current.setQuery("Casual Play"));
    expect(result.current.results).toEqual([]);
  });
});

describe("translateExhibitors", () => {
  it("translates the name and keeps the identity fields", () => {
    const [out] = translateExhibitors(
      [
        {
          id: "EX1",
          name: "Wizards of the Coast",
          boothSlug: "b-101",
          logo: "x.png",
        },
      ],
      translate,
    );
    expect(out.name).toBe("Sorciers de la Côte");
    expect(out).toMatchObject({ id: "EX1", boothSlug: "b-101", logo: "x.png" });
  });
});
