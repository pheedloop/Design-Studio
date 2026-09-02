import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Text } from "./Text";

const cls = () => screen.getByTestId("t").className;

describe("Text", () => {
  it("defaults to a body paragraph", () => {
    render(<Text data-testid="t">x</Text>);
    expect(cls()).toBe("text-base text-text-body font-normal");
    expect(screen.getByTestId("t").tagName).toBe("P");
  });

  it.each([
    ["body", "text-base text-text-body"],
    ["subtitle", "text-lg text-text-body"],
    ["caption", "text-sm leading-4 text-text-caption"],
    ["small", "text-xs text-text-caption"],
  ] as const)("variant %s sets both size and colour", (variant, expected) => {
    render(
      <Text data-testid="t" variant={variant}>
        x
      </Text>,
    );
    expect(cls()).toBe(`${expected} font-normal`);
  });

  it("lets size override the variant's size but keep its colour", () => {
    render(
      <Text data-testid="t" variant="caption" size="2xl">
        x
      </Text>,
    );
    expect(cls()).toBe("text-2xl text-text-caption font-normal");
  });

  it.each([
    ["heading", "text-text-heading"],
    ["subtle", "text-text-subtle"],
    ["disabled", "text-text-disabled"],
    ["invert", "text-text-invert"],
    ["link", "text-text-link"],
    ["primary", "text-text-primary"],
  ] as const)("colour %s maps to %s", (color, expected) => {
    render(
      <Text data-testid="t" color={color}>
        x
      </Text>,
    );
    expect(cls()).toContain(expected);
  });

  it("composes weight, align and truncate", () => {
    render(
      <Text data-testid="t" size="xs" weight="medium" align="center" truncate>
        x
      </Text>,
    );
    expect(cls()).toBe(
      "text-xs text-text-body font-medium text-center truncate",
    );
  });

  it("renders the element given by as", () => {
    render(
      <Text data-testid="t" as="span">
        x
      </Text>,
    );
    expect(screen.getByTestId("t").tagName).toBe("SPAN");
  });
});
