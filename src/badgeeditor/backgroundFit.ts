import type { BackgroundFit } from "./model";

interface Size {
  width: number;
  height: number;
}

/** Where an image lands in its panel, matching CSS `object-fit` centred at 50% 50%. */
export function fitBackground(
  fit: BackgroundFit,
  image: Size,
  panel: Size,
): { x: number; y: number; width: number; height: number } {
  if (fit === "stretch" || image.width <= 0 || image.height <= 0) {
    return { x: 0, y: 0, width: panel.width, height: panel.height };
  }
  const pick = fit === "cover" ? Math.max : Math.min;
  const scale = pick(panel.width / image.width, panel.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  return {
    x: (panel.width - width) / 2,
    y: (panel.height - height) / 2,
    width,
    height,
  };
}
