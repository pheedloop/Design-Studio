import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stack } from "./Stack";

const cls = () => screen.getByTestId("s").className;

describe("Stack", () => {
  it("is a column with gap-m by default", () => {
    render(<Stack data-testid="s">x</Stack>);
    expect(cls()).toBe("flex flex-col gap-m");
  });

  it.each([
    ["none", "gap-0"],
    ["hair", "gap-hair"],
    ["tight", "gap-tight"],
    ["snug", "gap-snug"],
    ["xxxl", "gap-xxxl"],
  ] as const)("maps gap=%s to %s", (gap, expected) => {
    render(
      <Stack data-testid="s" gap={gap}>
        x
      </Stack>,
    );
    expect(cls()).toBe(`flex flex-col ${expected}`);
  });

  it("composes align, justify, spacing and height", () => {
    render(
      <Stack
        data-testid="s"
        gap="xs"
        align="center"
        justify="between"
        px="s"
        py="m"
        mt="xxs"
        height="full"
      >
        x
      </Stack>,
    );
    expect(cls()).toBe(
      "flex flex-col gap-xs items-center justify-between px-s py-m mt-xxs h-full",
    );
  });

  it("appends className last", () => {
    render(
      <Stack data-testid="s" className="shrink-0">
        x
      </Stack>,
    );
    expect(cls().endsWith("shrink-0")).toBe(true);
  });

  it("renders the element given by as", () => {
    render(
      <Stack data-testid="s" as="section">
        x
      </Stack>,
    );
    expect(screen.getByTestId("s").tagName).toBe("SECTION");
  });

  it("forwards arbitrary DOM props", () => {
    render(
      <Stack data-testid="s" role="group" aria-label="a">
        x
      </Stack>,
    );
    expect(screen.getByRole("group")).toHaveProperty("ariaLabel", "a");
  });
});
