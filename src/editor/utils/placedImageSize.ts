export const PLACED_IMAGE_MAX_EDGE = 240;

export const PLACED_IMAGE_FALLBACK_EDGE = 160;

interface IntrinsicSize {
  width: number | null;
  height: number | null;
}

export function placedImageSize(
  image: IntrinsicSize,
  maxEdge: number = PLACED_IMAGE_MAX_EDGE,
): { width: number; height: number } {
  const { width, height } = image;
  if (!width || !height) {
    return {
      width: PLACED_IMAGE_FALLBACK_EDGE,
      height: PLACED_IMAGE_FALLBACK_EDGE,
    };
  }

  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };

  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}
