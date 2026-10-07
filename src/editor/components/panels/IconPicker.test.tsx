import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { IconPicker } from "./IconPicker";

function renderPicker() {
  const onClose = vi.fn();
  render(
    <IconPicker
      selectedId={null}
      onSelect={() => {}}
      onClose={onClose}
      anchorRect={new DOMRect(0, 0, 100, 40)}
    />,
  );
  return onClose;
}

describe("IconPicker", () => {
  // v0.4.0 dismissed on pointerdown, which switched to Select before the
  // canvas's mousedown could place the icon (ENG-3916).
  it("stays open on an outside press, which belongs to the canvas placing the icon", () => {
    const onClose = renderPicker();
    fireEvent.pointerDown(document.body);
    fireEvent.mouseDown(document.body);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes on Escape from the search field", () => {
    const onClose = renderPicker();
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
