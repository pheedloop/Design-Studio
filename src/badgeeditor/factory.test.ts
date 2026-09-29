import { describe, expect, it } from "vitest";
import {
  createCustomField,
  createField,
  fieldHeading,
  printAsPatch,
} from "./factory";
import { defaultTranslate } from "./i18n";
import { fieldToEntry } from "./serialize";

describe("createCustomField", () => {
  it("flattens to the extra_fields shape raichu authors", () => {
    const entry = fieldToEntry(
      createCustomField({ name: "shirt_size", label: "Shirt Size" }),
    );
    expect(entry).toMatchObject({
      field: "extra_fields",
      custom_attendee_field: "shirt_size",
      text: "Shirt Size",
      userEditable: true,
    });
  });
});

describe("fieldHeading", () => {
  it("names a custom attendee field by its label, then its key", () => {
    const field = createCustomField({
      name: "shirt_size",
      label: "Shirt Size",
    });
    expect(fieldHeading(field, defaultTranslate)).toBe("Shirt Size");
    expect(fieldHeading({ ...field, text: undefined }, defaultTranslate)).toBe(
      "shirt_size",
    );
  });

  it("names a registry field by its translated label", () => {
    expect(
      fieldHeading(
        { id: "q", field: "qrCode", kind: "qrCode", top: 0, left: 0 },
        defaultTranslate,
      ),
    ).toBe("QR Code");
  });
});

describe("printAsPatch", () => {
  it("switches an internal code between text and QR", () => {
    const text = { ...createField("code_internal"), top: 1, left: 0.5 };
    const qr = { ...text, ...printAsPatch(text, true) };
    expect(fieldToEntry(qr)).toEqual({
      top: 1,
      left: 0.5,
      field: "code_internal",
      scale: 1,
      printAsQr: true,
    });

    const back = { ...qr, ...printAsPatch(qr, false) };
    expect(back).toMatchObject({ kind: "text", top: 1, left: 0.5 });
    expect(fieldToEntry(back).printAsQr).toBeUndefined();
    expect(fieldToEntry(back)).toMatchObject({ fontSize: 20, numLines: 1 });
  });
});
