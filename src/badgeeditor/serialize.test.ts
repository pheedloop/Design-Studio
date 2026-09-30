import { describe, expect, it } from "vitest";
import Konva from "konva";
import { flatten, inflate } from "./serialize";
import { PPI, fieldSizePx } from "./canvasMetrics";
import type { BadgeDocument, BadgeField, LegacyLayoutEntry } from "./model";

const FIXTURES: Record<string, LegacyLayoutEntry[]> = {
  label: JSON.parse(
    `[{"top":0.1979166666666667,"left":0.15625,"field":"first_name","scale":1.125,"height":0.42375,"width":3.125,"fontSize":36,"numLines":1,"textAlign":"center","inverted":false,"userEditable":true},{"top":0.6458333333333333,"left":0.15625,"field":"last_name","scale":0.9375,"height":0.3531249999999999,"width":3.125,"fontSize":30,"numLines":1,"textAlign":"center","inverted":false,"userEditable":true},{"top":1.2291666666666667,"left":0.15625,"field":"organization","scale":0.75,"height":0.5,"width":3.125,"fontSize":24,"numLines":2,"textAlign":"center","inverted":false,"userEditable":true},{"top":1.8333333333333333,"left":0.15625,"field":"title","scale":0.625,"height":0.23541666666666664,"width":3.125,"fontSize":20,"numLines":1,"textAlign":"center","inverted":false,"userEditable":true},{"top":2.09375,"left":1.3333333333333333,"field":"qrCode","scale":1}]`,
  ),
  ticketedThermal: JSON.parse(
    `[{"top":1.6770833333333333,"left":0.15625,"field":"first_name","scale":1.125,"height":0.42375,"width":3.64,"fontSize":36,"numLines":1,"textAlign":"center","inverted":false,"userEditable":true},{"top":2.1354166666666665,"left":0.15625,"field":"last_name","scale":0.9375,"height":0.3531249999999999,"width":3.64,"fontSize":30,"numLines":1,"textAlign":"center","inverted":false,"userEditable":true},{"top":2.875,"left":0.17479166666666698,"field":"organization","scale":0.75,"height":0.5,"width":3.64,"fontSize":24,"numLines":2,"textAlign":"center","inverted":false,"userEditable":true},{"top":3.4791666666666665,"left":0.17479166666666668,"field":"title","scale":0.625,"height":0.23541666666666664,"width":3.64,"fontSize":20,"numLines":1,"textAlign":"center","inverted":false,"userEditable":true},{"top":3.8020833333333335,"left":1.6484375000000002,"field":"qrCode","scale":0.9},{"top":10.75984143825814,"left":0.40544246841652704,"field":"tickets","height":5.5945153936487095,"width":3.17869839650028,"numRows":4,"inverted":false}]`,
  ),
  realExport: JSON.parse(
    `[{"top":0.10418497035061584,"left":0.25222503169855176,"field":"first_name","scale":0.9375,"height":0.3531249999999999,"width":3.64,"fontSize":30,"numLines":1,"textAlign":"center","inverted":false,"userEditable":false},{"top":0.5729349703506158,"left":0.25222503169855176,"field":"last_name","scale":0.9375,"height":0.3531249999999999,"width":3.64,"fontSize":30,"numLines":1,"textAlign":"center","inverted":false,"userEditable":false},{"top":1.041684970350616,"left":0.25222503169855176,"field":"organization","scale":0.75,"height":0.2824999999999999,"width":3.64,"fontSize":24,"numLines":1,"textAlign":"center","inverted":false,"userEditable":false},{"top":1.510434970350616,"left":0.25222503169855176,"field":"title","scale":0.625,"height":0.23541666666666664,"width":3.64,"fontSize":20,"numLines":1,"textAlign":"center","inverted":false,"userEditable":false},{"top":1.9791849703506161,"left":0.25222503169855176,"field":"tags","scale":0.5,"height":0.18833333333333332,"width":3.64,"fontSize":16,"numLines":1,"textAlign":"center","inverted":false},{"top":2.3098958333333335,"left":1.5799012923558386,"field":"qrCode","scale":0.9},{"top":3.229184970350616,"left":0.25222503169855176,"field":"designations","scale":0.625,"height":0.23541666666666664,"width":3.6720572695662717,"fontSize":20,"numLines":1,"textAlign":"left","inverted":false,"userEditable":true},{"top":3.541684970350616,"left":0.25222503169855176,"field":"address_city","scale":0.625,"height":0.23541666666666664,"width":3.6928773569106315,"fontSize":20,"numLines":1,"textAlign":"left","inverted":false,"userEditable":true},{"top":3.854184970350616,"left":0.25222503169855176,"field":"address_country","scale":0.625,"height":0.23541666666666664,"width":3.7032874005828114,"fontSize":20,"numLines":1,"textAlign":"left","inverted":false,"userEditable":false},{"top":4.166684970350616,"left":0.25222503169855176,"field":"address_state","scale":0.625,"height":0.23541666666666664,"width":3.6824673132384516,"fontSize":20,"numLines":1,"textAlign":"left","inverted":false,"userEditable":false},{"top":4.479184970350616,"left":0.25222503169855176,"field":"city_state","scale":0.625,"height":0.23541666666666664,"width":3.6986232582763736,"fontSize":20,"numLines":1,"textAlign":"left","inverted":false,"userEditable":false},{"top":4.791684970350616,"left":0.25222503169855176,"field":"code_internal","scale":0.625,"height":0.23541666666666664,"width":3.7083070191159755,"fontSize":20,"numLines":1,"textAlign":"left","inverted":false},{"top":5.104184970350616,"left":0.25222503169855176,"field":"table_number","scale":0.625,"height":0.23541666666666664,"width":3.7373583016347816,"fontSize":20,"numLines":1,"textAlign":"left","inverted":false},{"top":5.572934970350616,"left":0.25222503169855176,"field":"tickets","height":2.4824244444198413,"width":3.659283081612074,"numRows":3,"inverted":false},{"top":8.385434970350616,"left":0.4083756867812524,"field":"session_schedule","scale":0.75,"height":0.2824999999999999,"width":3.131093535115117,"fontSize":24,"numLines":1,"textAlign":"left","inverted":false,"userEditable":true}]`,
  ),
  newFields: JSON.parse(
    `[{"top":0.5,"left":1.5,"field":"externalQRCodeUrl","scale":0.9},{"top":2.5,"left":0.25,"field":"extra_fields","custom_attendee_field":"shirt_size","scale":0.625,"height":0.235,"width":2.6,"fontSize":20,"numLines":1,"textAlign":"left","inverted":false,"text":"Shirt Size","userEditable":true},{"top":3.0,"left":0.25,"field":"dietary_restrictions","scale":0.625,"height":0.235,"width":2.6,"fontSize":20,"numLines":1,"textAlign":"left","inverted":false,"userEditable":true},{"top":4.0,"left":0.25,"field":"title","scale":0.625,"height":0.235,"width":2.6,"fontSize":20,"numLines":1,"textAlign":"center","inverted":true,"userEditable":true}]`,
  ),
};

function expectSameLayout(
  actual: LegacyLayoutEntry[],
  expected: LegacyLayoutEntry[],
) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach((entry, i) => {
    const produced = actual[i] as unknown as Record<string, unknown>;
    const original = entry as unknown as Record<string, unknown>;
    expect(Object.keys(produced).sort()).toEqual(Object.keys(original).sort());
    for (const [key, value] of Object.entries(original)) {
      if (typeof value === "number") {
        expect(produced[key]).toBeCloseTo(value, 9);
      } else {
        expect(produced[key]).toBe(value);
      }
    }
  });
}

const text = (top: number, extra: Partial<LegacyLayoutEntry> = {}) => ({
  top,
  left: 0.25,
  field: "title",
  scale: 0.625,
  height: 0.235,
  width: 2.6,
  fontSize: 20,
  numLines: 1,
  textAlign: "center" as const,
  inverted: false,
  userEditable: true,
  ...extra,
});

const SINGLE_FOLD: LegacyLayoutEntry[] = [
  text(0.5),
  { top: 3.2, left: 1.5, field: "qrCode", scale: 0.9 },
  text(6, { field: "first_name" }),
  text(7, { field: "last_name", inverted: true }),
  { top: 8.5, left: 1.5, field: "qrCode", scale: 1 },
  { top: 9, left: 1.5, field: "externalQRCodeUrl", scale: 1, inverted: true },
];

const FIXTURE_SIZES: Record<string, { width: number; height: number }> = {
  label: { width: 3.5, height: 3 },
  ticketedThermal: { width: 4, height: 16.5 },
  realExport: { width: 4, height: 11 },
  newFields: { width: 3.64, height: 11 },
};

describe("inflate + flatten round trip", () => {
  it.each(Object.entries(FIXTURES))(
    "reproduces the %s layout on one page with no fold",
    (name, layout) => {
      const doc = inflate(layout, FIXTURE_SIZES[name]);
      expect(doc.pages).toHaveLength(1);
      const result = flatten(doc);
      expect(result.layout).toStrictEqual(layout);
      expect(result).toMatchObject(FIXTURE_SIZES[name]);
    },
  );

  it("keeps an internal code printed as a QR", () => {
    const layout: LegacyLayoutEntry[] = [
      {
        top: 2,
        left: 1.2,
        field: "code_internal",
        scale: 0.8,
        printAsQr: true,
      },
    ];
    const doc = inflate(layout, { width: 3.5, height: 3 });
    expect(doc.pages[0].fields[0]).toMatchObject({
      kind: "qrCode",
      printAsQr: true,
    });
    expect(JSON.stringify(flatten(doc).layout)).toBe(JSON.stringify(layout));
  });

  it.each([
    {
      name: "single",
      layout: SINGLE_FOLD,
      size: { width: 4, height: 11 },
      printed: SINGLE_FOLD,
    },
    {
      name: "double",
      layout: FIXTURES.ticketedThermal,
      size: { width: 4, height: 16.5 },
      printed: FIXTURES.ticketedThermal.filter(e => e.field !== "tickets"),
    },
  ] as const)(
    "reproduces a $name-fold layout split across panels",
    ({ name, layout, size, printed }) => {
      const result = flatten(inflate(layout, { ...size, fold: name }));
      expectSameLayout(result.layout, printed);
      expect(result).toMatchObject(size);
    },
  );

  it.each([
    ["a field inside", text(1), 0, true],
    [
      "a hair over the left edge, no allowance",
      text(1, { left: -0.001 }),
      0,
      false,
    ],
    [
      "a field exactly ⅛ in over the left edge, ⅛ allowance",
      text(1, { left: -0.125 }),
      0.125,
      true,
    ],
    ["a field 0.135 in over the bottom, ⅛ allowance", text(2.9), 0.125, false],
    [
      "a QR code past the right edge, ⅛ allowance",
      { top: 1, left: 3.2, field: "qrCode", scale: 1 },
      0.125,
      false,
    ],
  ] as const)("prints %s: %s", (_, entry, allowance, prints) => {
    const result = flatten(inflate([entry], { width: 3.5, height: 3 }), {
      printOvershootAllowanceIn: allowance,
    });
    expectSameLayout(result.layout, prints ? [entry] : []);
  });
});

describe("inflate with a fold", () => {
  const SINGLE = { width: 4, height: 11, fold: "single" } as const;
  const DOUBLE = { width: 4, height: 16.5, fold: "double" } as const;

  it.each([
    {
      name: "single-fold layout",
      layout: SINGLE_FOLD,
      spec: SINGLE,
      counts: [2, 4],
    },
    {
      name: "QR by its rendered height",
      layout: [{ top: 5.2, left: 1.5, field: "qrCode", scale: 1 }],
      spec: SINGLE,
      counts: [0, 1],
    },
    {
      name: "ticketed thermal tickets block",
      layout: FIXTURES.ticketedThermal,
      spec: DOUBLE,
      counts: [5, 0, 1],
    },
    {
      name: "centre on a boundary",
      layout: [{ top: 5.5, left: 1, field: "qrCode", scale: 1 }],
      spec: SINGLE,
      counts: [0, 1],
    },
    {
      name: "straddling entry",
      layout: [text(5, { height: 2 })],
      spec: SINGLE,
      counts: [0, 1],
    },
    {
      name: "entries outside the template",
      layout: [text(-0.2), text(20)],
      spec: DOUBLE,
      counts: [1, 0, 1],
    },
  ])(
    "assigns each entry to the panel holding its centre: $name",
    ({ layout, spec, counts }) => {
      const doc = inflate(layout as LegacyLayoutEntry[], spec);
      expect(doc.pages.map(p => p.fields.length)).toEqual(counts);
    },
  );
});

describe("flatten", () => {
  it("stores a folded-back field where the preview prints it", () => {
    const fields: BadgeField[] = [
      { ...fieldAt("title", "text", 0.1, 0.2), width: 2.6, height: 0.3 },
      { ...fieldAt("qrCode", "qrCode", 1, 1.5), scale: 0.9 },
      { ...fieldAt("externalQRCodeUrl", "qrCode", 1.5, 0.1), scale: 1.2 },
      { ...fieldAt("image", "image", 2, 0.3), width: 1.2, height: 0.8 },
      {
        ...fieldAt("extra_fields", "text", 3, 0.25),
        width: 2,
        height: 0.4,
        customAttendeeField: "shirt_size",
        text: "Shirt Size",
      },
      {
        ...fieldAt("session_schedule", "sessionSchedule", 3.5, 0.4),
        width: 3,
        height: 0.5,
      },
      {
        ...fieldAt("tickets", "tickets", 4, 0.3),
        width: 3,
        height: 1.2,
        numRows: 2,
      },
      { ...fieldAt("last_name", "text", 5, 0.6), inverted: true },
    ];
    const doc: BadgeDocument = {
      version: "1.0",
      panelSize: { width: 3.64, height: 6 },
      fold: "single",
      pages: [
        { id: "front", role: "front", fields: [] },
        { id: "back", role: "back", fields },
      ],
    };
    const { layout } = flatten(doc);
    fields.forEach((field, i) => {
      const printed = previewBox(doc, 1, field);
      expect(layout[i]).toMatchObject({
        top: expect.closeTo(printed.top, 9),
        left: expect.closeTo(printed.left, 9),
        inverted: !field.inverted,
      });
    });
    expectSameLayout(
      flatten(inflate(layout, { width: 3.64, height: 12, fold: "single" }))
        .layout,
      layout,
    );
  });
});

describe("panel backgrounds", () => {
  it("lead the layout as full-panel entries and round-trip onto their panels", () => {
    const doc: BadgeDocument = {
      version: "1.0",
      panelSize: { width: 4, height: 5.5 },
      fold: "single",
      pages: [
        {
          id: "front",
          role: "front",
          fields: [{ ...fieldAt("qrCode", "qrCode", 1, 1), scale: 1 }],
          background: { imageCode: "BIMGFRONT", fit: "cover" },
        },
        {
          id: "back",
          role: "back",
          fields: [],
          background: { imageCode: "BIMGBACK", fit: "stretch" },
        },
      ],
    };

    const { layout } = flatten(doc);

    expect(layout.slice(0, 2)).toEqual([
      {
        top: 0,
        left: 0,
        width: 4,
        height: 5.5,
        field: "background",
        code: "BIMGFRONT",
        fit: "cover",
      },
      {
        top: 5.5,
        left: 0,
        width: 4,
        height: 5.5,
        field: "background",
        code: "BIMGBACK",
        fit: "stretch",
        inverted: true,
      },
    ]);
    expect(layout[2].field).toBe("qrCode");
    const inflated = inflate(layout, { width: 4, height: 11, fold: "single" });
    expect(inflated.pages.map(p => p.background)).toEqual([
      doc.pages[0].background,
      doc.pages[1].background,
    ]);
    expect(inflated.pages.map(p => p.fields.length)).toEqual([1, 0]);
    expect(inflated.pages.map(p => p.inverted)).toEqual([undefined, undefined]);
  });

  it("keeps a panel's printed orientation when it differs from the fold default", () => {
    const [front, back] = flatten({
      version: "1.0",
      panelSize: { width: 4, height: 5.5 },
      fold: "single",
      pages: [
        {
          id: "front",
          role: "front",
          fields: [],
          inverted: true,
          background: { imageCode: "F", fit: "cover" },
        },
        {
          id: "back",
          role: "back",
          fields: [],
          inverted: false,
          background: { imageCode: "B", fit: "cover" },
        },
      ],
    }).layout;

    const inflated = inflate([front, back], {
      width: 4,
      height: 11,
      fold: "single",
    });

    expect(inflated.pages.map(p => p.inverted)).toEqual([true, false]);
  });
});

function fieldAt(
  field: string,
  kind: BadgeField["kind"],
  top: number,
  left: number,
): BadgeField {
  return { id: field, field, kind, top, left };
}

function previewBox(doc: BadgeDocument, pageIndex: number, field: BadgeField) {
  const panelW = doc.panelSize.width * PPI;
  const panelH = doc.panelSize.height * PPI;
  const page = new Konva.Group({ x: 0, y: pageIndex * panelH });
  const flipped = new Konva.Group({ x: panelW, y: panelH, rotation: 180 });
  const box = new Konva.Group({ x: field.left * PPI, y: field.top * PPI });
  page.add(flipped);
  flipped.add(box);
  const { w, h } = fieldSizePx(field);
  const transform = box.getAbsoluteTransform();
  const a = transform.point({ x: 0, y: 0 });
  const b = transform.point({ x: w, y: h });
  return { top: Math.min(a.y, b.y) / PPI, left: Math.min(a.x, b.x) / PPI };
}
