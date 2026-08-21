import { describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDismiss } from "./useDismiss";

/** A ref pointing at a real element, so `contains()` behaves as it does live. */
function mountTarget() {
  const inside = document.createElement("div");
  const outside = document.createElement("div");
  document.body.append(inside, outside);
  return { ref: { current: inside }, inside, outside };
}

const press = (el: Element) =>
  act(() => {
    el.dispatchEvent(new Event("pointerdown", { bubbles: true }));
  });

const key = (k: string) =>
  act(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: k }));
  });

describe("useDismiss", () => {
  it("dismisses on a press outside the element", () => {
    const { ref, outside } = mountTarget();
    const onDismiss = vi.fn();
    renderHook(() => useDismiss(ref, onDismiss));
    press(outside);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("ignores a press inside the element", () => {
    const { ref, inside } = mountTarget();
    const onDismiss = vi.fn();
    renderHook(() => useDismiss(ref, onDismiss));
    press(inside);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("dismisses on Escape but not on other keys", () => {
    const { ref } = mountTarget();
    const onDismiss = vi.fn();
    renderHook(() => useDismiss(ref, onDismiss));
    key("Enter");
    expect(onDismiss).not.toHaveBeenCalled();
    key("Escape");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("listens for pointerdown, not mousedown", () => {
    // A touch fires one pointerdown, then synthesizes a trailing mousedown
    // ~300ms later. Listening for the latter is what made popovers close
    // themselves the instant they opened on mobile, and the workaround for it
    // was a 350ms grace window duplicated across two files.
    const { ref, outside } = mountTarget();
    const onDismiss = vi.fn();
    renderHook(() => useDismiss(ref, onDismiss));
    act(() => {
      outside.dispatchEvent(new Event("mousedown", { bubbles: true }));
    });
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("attaches nothing while disabled", () => {
    const { ref, outside } = mountTarget();
    const onDismiss = vi.fn();
    renderHook(() => useDismiss(ref, onDismiss, false));
    press(outside);
    key("Escape");
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("re-attaches when enabled flips on", () => {
    const { ref, outside } = mountTarget();
    const onDismiss = vi.fn();
    const { rerender } = renderHook(
      ({ enabled }) => useDismiss(ref, onDismiss, enabled),
      { initialProps: { enabled: false } },
    );
    rerender({ enabled: true });
    press(outside);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("calls the newest callback without re-subscribing", () => {
    // Call sites pass inline arrows like `() => setOpen(false)`, so the identity
    // changes every render. The listener must not be torn down and re-attached
    // each time, but it must still reach the current closure, not the first one.
    const { ref, outside } = mountTarget();
    const first = vi.fn();
    const second = vi.fn();
    const add = vi.spyOn(window, "addEventListener");
    const { rerender } = renderHook(({ cb }) => useDismiss(ref, cb), {
      initialProps: { cb: first },
    });
    const subscribes = add.mock.calls.length;
    rerender({ cb: second });
    expect(add.mock.calls.length).toBe(subscribes);
    add.mockRestore();

    press(outside);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("stops listening once unmounted", () => {
    const { ref, outside } = mountTarget();
    const onDismiss = vi.fn();
    const { unmount } = renderHook(() => useDismiss(ref, onDismiss));
    unmount();
    press(outside);
    key("Escape");
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
