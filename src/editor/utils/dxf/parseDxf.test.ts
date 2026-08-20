import { describe, it, expect } from "vitest";
import type { Unit } from "@/types";
import { parseDxf } from "./parseDxf";

// --- Fixture builders -------------------------------------------------------
//
// DXF is a flat stream of (group code, value) line pairs. Writing that out by
// hand buries the interesting numbers in boilerplate, so these builders keep a
// fixture down to the coordinates that matter.

type Pairs = string[];

const section = (name: string, body: Pairs): Pairs => [
  "0",
  "SECTION",
  "2",
  name,
  ...body,
  "0",
  "ENDSEC",
];

function dxfDoc(opts: { insunits?: number; entities?: Pairs[] } = {}): string {
  const header =
    opts.insunits === undefined
      ? [] // no HEADER section at all — the common case for exported fragments
      : section("HEADER", ["9", "$INSUNITS", "70", String(opts.insunits)]);
  return [
    ...header,
    ...section("ENTITIES", (opts.entities ?? []).flat()),
    "0",
    "EOF",
  ].join("\n");
}

const LINE = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  layer = "WALLS",
): Pairs => [
  ...["0", "LINE", "8", layer],
  ...["10", `${x1}`, "20", `${y1}`],
  ...["11", `${x2}`, "21", `${y2}`],
];

/** `points` is flat [x, y, x, y, ...], matching the primitive it becomes. */
const LWPOLYLINE = (
  points: number[],
  closed: boolean,
  layer = "ROOMS",
): Pairs => [
  ...["0", "LWPOLYLINE", "8", layer],
  ...["90", `${points.length / 2}`, "70", closed ? "1" : "0"],
  ...points.flatMap((v, i) => (i % 2 === 0 ? ["10", `${v}`] : ["20", `${v}`])),
];

const CIRCLE = (cx: number, cy: number, r: number, layer = "HOLES"): Pairs => [
  ...["0", "CIRCLE", "8", layer],
  ...["10", `${cx}`, "20", `${cy}`, "40", `${r}`],
];

/** Angles are degrees on the wire; dxf-parser hands them back as radians. */
const ARC = (
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
  layer = "ARCS",
): Pairs => [
  ...["0", "ARC", "8", layer],
  ...["10", `${cx}`, "20", `${cy}`, "40", `${r}`],
  ...["50", `${startDeg}`, "51", `${endDeg}`],
];

const ELLIPSE = (
  cx: number,
  cy: number,
  majorX: number,
  majorY: number,
  axisRatio: number,
  layer = "ARCS",
): Pairs => [
  ...["0", "ELLIPSE", "8", layer],
  ...["10", `${cx}`, "20", `${cy}`],
  ...["11", `${majorX}`, "21", `${majorY}`],
  ...["40", `${axisRatio}`],
  ...["41", "0", "42", `${Math.PI * 2}`],
];

const TEXT = (
  x: number,
  y: number,
  height: number,
  rotationDeg: number,
  layer = "LABELS",
): Pairs => [
  ...["0", "TEXT", "8", layer],
  ...["10", `${x}`, "20", `${y}`, "40", `${height}`],
  ...["1", "A1", "50", `${rotationDeg}`],
];

const POINT = (x: number, y: number): Pairs => [
  ...["0", "POINT", "8", "JUNK", "10", `${x}`, "20", `${y}`],
];

/** Radius of a sampled point about (cx, cy) — the invariant every arc and
 *  circle sample has to hold. */
const radiusAt = (points: number[], i: number, cx = 0, cy = 0): number =>
  Math.hypot(points[i * 2] - cx, points[i * 2 + 1] - cy);

// --- Tests -----------------------------------------------------------------

describe("parseDxf entity conversion", () => {
  it("converts a LINE to a line primitive on its own layer", () => {
    const { primitives } = parseDxf(dxfDoc({ entities: [LINE(0, 0, 10, 5)] }));
    expect(primitives).toEqual([
      { kind: "line", layer: "WALLS", points: [0, 0, 10, 5] },
    ]);
  });

  it("carries the LWPOLYLINE closed flag through to the primitive", () => {
    const open = parseDxf(
      dxfDoc({ entities: [LWPOLYLINE([0, 0, 1, 0], false)] }),
    );
    const shut = parseDxf(
      dxfDoc({ entities: [LWPOLYLINE([0, 0, 1, 0, 1, 1], true)] }),
    );
    expect(open.primitives[0]).toMatchObject({ closed: false });
    expect(shut.primitives[0]).toMatchObject({
      kind: "polyline",
      closed: true,
      points: [0, 0, 1, 0, 1, 1],
    });
  });

  it("keeps a top-level CIRCLE native instead of sampling it", () => {
    // Only untransformed circles stay native — compact, and a Y-flip can't
    // distort them. Anything inside a block gets sampled to a polyline.
    const { primitives } = parseDxf(dxfDoc({ entities: [CIRCLE(2, 3, 1.5)] }));
    expect(primitives).toEqual([
      { kind: "circle", layer: "HOLES", cx: 2, cy: 3, r: 1.5 },
    ]);
  });

  it("converts TEXT rotation from degrees to radians", () => {
    const { primitives } = parseDxf(
      dxfDoc({ entities: [TEXT(1, 2, 2.5, 30)] }),
    );
    expect(primitives[0]).toMatchObject({ kind: "text", height: 2.5 });
    expect((primitives[0] as { rotation: number }).rotation).toBeCloseTo(
      Math.PI / 6,
    );
  });

  it("counts entities it cannot render without emitting them", () => {
    const { primitives, unsupportedCount } = parseDxf(
      dxfDoc({ entities: [POINT(1, 1), LINE(0, 0, 1, 1)] }),
    );
    expect(primitives).toHaveLength(1);
    expect(unsupportedCount).toBe(1);
  });

  it("returns layers sorted and de-duplicated", () => {
    const { layers } = parseDxf(
      dxfDoc({
        entities: [
          LINE(0, 0, 1, 1, "B"),
          LINE(1, 1, 2, 2, "A"),
          LINE(2, 2, 3, 3, "A"),
        ],
      }),
    );
    expect(layers).toEqual(["A", "B"]);
  });
});

describe("parseDxf curve sampling", () => {
  it("samples an arc along its radius from start angle to end angle", () => {
    const { primitives } = parseDxf(
      dxfDoc({ entities: [ARC(0, 0, 10, 0, 90)] }),
    );
    const { points } = primitives[0] as { points: number[] };
    const last = points.length / 2 - 1;
    expect(points[0]).toBeCloseTo(10); // 0° → (r, 0)
    expect(points[1]).toBeCloseTo(0);
    expect(points[last * 2]).toBeCloseTo(0); // 90° → (0, r)
    expect(points[last * 2 + 1]).toBeCloseTo(10);
    // Every sample sits on the circle, so no segment cuts the corner.
    for (let i = 0; i <= last; i++) expect(radiusAt(points, i)).toBeCloseTo(10);
  });

  it("wraps a sweep that crosses 0° instead of sampling backwards", () => {
    // 270° → 90° is a half turn forward through 0°. Subtracting the angles
    // gives -180°, so without the wrap the arc would be drawn inside out.
    const { primitives } = parseDxf(
      dxfDoc({ entities: [ARC(0, 0, 10, 270, 90)] }),
    );
    const { points } = primitives[0] as { points: number[] };
    const last = points.length / 2 - 1;
    expect(points[0]).toBeCloseTo(0); // 270° → (0, -r)
    expect(points[1]).toBeCloseTo(-10);
    expect(points[last * 2]).toBeCloseTo(0); // 90° → (0, r)
    expect(points[last * 2 + 1]).toBeCloseTo(10);
    // Halfway is 0°, i.e. the arc really did travel through (r, 0).
    const mid = last / 2;
    expect(points[mid * 2]).toBeCloseTo(10);
    expect(points[mid * 2 + 1]).toBeCloseTo(0);
  });

  it("samples an ellipse across both axes, scaling the minor by axisRatio", () => {
    // Major axis (10, 0), ratio 0.5 → minor axis is the major turned 90° and
    // halved, i.e. (0, 5).
    const { primitives } = parseDxf(
      dxfDoc({ entities: [ELLIPSE(0, 0, 10, 0, 0.5)] }),
    );
    const { points } = primitives[0] as { points: number[] };
    expect(points[0]).toBeCloseTo(10); // angle 0 → major axis end
    expect(points[1]).toBeCloseTo(0);
    const quarter = (points.length / 2 - 1) / 4; // angle 90° → minor axis end
    expect(points[quarter * 2]).toBeCloseTo(0);
    expect(points[quarter * 2 + 1]).toBeCloseTo(5);
  });
});

describe("parseDxf bounds", () => {
  it("spans every primitive, including a circle's full extent", () => {
    const { bounds } = parseDxf(
      dxfDoc({ entities: [LINE(0, 0, 4, 4), CIRCLE(10, 10, 3)] }),
    );
    expect(bounds).toEqual({ minX: 0, minY: 0, maxX: 13, maxY: 13 });
  });

  it("collapses to the origin for a drawing with no primitives", () => {
    // Infinity seeds would otherwise escape into the fit transform and make
    // every baked coordinate NaN.
    const { bounds, primitives, layers } = parseDxf(dxfDoc());
    expect(primitives).toEqual([]);
    expect(layers).toEqual([]);
    expect(bounds).toEqual({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
  });
});

describe("parseDxf $INSUNITS", () => {
  const CASES: {
    label: string;
    insunits: number;
    sourceUnits: Unit | undefined;
    unitsPerRealUnit: number;
  }[] = [
    { label: "inches", insunits: 1, sourceUnits: "ft", unitsPerRealUnit: 12 },
    { label: "feet", insunits: 2, sourceUnits: "ft", unitsPerRealUnit: 1 },
    { label: "mm", insunits: 4, sourceUnits: "m", unitsPerRealUnit: 1000 },
    { label: "cm", insunits: 5, sourceUnits: "m", unitsPerRealUnit: 100 },
    { label: "m", insunits: 6, sourceUnits: "m", unitsPerRealUnit: 1 },
    {
      label: "unitless",
      insunits: 0,
      sourceUnits: undefined,
      unitsPerRealUnit: 1,
    },
    {
      label: "a unit we don't map (miles)",
      insunits: 3,
      sourceUnits: undefined,
      unitsPerRealUnit: 1,
    },
  ];

  it.each(CASES)(
    "reads $label as $sourceUnits with $unitsPerRealUnit drawing units each",
    ({ insunits, sourceUnits, unitsPerRealUnit }) => {
      const parsed = parseDxf(
        dxfDoc({ insunits, entities: [LINE(0, 0, 1, 1)] }),
      );
      expect(parsed.sourceUnits).toBe(sourceUnits);
      expect(parsed.unitsPerRealUnit).toBe(unitsPerRealUnit);
    },
  );

  it("treats a missing header as unitless rather than guessing", () => {
    // A wrong guess here silently mis-scales the whole floor plan, so an
    // absent $INSUNITS has to leave the calibration untouched.
    const parsed = parseDxf(dxfDoc({ entities: [LINE(0, 0, 1, 1)] }));
    expect(parsed.sourceUnits).toBeUndefined();
    expect(parsed.unitsPerRealUnit).toBe(1);
  });
});
