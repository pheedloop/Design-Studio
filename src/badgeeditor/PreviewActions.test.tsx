import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PreviewActions } from "./PreviewActions";
import { printPdf, saveBlob } from "./badgeFiles";

vi.mock("./badgeFiles", async importOriginal => ({
  ...(await importOriginal<typeof import("./badgeFiles")>()),
  saveBlob: vi.fn(),
  printPdf: vi.fn(),
}));

const attendee = { id: "A1", name: "Ada Lovelace" };
const blob = new Blob(["x"]);

function setup(download = vi.fn().mockResolvedValue(blob)) {
  const onFailedChange = vi.fn();
  render(
    <PreviewActions
      attendee={attendee}
      download={download}
      onFailedChange={onFailedChange}
    />,
  );
  return { download, onFailedChange };
}

describe("PreviewActions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("downloads a PDF from the menu and saves it under the attendee's name", async () => {
    const { download } = setup();
    const trigger = screen.getByRole("button", { name: "Download" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(screen.getByText("Download PDF"));
    await waitFor(() =>
      expect(saveBlob).toHaveBeenCalledWith(blob, "Ada_Lovelace_badge.pdf"),
    );
    expect(download).toHaveBeenCalledWith("A1", "pdf");
  });

  it("prints the PDF through the print helper", async () => {
    const { download } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Print" }));
    await waitFor(() => expect(printPdf).toHaveBeenCalledWith(blob));
    expect(download).toHaveBeenCalledWith("A1", "pdf");
    expect(saveBlob).not.toHaveBeenCalled();
  });

  it("reports a failed request and clears it on the next action", async () => {
    const download = vi
      .fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue(blob);
    const { onFailedChange } = setup(download);
    fireEvent.click(screen.getByRole("button", { name: "Print" }));
    await waitFor(() => expect(onFailedChange).toHaveBeenLastCalledWith(true));
    expect(printPdf).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Print" }));
    await waitFor(() => expect(printPdf).toHaveBeenCalled());
    expect(onFailedChange).toHaveBeenCalledWith(false);
  });
});
