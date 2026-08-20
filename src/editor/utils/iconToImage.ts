import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import type { IconType } from "react-icons";

const imageCache = new Map<string, HTMLImageElement>();

/**
 * Convert a react-icons component to an HTMLImageElement for Konva.
 * Caches by icon id + color + size.
 */
export function iconToImage(
  Icon: IconType,
  color: string,
  size: number,
  onLoad: (img: HTMLImageElement) => void,
): void {
  const cacheKey = `${Icon.name || Icon.toString()}-${color}-${size}`;
  const cached = imageCache.get(cacheKey);
  if (cached) {
    onLoad(cached);
    return;
  }

  const svgString = renderToStaticMarkup(createElement(Icon, { size, color }));

  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const img = new window.Image();
  img.onload = () => {
    imageCache.set(cacheKey, img);
    URL.revokeObjectURL(url);
    onLoad(img);
  };
  img.src = url;
}
