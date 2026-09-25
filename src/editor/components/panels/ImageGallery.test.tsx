import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nProvider } from "@/i18n/I18nProvider";
import { interpolate } from "@/i18n/interpolate";
import { resolveEnglish, type Translate } from "@/badgeeditor/i18n";
import { ImageGallery } from "./ImageGallery";

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
});
