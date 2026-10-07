import { Group, Image as KonvaImage } from "react-konva";
import type { BadgePageBackground } from "./model";
import { fitBackground } from "./backgroundFit";
import type { CornerRadii } from "./canvasMetrics";
import { useBadgeImageUrl } from "./badgeImageContext";
import { useImageLoader } from "./useImageLoader";

export function PanelBackground({
  background,
  width,
  height,
  cornerRadius = 0,
}: {
  background: BadgePageBackground;
  width: number;
  height: number;
  cornerRadius?: number | CornerRadii;
}) {
  const url = useBadgeImageUrl()(background.imageCode);
  const getImage = useImageLoader(url ? [url] : []);
  const image = url ? getImage(url) : null;
  if (!image) return null;

  const box = fitBackground(
    background.fit,
    { width: image.naturalWidth, height: image.naturalHeight },
    { width, height },
  );
  return (
    <Group
      listening={false}
      clipFunc={ctx => {
        ctx.beginPath();
        ctx.roundRect(0, 0, width, height, cornerRadius);
        ctx.closePath();
      }}
    >
      <KonvaImage image={image} {...box} />
    </Group>
  );
}
