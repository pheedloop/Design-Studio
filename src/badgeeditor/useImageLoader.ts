import { useEffect, useState } from "react";
import qrCodeUrl from "./qr-code.png";

// Shared image cache so per-field / per-ticket QR URLs load once. Undefined urls
// fall back to the bundled stand-in QR.
const STAND_IN_QR = qrCodeUrl;
const imageCache = new Map<string, HTMLImageElement>();

/**
 * Ensure the given image urls are loaded (undefined → stand-in) and return a
 * lookup. One hook call per component instance — pass an array, not per-row.
 */
export function useImageLoader(
  urls: (string | undefined)[],
): (url?: string) => HTMLImageElement | null {
  const [, bump] = useState(0);
  const key = urls.map(u => u ?? "").join("|");
  useEffect(() => {
    let alive = true;
    for (const u of urls) {
      const src = u || STAND_IN_QR;
      if (!imageCache.has(src)) {
        const im = new window.Image();
        im.crossOrigin = "anonymous";
        im.onload = () => {
          imageCache.set(src, im);
          if (alive) bump(x => x + 1);
        };
        im.src = src;
      }
    }
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return (u?: string) => imageCache.get(u || STAND_IN_QR) ?? null;
}
