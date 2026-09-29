import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nProvider } from "@/i18n/I18nProvider";
import { interpolate } from "@/i18n/interpolate";
import { resolveEnglish, type Translate } from "@/badgeeditor/i18n";
import { ImageGallery } from "./ImageGallery";
import { ImageDeleteError } from "./imageDeleteError";

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
});
