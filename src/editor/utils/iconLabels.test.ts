import { describe, expect, it } from "vitest";
import { ICON_CATEGORY_LABEL, ICON_LABEL } from "./iconLabels";
import { ICON_CATEGORIES, iconRegistry } from "./iconRegistry";

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

  it("labels from editor.icon.* only", () => {
    // Was: PiForkKnife borrowed editor.iconCategory.foodDrink and PiArrowRight
    // borrowed editor.tool.arrow, so rewording a category or a tool silently
    // reworded an icon name.
    for (const [id, key] of Object.entries(ICON_LABEL)) {
      expect(key, id).toMatch(/^editor\.icon\./);
    }
  });
});

describe("ICON_CATEGORY_LABEL", () => {
  it("labels every category in picker order", () => {
    for (const category of ICON_CATEGORIES) {
      expect(ICON_CATEGORY_LABEL[category], category).toBeDefined();
    }
  });
});
