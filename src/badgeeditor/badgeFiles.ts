import type { BadgeDownloadFormat } from "./badgeData";

const PRINT_CLEANUP_MS = 60_000;
const PRINT_LOAD_TIMEOUT_MS = 15_000;

/** `First_Last_badge.pdf`: whitespace becomes `_`, characters unsafe in a file name are dropped. */
export function badgeFileName(
  attendeeName: string,
  format: BadgeDownloadFormat,
): string {
  const base = attendeeName
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\p{L}\p{N}_-]/gu, "")
    .replace(/^[_-]+|[_-]+$/g, "");
  return `${base ? `${base}_` : ""}badge.${format}`;
}

export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = fileName;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Opens the system print dialog for a PDF through a hidden off-screen iframe.
 * Resolves once print() has been called; rejects if the frame has no window,
 * print() throws, or the PDF never loads.
 */
export function printPdf(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    Object.assign(frame.style, {
      position: "fixed",
      left: "-10000px",
      top: "0",
      width: "0",
      height: "0",
      border: "0",
    });

    const cleanup = () => {
      clearTimeout(cleanupTimer);
      clearTimeout(loadTimer);
      frame.remove();
      URL.revokeObjectURL(url);
    };
    const fail = (error: Error) => {
      cleanup();
      reject(error);
    };

    const cleanupTimer = setTimeout(cleanup, PRINT_CLEANUP_MS);
    const loadTimer = setTimeout(
      () => fail(new Error("print frame did not load")),
      PRINT_LOAD_TIMEOUT_MS,
    );

    frame.onload = () => {
      clearTimeout(loadTimer);
      const win = frame.contentWindow;
      if (!win) return fail(new Error("no print window"));
      try {
        win.addEventListener("afterprint", cleanup);
        win.focus();
        win.print();
      } catch (error) {
        return fail(error instanceof Error ? error : new Error("print failed"));
      }
      resolve();
    };
    frame.src = url;
    document.body.appendChild(frame);
  });
}
