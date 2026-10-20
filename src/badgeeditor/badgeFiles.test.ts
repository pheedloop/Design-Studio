import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { badgeFileName, printPdf } from "./badgeFiles";

describe("badgeFileName", () => {
  it.each([
    ["Delinda Crocken", "pdf", "Delinda_Crocken_badge.pdf"],
    ["  Ada   Lovelace ", "png", "Ada_Lovelace_badge.png"],
    ['A/B: "C"?', "pdf", "AB_C_badge.pdf"],
    ["Zoë O'Neil", "pdf", "Zoë_ONeil_badge.pdf"],
    ["", "png", "badge.png"],
    ["///", "pdf", "badge.pdf"],
  ] as const)("%j as %s is %s", (name, format, expected) => {
    expect(badgeFileName(name, format)).toBe(expected);
  });
});

describe("printPdf", () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => "blob:x");
    URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => document.querySelectorAll("iframe").forEach(f => f.remove()));

  function loadFrame(contentWindow: unknown) {
    const promise = printPdf(new Blob(["x"]));
    const frame = document.querySelector("iframe")!;
    Object.defineProperty(frame, "contentWindow", { value: contentWindow });
    frame.onload!(new Event("load"));
    return promise;
  }

  it("resolves once print() has been called", async () => {
    const win = {
      addEventListener: vi.fn(),
      focus: vi.fn(),
      print: vi.fn(),
    };
    await loadFrame(win);
    expect(win.print).toHaveBeenCalled();
  });

  it.each([
    ["has no window", null],
    [
      "print throws",
      {
        addEventListener: vi.fn(),
        focus: vi.fn(),
        print: () => {
          throw new Error("blocked");
        },
      },
    ],
  ])("rejects when the frame %s", async (_name, win) => {
    await expect(loadFrame(win)).rejects.toThrow();
    expect(document.querySelector("iframe")).toBeNull();
  });
});
