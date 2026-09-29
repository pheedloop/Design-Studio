import { describe, expect, it, vi } from "vitest";
import { refusePlacedImageDelete } from "./imageDelete";
import type { BadgeDocument } from "./model";

const doc: BadgeDocument = {
  version: "1.0",
  panelSize: { width: 4, height: 5.5 },
  fold: "single",
  pages: [
    { id: "front", role: "front", fields: [] },
    {
      id: "back",
      role: "back",
      fields: [
        {
          id: "logo",
          field: "image",
          kind: "image",
          top: 0,
          left: 0,
          code: "placed",
        },
      ],
    },
  ],
};

describe("refusePlacedImageDelete", () => {
  it("refuses an image placed on any page without calling the host", async () => {
    const onDelete = vi.fn(async () => {});
    const remove = refusePlacedImageDelete(doc, onDelete)!;
    await expect(remove("placed")).rejects.toMatchObject({
      messageKey: "common.error.imageInUse",
    });
    expect(onDelete).not.toHaveBeenCalled();

    await remove("unused");
    expect(onDelete).toHaveBeenCalledWith("unused");
  });
});
