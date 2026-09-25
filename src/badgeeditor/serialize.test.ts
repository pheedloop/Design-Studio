import { describe, expect, it } from "vitest";
import { flatten, inflate } from "./serialize";
import type { BadgeDocument, LegacyLayoutEntry } from "./model";

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

describe("inflate + flatten round trip", () => {
  it.each(Object.entries(FIXTURES))(
    "reproduces the %s layout on one page with no fold",
    (_, layout) => {
      const doc = inflate(layout, { width: 3.64, height: 11 });
      expect(doc.pages).toHaveLength(1);
      expectSameLayout(flatten(doc).layout, layout);
    },
  );

  it("keeps the template height when there is no fold", () => {
    const doc = inflate(FIXTURES.ticketedThermal, { width: 4, height: 16.5 });
    expect(flatten(doc)).toMatchObject({ width: 4, height: 16.5 });
  });

  it("reproduces a single-fold layout split across two panels", () => {
    const doc = inflate(SINGLE_FOLD, { width: 4, height: 11, fold: "single" });
    const result = flatten(doc);
    expectSameLayout(result.layout, SINGLE_FOLD);
    expect(result).toMatchObject({ width: 4, height: 11 });
  });

  it("reproduces a double-fold layout split across three panels", () => {
    const doc = inflate(FIXTURES.ticketedThermal, {
      width: 4,
      height: 16.5,
      fold: "double",
    });
    const result = flatten(doc);
    expectSameLayout(result.layout, FIXTURES.ticketedThermal);
    expect(result).toMatchObject({ width: 4, height: 16.5 });
  });
});

describe("inflate with a fold", () => {
  it("places each entry on the panel containing its top, panel-local", () => {
    const doc = inflate(SINGLE_FOLD, { width: 4, height: 11, fold: "single" });
    expect(doc.panelSize).toEqual({ width: 4, height: 5.5 });
    expect(doc.pages.map(p => p.role)).toEqual(["front", "back"]);
    expect(doc.pages.map(p => p.fields.length)).toEqual([2, 4]);
    expect(doc.pages[1].fields[0].top).toBeCloseTo(0.5, 9);
  });

  it("puts the ticketed thermal tickets block on the back panel", () => {
    const doc = inflate(FIXTURES.ticketedThermal, {
      width: 4,
      height: 16.5,
      fold: "double",
    });
    expect(doc.pages[2].fields.map(f => f.field)).toEqual(["tickets"]);
    expect(doc.pages[2].fields[0].top).toBeCloseTo(10.75984143825814 - 11, 9);
  });

  it("puts an entry whose centre sits on a boundary on the lower panel", () => {
    const doc = inflate([{ top: 5.5, left: 1, field: "qrCode", scale: 1 }], {
      width: 4,
      height: 11,
      fold: "single",
    });
    expect(doc.pages.map(p => p.fields.length)).toEqual([0, 1]);
    expect(doc.pages[1].fields[0].top).toBe(0);
  });

  it("assigns a straddling entry to the panel holding its centre", () => {
    const layout = [text(5, { height: 2 })];
    const doc = inflate(layout, { width: 4, height: 11, fold: "single" });
    expect(doc.pages.map(p => p.fields.length)).toEqual([0, 1]);
    expect(doc.pages[1].fields[0].top).toBeCloseTo(-0.5, 9);
    expectSameLayout(flatten(doc).layout, layout);
  });

  it("authors the folded-back panel upright", () => {
    const doc = inflate(SINGLE_FOLD, { width: 4, height: 11, fold: "single" });
    expect(doc.pages[1].fields.map(f => f.inverted)).toEqual([
      true,
      false,
      true,
      false,
    ]);
  });

  it("clamps entries outside the template to the first and last panel", () => {
    const doc = inflate([text(-0.2), text(20)], {
      width: 4,
      height: 16.5,
      fold: "double",
    });
    expect(doc.pages.map(p => p.fields.length)).toEqual([1, 0, 1]);
    expect(doc.pages[2].fields[0].top).toBeCloseTo(9, 9);
  });

  it("puts everything on the first panel when the height is unusable", () => {
    const doc = inflate([text(3)], { width: 4, height: 0, fold: "single" });
    expect(doc.pages[0].fields[0].top).toBe(3);
  });
});

describe("flatten", () => {
  it("offsets and inverts the back panel of a single fold", () => {
    const panel = (field: string) => ({
      id: field,
      field,
      kind: "text" as const,
      top: 0.3,
      left: 0.5,
      width: 2.6,
      height: 0.3,
      fontSize: 30,
      numLines: 1,
      textAlign: "center" as const,
    });
    const doc: BadgeDocument = {
      version: "1.0",
      panelSize: { width: 3.64, height: 5.5 },
      fold: "single",
      pages: [
        { id: "front", role: "front", fields: [panel("first_name")] },
        { id: "back", role: "back", fields: [panel("last_name")] },
      ],
    };
    const { layout, width, height } = flatten(doc);
    expect({ width, height }).toEqual({ width: 3.64, height: 11 });
    expect(layout[0]).toMatchObject({ top: 0.3, left: 0.5, inverted: false });
    expect(layout[1].top).toBeCloseTo(5.8, 9);
    expect(layout[1]).toMatchObject({ left: 0.5, inverted: true });
  });
});
