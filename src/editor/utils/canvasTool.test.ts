import { describe, expect, it } from "vitest";
import { resolveCanvasTool } from "./canvasTool";
import type { ActiveTool, EditorMode } from "@/editor/types";
import type { LayerId } from "@/types/FloorPlanData";

describe("resolveCanvasTool", () => {
  it.each<[ActiveTool, LayerId, EditorMode, ActiveTool | null, boolean]>([
    ["rectangle", "content", "design", "rectangle", false],
    ["rectangle", "markup", "design", "rectangle", false],
    ["hand", "content", "design", null, true],
    ["hand", "content", "placement", null, false],
    ["select", "content", "design", null, false],
    ["hand", "background", "design", null, true],
    ["rectangle", "background", "design", null, false],
    // ENG-4004: the hand tool carried into pathing and swallowed every paint
    // stroke; a drawing tool carried in drew shapes into the pathing layer.
    ["hand", "pathing", "design", null, false],
    ["rectangle", "pathing", "design", null, false],
  ])("%s on %s in %s mode", (tool, layer, mode, drawToolId, isPanTool) => {
    expect(resolveCanvasTool(tool, layer, mode)).toEqual({
      drawToolId,
      isPanTool,
    });
  });
});
