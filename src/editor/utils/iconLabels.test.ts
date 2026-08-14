import { describe, expect, it } from "vitest";
import { ICON_CATEGORY_LABEL, ICON_LABEL } from "./iconLabels";
import { ICON_CATEGORIES, iconRegistry } from "./iconRegistry";

// ICON_LABEL is keyed by `string`, so a new registry entry with no label here is
// not a compile error — it reaches IconPicker as `t(undefined)`.
describe("ICON_LABEL", () => {
  it("labels every registered icon", () => {
    for (const entry of iconRegistry) {
      expect(ICON_LABEL[entry.id], entry.id).toBeDefined();
    }
  });

  it("has no label for an icon that left the registry", () => {
    const ids = new Set(iconRegistry.map(entry => entry.id));
    expect(Object.keys(ICON_LABEL).filter(id => !ids.has(id))).toEqual([]);
  });
});

describe("ICON_CATEGORY_LABEL", () => {
  it("labels every category in picker order", () => {
    for (const category of ICON_CATEGORIES) {
      expect(ICON_CATEGORY_LABEL[category], category).toBeDefined();
    }
  });
});
