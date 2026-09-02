import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Row } from "./Row";

const cls = () => screen.getByTestId("r").className;

describe("Row", () => {
  // Unlike Stack, gap has no default — ditto's Row leaves it unset, so a bare
  // Row emits no gap class at all.
  it("is a bare flex row by default, with no gap", () => {
    render(<Row data-testid="r">x</Row>);
    expect(cls()).toBe("flex flex-row");
  });

  it("takes items-center and a gap", () => {
    render(
      <Row data-testid="r" gap="tight" align="center">
        x
      </Row>,
    );
    expect(cls()).toBe("flex flex-row gap-tight items-center");
  });

  it.each(["xs", "sm", "md", "lg", "xl", "2xl"] as const)(
    "stacks below %s and rows above it",
    bp => {
      render(
        <Row data-testid="r" responsive={bp}>
          x
        </Row>,
      );
      expect(cls()).toBe(`flex flex-col ${bp}:flex-row`);
    },
  );

  it("drops flex-row when responsive is set, rather than emitting both", () => {
    render(
      <Row data-testid="r" responsive="md">
        x
      </Row>,
    );
    expect(cls()).not.toContain("flex-row ");
    expect(cls()).toContain("flex-col");
  });

  it("composes wrap, justify and spacing", () => {
    render(
      <Row data-testid="r" gap="xxs" justify="between" wrap px="s" py="hair">
        x
      </Row>,
    );
    expect(cls()).toBe(
      "flex flex-row gap-xxs justify-between flex-wrap px-s py-hair",
    );
  });

  it("renders the element given by as", () => {
    render(
      <Row data-testid="r" as="nav">
        x
      </Row>,
    );
    expect(screen.getByTestId("r").tagName).toBe("NAV");
  });
});
