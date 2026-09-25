import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useBadgeSave } from "./useBadgeSave";
import type { BadgeDocument } from "./model";

const makeDoc = (name: string): BadgeDocument => ({
  version: "1.0",
  name,
  panelSize: { width: 4, height: 5.5 },
  fold: "none",
  pages: [{ id: "front", role: "front", fields: [] }],
});

function setup(persist?: (doc: BadgeDocument) => Promise<void>) {
  const onDirtyChange = vi.fn();
  const initial = makeDoc("a");
  const hook = renderHook(
    ({ doc }) => useBadgeSave({ doc, persist, onDirtyChange }),
    { initialProps: { doc: initial } },
  );
  return { hook, onDirtyChange };
}

describe("useBadgeSave", () => {
  it("is clean until the document changes", () => {
    const { hook, onDirtyChange } = setup(vi.fn());
    expect(hook.result.current.isDirty).toBe(false);

    hook.rerender({ doc: makeDoc("b") });
    expect(hook.result.current.isDirty).toBe(true);
    expect(onDirtyChange).toHaveBeenLastCalledWith(true);
  });

  it("saves the current document and becomes clean", async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    const { hook, onDirtyChange } = setup(persist);
    const edited = makeDoc("b");
    hook.rerender({ doc: edited });

    await act(() => hook.result.current.save());

    expect(persist).toHaveBeenCalledWith(edited);
    expect(hook.result.current.isDirty).toBe(false);
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
  });

  it("stays dirty without throwing when the host rejects", async () => {
    const persist = vi.fn().mockRejectedValue(new Error("400"));
    const { hook } = setup(persist);
    hook.rerender({ doc: makeDoc("b") });

    await act(() => hook.result.current.save());

    expect(hook.result.current.isDirty).toBe(true);
    expect(hook.result.current.isSaving).toBe(false);
  });

  it("stays dirty when the document changed while saving", async () => {
    let resolve = () => {};
    const persist = vi.fn(() => new Promise<void>(r => (resolve = () => r())));
    const { hook } = setup(persist);
    hook.rerender({ doc: makeDoc("b") });

    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = hook.result.current.save();
    });
    hook.rerender({ doc: makeDoc("c") });
    await act(async () => {
      resolve();
      await pending;
    });

    expect(hook.result.current.isDirty).toBe(true);
  });

  it("ignores a second save while one is in flight", async () => {
    let resolve = () => {};
    const persist = vi.fn(() => new Promise<void>(r => (resolve = () => r())));
    const { hook } = setup(persist);

    let first: Promise<void> = Promise.resolve();
    act(() => {
      first = hook.result.current.save();
    });
    await act(() => hook.result.current.save());
    await act(async () => {
      resolve();
      await first;
    });

    expect(persist).toHaveBeenCalledTimes(1);
  });

  it("does nothing without a persist callback", async () => {
    const { hook } = setup();
    hook.rerender({ doc: makeDoc("b") });
    await act(() => hook.result.current.save());
    expect(hook.result.current.isDirty).toBe(true);
  });
});
