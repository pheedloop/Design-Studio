import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AlignmentControls } from "./AlignmentControls";

const noop = () => {};
const ALIGN_H = {
  onAlignLeft: noop,
  onAlignCenterH: noop,
  onAlignRight: noop,
};
const ALIGN_V = {
  onAlignTop: noop,
  onAlignCenterV: noop,
  onAlignBottom: noop,
};
const DISTRIBUTE = { onDistributeH: noop, onDistributeV: noop };

function counts(props: Record<string, () => void>) {
  const { container } = render(<AlignmentControls {...props} />);
  return {
    buttons: container.querySelectorAll("button").length,
    dividers: container.querySelectorAll("div.w-px").length,
  };
}

describe("AlignmentControls", () => {
  it("shows a button only for a handler that was passed", () => {
    expect(counts({ ...ALIGN_H, ...ALIGN_V, ...DISTRIBUTE })).toEqual({
      buttons: 8,
      dividers: 2,
    });
    expect(counts({ ...ALIGN_H, ...ALIGN_V })).toEqual({
      buttons: 6,
      dividers: 1,
    });
  });

  it("renders no wrapper element around the row", () => {
    // A wrapper would pull the buttons out of the caller's flex row.
    const { container } = render(<AlignmentControls {...ALIGN_H} />);
    expect(container.firstElementChild?.tagName).toBe("BUTTON");
  });

  it("never leads with a divider", () => {
    // Distribute-only used to emit two dividers before the first button.
    expect(counts(DISTRIBUTE)).toEqual({ buttons: 2, dividers: 0 });
    expect(counts(ALIGN_V)).toEqual({ buttons: 3, dividers: 0 });
    expect(counts({})).toEqual({ buttons: 0, dividers: 0 });
  });

  it("draws one divider between each pair of visible groups", () => {
    expect(counts({ ...ALIGN_H, ...DISTRIBUTE })).toEqual({
      buttons: 5,
      dividers: 1,
    });
  });
});
