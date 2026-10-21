import { describe, expect, it } from "vitest";
import { useRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DropdownMenu } from "./DropdownMenu";

function Harness() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <div ref={anchorRef}>
        <button onClick={() => setOpen(o => !o)}>Trigger</button>
        {open && (
          <DropdownMenu
            items={[{ label: "Item" }]}
            onClose={() => setOpen(false)}
            anchorRef={anchorRef}
          />
        )}
      </div>
      <p>Outside</p>
    </>
  );
}

const press = (el: Element) => {
  fireEvent.pointerDown(el);
  fireEvent.click(el);
};

describe("DropdownMenu", () => {
  // ENG-3982: the trigger's pointerdown dismissed the menu, then its click
  // reopened it, so the trigger could never close its own menu.
  it("closes when its trigger is pressed again", () => {
    render(<Harness />);
    press(screen.getByText("Trigger"));
    expect(screen.getByText("Item")).toBeTruthy();
    press(screen.getByText("Trigger"));
    expect(screen.queryByText("Item")).toBeNull();
  });

  it("closes on a press outside", () => {
    render(<Harness />);
    press(screen.getByText("Trigger"));
    press(screen.getByText("Outside"));
    expect(screen.queryByText("Item")).toBeNull();
  });
});
