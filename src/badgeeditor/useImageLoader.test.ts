import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useImageLoader } from "./useImageLoader";

const loads: { url: string; onerror: (() => void) | null }[] = [];

class FailingImage {
  crossOrigin = "";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  set src(src: string) {
    loads.push(Object.assign(this, { url: src }));
  }
}

describe("useImageLoader", () => {
  beforeEach(() => {
    loads.length = 0;
    vi.useFakeTimers();
    vi.stubGlobal("Image", FailingImage);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("stops retrying a failed load on unmount", () => {
    const { unmount } = renderHook(() => useImageLoader(["unmount.png"]));
    loads[0].onerror?.();
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops retrying the old url when the urls change", () => {
    const { rerender } = renderHook(({ urls }) => useImageLoader(urls), {
      initialProps: { urls: ["old.png"] },
    });
    loads[0].onerror?.();

    rerender({ urls: ["new.png"] });
    expect(vi.getTimerCount()).toBe(0);
    vi.runAllTimers();
    expect(loads.map(load => load.url)).toEqual(["old.png", "new.png"]);
  });
});
