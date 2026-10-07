import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nProvider } from "@/i18n/I18nProvider";
import { interpolate } from "@/i18n/interpolate";
import { resolveEnglish, type Translate } from "@/badgeeditor/i18n";
import { ImageGallery } from "./ImageGallery";
import { ImageDeleteError } from "./imageDeleteError";
import { ImageUploadError } from "./imageUploadError";
import type { EditorImage } from "@/editor/types";

// A badge-editor host with no catalogue entries, falling back to the badge
// surface's English the way ditto does.
const badgeHostTranslate: Translate = (key, vars) =>
  interpolate(resolveEnglish(key, vars), vars);

describe("ImageGallery under the badge editor surface", () => {
  it("renders its English text from the badge surface's strings", () => {
    render(
      <I18nProvider translate={badgeHostTranslate}>
        <ImageGallery
          images={[]}
          onUpload={async () => {}}
          onConfirm={() => {}}
          onClose={() => {}}
        />
      </I18nProvider>,
    );

    expect(screen.getByText("Image Gallery")).toBeTruthy();
    expect(screen.getByText("Cancel")).toBeTruthy();
    expect(screen.getByText("Click to upload")).toBeTruthy();
    expect(screen.getByLabelText("Close")).toBeTruthy();
    expect(screen.getByLabelText("Search filename…")).toBeTruthy();
  });

  it("shows the reason a refused delete gives", async () => {
    render(
      <I18nProvider translate={badgeHostTranslate}>
        <ImageGallery
          images={[
            {
              id: "logo",
              url: "logo.png",
              name: "logo.png",
              width: 10,
              height: 10,
              createdAt: "2026-01-01",
            },
          ]}
          onDelete={async () => {
            throw new ImageDeleteError("common.error.imageInUse");
          }}
          onConfirm={() => {}}
          onClose={() => {}}
        />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByLabelText("Delete image"));
    expect(
      await screen.findByText(
        "This image is in use in the design. Remove it from the design first.",
      ),
    ).toBeTruthy();
  });

  it("selects the uploaded image so it can be confirmed at once", async () => {
    const stored: EditorImage = {
      id: "new",
      url: "new.png",
      name: "new.png",
      width: 10,
      height: 10,
      createdAt: "2026-01-01",
    };
    const onConfirm = vi.fn();
    function Host() {
      const [images, setImages] = useState<EditorImage[]>([]);
      return (
        <ImageGallery
          images={images}
          onUpload={async () => {
            setImages([stored]);
            return stored;
          }}
          onConfirm={onConfirm}
          onClose={() => {}}
          confirmLabel="Use as background"
        />
      );
    }
    const { container } = render(
      <I18nProvider translate={badgeHostTranslate}>
        <Host />
      </I18nProvider>,
    );

    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [new File(["x"], "new.png", { type: "image/png" })] },
    });
    fireEvent.click(await screen.findByText("Use as background"));

    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ id: "new" }),
    );
  });

  it("offers only the host's types and shows its upload error once", async () => {
    const { container } = render(
      <I18nProvider translate={badgeHostTranslate} locale="en-CA">
        <ImageGallery
          images={[]}
          accept={["image/png", "image/jpeg", "image/gif"]}
          onUpload={async () => {
            throw new ImageUploadError("Unsupported file type.");
          }}
          onConfirm={() => {}}
          onClose={() => {}}
        />
      </I18nProvider>,
    );
    const input = container.querySelector('input[type="file"]')!;

    expect(input.getAttribute("accept")).toBe("image/png,image/jpeg,image/gif");
    expect(screen.getByText("PNG, JPEG or GIF")).toBeTruthy();
    fireEvent.drop(screen.getByText("Click to upload").parentElement!, {
      dataTransfer: {
        files: [new File(["<svg/>"], "logo.svg", { type: "image/svg+xml" })],
      },
    });
    expect(screen.getByText("This file type is not supported.")).toBeTruthy();
    fireEvent.change(input, {
      target: { files: [new File(["x"], "logo.png", { type: "image/png" })] },
    });
    expect(await screen.findAllByText("Unsupported file type.")).toHaveLength(
      1,
    );
    expect(screen.queryByText("Upload failed. Please try again.")).toBeNull();
  });
});
