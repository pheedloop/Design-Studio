import { useState, useEffect } from "react";
import { Image as KonvaImage } from "react-konva";
import { getIconEntry } from "@/editor/utils/iconRegistry";
import { iconToImage } from "@/editor/utils/iconToImage";

export function ViewerIcon({
  iconName,
  color,
  width,
  height,
}: {
  iconName: string;
  color: string;
  width: number;
  height: number;
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const entry = getIconEntry(iconName);
    if (!entry) return;
    iconToImage(entry.component, color, 128, setImage);
  }, [iconName, color]);
  if (!image) return null;
  return <KonvaImage image={image} width={width} height={height} />;
}
