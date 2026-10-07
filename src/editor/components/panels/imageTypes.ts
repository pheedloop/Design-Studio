export type ImageType =
  "image/svg+xml" | "image/png" | "image/jpeg" | "image/gif";

export const ALL_IMAGE_TYPES: ImageType[] = [
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/gif",
];

export const IMAGE_TYPE_LABELS: Record<ImageType, string> = {
  "image/svg+xml": "SVG",
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/gif": "GIF",
};
