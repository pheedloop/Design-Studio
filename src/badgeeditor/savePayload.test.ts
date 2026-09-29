import { describe, expect, it } from "vitest";
import { savePayload } from "./savePayload";
import type { BadgeDocument } from "./model";

const doc: BadgeDocument = {
  version: "1.0",
  name: "From document",
  panelSize: { width: 4, height: 5.5 },
  fold: "single",
  pages: [
    {
      id: "front",
      role: "front",
      fields: [{ id: "q", field: "qrCode", kind: "qrCode", top: 1, left: 1 }],
    },
    {
      id: "back",
      role: "back",
      fields: [{ id: "b", field: "qrCode", kind: "qrCode", top: 1, left: 1 }],
    },
  ],
};

describe("savePayload", () => {
  it("writes the host name into the saved document", () => {
    expect(savePayload(doc, "From host", null)[0].name).toBe("From host");
    expect(savePayload(doc, undefined, null)[0]).toBe(doc);
  });
});
