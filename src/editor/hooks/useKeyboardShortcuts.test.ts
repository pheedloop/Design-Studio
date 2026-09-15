import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { TOOL_REGISTRY } from "@/editor/tools/registry";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

function press(key: string, target?: EventTarget) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true });
  (target ?? window).dispatchEvent(event);
}

function mount() {
  const setActiveTool = vi.fn();
  renderHook(() =>
    useKeyboardShortcuts({
      setActiveTool,
      onDeselect: vi.fn(),
      onDelete: vi.fn(),
      onCopy: vi.fn(),
      onPaste: vi.fn(),
      onDuplicate: vi.fn(),
      onSelectAll: vi.fn(),
      onUndo: vi.fn(),
      onRedo: vi.fn(),
    }),
  );
  return setActiveTool;
}

describe("useKeyboardShortcuts", () => {
  it("routes every registry shortcut through the supplied handler", () => {
    for (const tool of TOOL_REGISTRY) {
      if (!tool.shortcut) continue;
      const setActiveTool = mount();
      press(tool.shortcut.toLowerCase());
      expect(setActiveTool).toHaveBeenCalledWith(tool.id);
    }
  });

  it("applies no tier gate of its own", () => {
    // The handler owns gating and the side effects a tool needs on activation,
    // so every shortcut must reach it — a second gate here is how the keyboard
    // and the toolbar end up disagreeing about which feature gates which tool.
    const setActiveTool = mount();
    press("g");
    expect(setActiveTool).toHaveBeenCalledWith("image");
  });

  it("sends the navigation tools through the same handler", () => {
    const setActiveTool = mount();
    press("h");
    press("v");
    expect(setActiveTool).toHaveBeenNthCalledWith(1, "hand");
    expect(setActiveTool).toHaveBeenNthCalledWith(2, "select");
  });

  it("ignores shortcuts typed into a text field", () => {
    const setActiveTool = mount();
    const input = document.createElement("input");
    document.body.appendChild(input);
    press("g", input);
    expect(setActiveTool).not.toHaveBeenCalled();
    input.remove();
  });
});
