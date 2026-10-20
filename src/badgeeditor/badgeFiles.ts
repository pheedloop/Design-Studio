import type { BadgeDownloadFormat } from "./badgeData";

const PRINT_CLEANUP_MS = 60_000;

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

/** Opens the system print dialog for a PDF through a hidden off-screen iframe. */
export function printPdf(blob: Blob): void {
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
    clearTimeout(timer);
    frame.remove();
    URL.revokeObjectURL(url);
  };

  const timer = setTimeout(cleanup, PRINT_CLEANUP_MS);

  frame.onload = () => {
    const win = frame.contentWindow;
    try {
      if (!win) throw new Error("no print window");
      win.addEventListener("afterprint", cleanup);
      win.focus();
      win.print();
    } catch {
      frame.remove();
      window.open(url);
    }
  };
  frame.src = url;
  document.body.appendChild(frame);
}
