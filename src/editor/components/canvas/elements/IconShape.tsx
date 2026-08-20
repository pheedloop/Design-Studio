import { useEffect, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import type { RectGeometry } from "@/types";
import { getIconEntry } from "@/editor/utils/iconRegistry";
import { iconToImage } from "@/editor/utils/iconToImage";

interface IconShapeProps {
  geo: RectGeometry;
  iconName: string;
  color: string;
}

export function IconShape({ geo, iconName, color }: IconShapeProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const entry = getIconEntry(iconName);
    if (!entry) return;

    // Use a large render size for quality, Konva scales to geo.width/height
    iconToImage(entry.component, color, 128, setImage);
  }, [iconName, color]);

  if (!image) return null;

  return <KonvaImage image={image} width={geo.width} height={geo.height} />;
}
