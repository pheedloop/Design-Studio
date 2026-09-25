import { describe, expect, it } from "vitest";
import { createCustomField } from "./factory";
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
