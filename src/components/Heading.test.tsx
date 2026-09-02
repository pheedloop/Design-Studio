import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Heading } from "./Heading";

describe("Heading", () => {
  it.each([1, 2, 3, 4, 5, 6] as const)("level %s renders that h tag", level => {
    render(<Heading level={level}>x</Heading>);
    expect(screen.getByRole("heading", { level }).tagName).toBe(`H${level}`);
  });

  it.each([
    [1, "text-3xl font-semibold text-text-heading"],
    [3, "text-xl font-medium text-text-heading"],
    [6, "text-sm font-medium text-text-heading"],
  ] as const)("level %s carries its own size and weight", (level, expected) => {
    render(<Heading level={level}>x</Heading>);
    expect(screen.getByRole("heading", { level }).className).toBe(expected);
  });

  // The reason the level tables are split by property: cn() does not merge, so
  // an appended override would leave both sizes in the class list and let
  // stylesheet order decide.
  it("replaces the level's size rather than appending to it", () => {
    render(
      <Heading level={2} size="lg">
        x
      </Heading>,
    );
    const c = screen.getByRole("heading", { level: 2 }).className;
    expect(c).toBe("text-lg font-semibold text-text-heading");
    expect(c).not.toContain("text-2xl");
  });

  it("takes weight and colour", () => {
    render(
      <Heading level={4} weight="semibold" color="primary">
        x
      </Heading>,
    );
    expect(screen.getByRole("heading", { level: 4 }).className).toBe(
      "text-lg font-semibold text-text-primary",
    );
  });

  it("appends className last", () => {
    render(
      <Heading level={2} className="truncate">
        x
      </Heading>,
    );
    expect(
      screen.getByRole("heading", { level: 2 }).className.endsWith("truncate"),
    ).toBe(true);
  });
});
