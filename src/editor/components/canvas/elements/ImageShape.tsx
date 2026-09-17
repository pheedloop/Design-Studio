import { useEffect, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import type { RectGeometry } from "@/types";

interface ImageShapeProps {
  geo: RectGeometry;
  url: string;
}

export function ImageShape({ geo, url }: ImageShapeProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    // Must be set before src: without it a CDN-hosted image taints the stage,
    // and stage.toDataURL() then throws — breaking thumbnail capture and export.
    img.crossOrigin = "anonymous";
    img.onload = () => setImage(img);
    img.src = url;
  }, [url]);

  if (!image) return null;

  return <KonvaImage image={image} width={geo.width} height={geo.height} />;
}
