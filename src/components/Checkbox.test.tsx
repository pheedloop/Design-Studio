import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Checkbox } from "./Checkbox";

const box = () => screen.getByRole("checkbox") as HTMLInputElement;

describe("Checkbox", () => {
  // The <label> wraps the input rather than pointing at it with htmlFor, which
  // is what lets it work without an id. Rewriting it as a sibling label would
  // silently stop associating the two, and clicking the text would do nothing.
  it("toggles when the label text is clicked", () => {
    const onChange = vi.fn();
    render(<Checkbox label="Invert" checked={false} onChange={onChange} />);

    fireEvent.click(screen.getByText("Invert"));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("reports the new state, not the event", () => {
    const onChange = vi.fn();
    render(<Checkbox label="Invert" checked onChange={onChange} />);

    fireEvent.click(box());

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("is controlled by the checked prop", () => {
    const { rerender } = render(
      <Checkbox label="Invert" checked={false} onChange={() => {}} />,
    );
    expect(box().checked).toBe(false);

    rerender(<Checkbox label="Invert" checked onChange={() => {}} />);
    expect(box().checked).toBe(true);
  });
});
