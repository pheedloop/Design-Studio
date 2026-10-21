import { describe, expect, it } from "vitest";
import { resolveDragSet } from "./dragSet";
import type { FloorPlanElement } from "@/types";

const el = (id: string, groupId?: string) =>
  ({ id, properties: { groupId } }) as unknown as FloorPlanElement;

const elements = [el("a", "g"), el("b", "g"), el("c"), el("d")];

describe("resolveDragSet", () => {
  it.each<[string, string, string[], string | null, string[]]>([
    [
      "a selected element moves the selection",
      "c",
      ["c", "d"],
      null,
      ["c", "d"],
    ],
    ["an unselected loose element moves alone", "c", ["d"], null, ["c"]],
    // ENG-4006: dragging an unselected member broke it out of its group.
    ["an unselected group member moves its group", "a", [], null, ["a", "b"]],
    ["inside its group, a member moves alone", "a", [], "g", ["a"]],
  ])("%s", (_, id, selected, activeGroupId, expected) => {
    expect(
      resolveDragSet(id, new Set(selected), elements, activeGroupId),
    ).toEqual(expected);
  });
});
