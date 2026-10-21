import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type Konva from "konva";
import { useMiddlePan } from "./useMiddlePan";

function setup() {
  let pos = { x: 10, y: 20 };
  const stage = {
    position: (next?: { x: number; y: number }) => (next ? (pos = next) : pos),
  } as unknown as Konva.Stage;
  const onPositionChange = vi.fn();
  const { result } = renderHook(() =>
    useMiddlePan({ current: stage }, onPositionChange),
  );
  const mouse = (button: number, clientX = 0, clientY = 0) =>
    ({
      evt: { button, clientX, clientY, preventDefault: vi.fn() },
    }) as unknown as Konva.KonvaEventObject<MouseEvent>;
  const wheel = () =>
    ({
      evt: { preventDefault: vi.fn() },
    }) as unknown as Konva.KonvaEventObject<WheelEvent>;
  return { result, mouse, wheel, onPositionChange };
}

describe("useMiddlePan", () => {
  it("leaves other buttons and the wheel to the canvas", () => {
    const { result, mouse, wheel } = setup();
    expect(result.current.onMouseDown(mouse(0))).toBe(false);
    expect(result.current.onMouseMove(mouse(0))).toBe(false);
    expect(result.current.onWheel(wheel())).toBe(false);
  });

  it("pans by the pointer delta and reports where it ended", () => {
    const { result, mouse, wheel, onPositionChange } = setup();
    act(() => void result.current.onMouseDown(mouse(1, 100, 100)));
    result.current.onMouseMove(mouse(1, 130, 90));
    // ENG-3679: wheel deltas some mice emit mid-pan zoomed the canvas too.
    expect(result.current.onWheel(wheel())).toBe(true);
    act(() => void result.current.onMouseUp());
    expect(onPositionChange).toHaveBeenCalledWith({ x: 40, y: 10 });
  });

  it("ends when the button is released outside the stage", () => {
    const { result, mouse, onPositionChange } = setup();
    act(() => void result.current.onMouseDown(mouse(1)));
    act(() => {
      window.dispatchEvent(new MouseEvent("mouseup", { button: 1 }));
    });
    expect(onPositionChange).toHaveBeenCalledOnce();
    expect(result.current.isMiddlePanning).toBe(false);
  });
});
