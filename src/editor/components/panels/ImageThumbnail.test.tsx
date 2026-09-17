import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { EditorImage } from "@/editor/types";
import { ImageThumbnail } from "./ImageThumbnail";

const image: EditorImage = {
  id: "img-1",
  url: "https://example.test/a.png",
  name: "a.png",
  width: 800,
  height: 200,
  createdAt: "2026-01-01T00:00:00Z",
};

function renderThumbnail(
  props: Partial<React.ComponentProps<typeof ImageThumbnail>> = {},
) {
  render(
    <ImageThumbnail
      image={image}
      isSelected={false}
      onSelect={vi.fn()}
      onInsert={vi.fn()}
      onDelete={vi.fn()}
      {...props}
    />,
  );
  return screen.queryByRole("button", { name: "Delete image" });
}

describe("ImageThumbnail delete control", () => {
  it("is reachable once the thumbnail is selected", () => {
    // Selection is the only affordance a touch device has: there is no hover,
    // so hover-only visibility leaves no way to delete an image.
    const button = renderThumbnail({ isSelected: true });
    expect(button?.className).toContain("opacity-100");
    expect(button?.className).not.toContain("pointer-events-none");
  });

  it("stays out of hit testing while the thumbnail is unselected", () => {
    const button = renderThumbnail({ isSelected: false });
    expect(button?.className).toContain("opacity-0");
    expect(button?.className).toContain("pointer-events-none");
  });

  it("is absent entirely when the host allows no deletion", () => {
    expect(renderThumbnail({ onDelete: undefined })).toBeNull();
  });
});
