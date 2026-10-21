import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type Konva from "konva";
import { useLeftButtonDrag } from "./useLeftButtonDrag";

const dragEvent = (button: number, stopDrag = vi.fn()) =>
  ({
    evt: { button },
    target: { stopDrag },
  }) as unknown as Konva.KonvaEventObject<DragEvent>;

describe("useLeftButtonDrag", () => {
  it("passes a left-button drag through", () => {
    const start = vi.fn();
    const end = vi.fn();
    const { result } = renderHook(() => useLeftButtonDrag(start, end));
    result.current.onDragStart(dragEvent(0));
    result.current.onDragEnd(dragEvent(0));
    expect(start).toHaveBeenCalledOnce();
    expect(end).toHaveBeenCalledOnce();
  });

  // ENG-3679: Konva drags on the middle button by default, so a middle-click
  // pan over an element moved the element too.
  it("refuses a middle-button drag without committing it", () => {
    const start = vi.fn();
    const end = vi.fn();
    const stopDrag = vi.fn();
    const { result } = renderHook(() => useLeftButtonDrag(start, end));
    result.current.onDragStart(dragEvent(1, stopDrag));
    result.current.onDragEnd(dragEvent(1));
    expect(stopDrag).toHaveBeenCalledOnce();
    expect(start).not.toHaveBeenCalled();
    expect(end).not.toHaveBeenCalled();

    result.current.onDragStart(dragEvent(0));
    result.current.onDragEnd(dragEvent(0));
    expect(end).toHaveBeenCalledOnce();
  });
});
