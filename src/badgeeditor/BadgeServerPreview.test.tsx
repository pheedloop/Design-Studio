import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BadgeServerPreview } from "./BadgeServerPreview";
import type { BadgePreviewImage } from "./badgeData";

const attendee = { id: "A1", name: "Ada" };
const image: BadgePreviewImage = { src: "data:x", widthIn: 4, heightIn: 3 };

describe("BadgeServerPreview", () => {
  it("shows loading, then the image at the badge's aspect ratio", async () => {
    const renderPreview = vi.fn().mockResolvedValue(image);
    render(
      <BadgeServerPreview
        attendee={attendee}
        render={renderPreview}
        refreshKey="v1"
      />,
    );
    expect(screen.getByText("Generating preview…")).toBeTruthy();
    const img = await screen.findByAltText("Badge preview for Ada");
    expect(img.getAttribute("src")).toBe("data:x");
    expect(img.style.aspectRatio).toBe("4 / 3");
    expect(renderPreview).toHaveBeenCalledWith("A1");
  });

  it("shows an error and Try again re-requests", async () => {
    const renderPreview = vi
      .fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue(image);
    render(
      <BadgeServerPreview
        attendee={attendee}
        render={renderPreview}
        refreshKey="v1"
      />,
    );
    fireEvent.click(await screen.findByText("Try again"));
    await screen.findByAltText("Badge preview for Ada");
    expect(renderPreview).toHaveBeenCalledTimes(2);
  });

  it("re-fetches when the saved document changes", async () => {
    const renderPreview = vi.fn().mockResolvedValue(image);
    const { rerender } = render(
      <BadgeServerPreview
        attendee={attendee}
        render={renderPreview}
        refreshKey="v1"
      />,
    );
    await screen.findByAltText("Badge preview for Ada");
    rerender(
      <BadgeServerPreview
        attendee={attendee}
        render={renderPreview}
        refreshKey="v2"
      />,
    );
    expect(screen.getByText("Generating preview…")).toBeTruthy();
    await screen.findByAltText("Badge preview for Ada");
    expect(renderPreview).toHaveBeenCalledTimes(2);
  });
});
