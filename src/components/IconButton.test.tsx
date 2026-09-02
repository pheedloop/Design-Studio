import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IconButton } from "./IconButton";

const cls = () => screen.getByRole("button").className;

// Spelled out rather than derived, so a change to the module's internals has to
// be reconciled against these strings instead of moving with them.
const FILLED_SHAPE =
  "flex items-center justify-center rounded-lg cursor-pointer transition-colors disabled:cursor-not-allowed";
const FILLED_IDLE =
  "text-text-caption hover:bg-gray-100 hover:text-text-body disabled:text-text-disabled disabled:hover:bg-transparent";
const FILLED_ACTIVE = "bg-primary-600 text-white hover:bg-primary-700";

describe("IconButton filled variant", () => {
  it("is the default", () => {
    render(<IconButton>x</IconButton>);
    expect(cls()).toBe(`${FILLED_SHAPE} w-9 h-9 ${FILLED_IDLE}`);
  });

  it.each([
    ["sm", "w-7 h-7"],
    ["md", "w-9 h-9"],
    ["lg", "w-10 h-10"],
  ] as const)("sizes to a fixed box at %s", (size, box) => {
    render(
      <IconButton variant="filled" size={size}>
        x
      </IconButton>,
    );
    expect(cls()).toBe(`${FILLED_SHAPE} ${box} ${FILLED_IDLE}`);
  });

  it("fills on active", () => {
    render(
      <IconButton variant="filled" active>
        x
      </IconButton>,
    );
    expect(cls()).toBe(`${FILLED_SHAPE} w-9 h-9 ${FILLED_ACTIVE}`);
  });
});

describe("IconButton bare variant", () => {
  it.each([
    ["sm", "p-0.5"],
    ["md", "p-1"],
    ["lg", "p-1.5"],
  ] as const)("sizes by padding at %s, not a fixed box", (size, pad) => {
    render(
      <IconButton variant="bare" size={size}>
        x
      </IconButton>,
    );
    expect(cls()).toContain(pad);
    expect(cls()).not.toMatch(/\bw-\d/);
    expect(cls()).not.toMatch(/\bh-\d/);
  });

  it("tints rather than fills on active", () => {
    render(
      <IconButton variant="bare" active>
        x
      </IconButton>,
    );
    expect(cls()).toContain("text-primary-600 bg-primary-50");
    expect(cls()).not.toContain("bg-primary-600");
  });

  it("dims on disabled instead of blocking the cursor", () => {
    render(
      <IconButton variant="bare" disabled>
        x
      </IconButton>,
    );
    expect(cls()).toContain("disabled:opacity-30");
    expect(cls()).not.toContain("disabled:cursor-not-allowed");
  });
});

describe("IconButton, both variants", () => {
  it.each(["filled", "bare"] as const)("appends className last on %s", v => {
    render(
      <IconButton variant={v} className="shrink-0">
        x
      </IconButton>,
    );
    expect(cls().endsWith("shrink-0")).toBe(true);
  });

  it.each(["filled", "bare"] as const)("defaults to type=button on %s", v => {
    render(<IconButton variant={v}>x</IconButton>);
    expect(screen.getByRole("button")).toHaveProperty("type", "button");
  });
});
