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
    const [saved] = savePayload(doc, "From host", null);
    expect(saved.name).toBe("From host");
  });

  it("keeps the document untouched without a host name", () => {
    const [saved] = savePayload(doc, undefined, null);
    expect(saved).toBe(doc);
  });

  it("flattens the saved document and passes the thumbnail through", () => {
    const thumbnail = new Blob(["png"]);
    const [, flattened, passed] = savePayload(doc, "x", thumbnail);
    expect(flattened).toMatchObject({ width: 4, height: 11 });
    expect(flattened.layout.map(e => e.top)).toEqual([1, 6.5]);
    expect(passed).toBe(thumbnail);
  });
});
