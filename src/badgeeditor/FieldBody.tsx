import { Rect, Text, Group, Image as KonvaImage } from "react-konva";
import { GRAY_200, GRAY_400, GRAY_900, WHITE } from "@/canvasColors";
import type { BadgeField } from "./model";
import { fieldQrUrl, type BadgeData } from "./badgeData";
import { PPI, QR_BASE_PX } from "./canvasMetrics";
import { useImageLoader } from "./useImageLoader";
import { FieldContent } from "./FieldContent";
import { useBadgeImageUrl } from "./badgeImageContext";

/**
 * The visual contents of a field (no interaction), shared by the editor's
 * interactive FieldShape and the read-only StaticField used in Full Preview.
 * Rendered at the group origin; includes the field-level 180° inversion.
 */
export function FieldBody({
  field,
  data,
}: {
  field: BadgeField;
  data: BadgeData | null;
}) {
  const resolveImageUrl = useBadgeImageUrl();
  const imageUrl =
    field.kind === "image" ? resolveImageUrl(field.code) : undefined;
  const isQrField = field.kind === "qrCode";
  const qrUrl = isQrField && data ? fieldQrUrl(field, data) : undefined;
  const getImg = useImageLoader(isQrField ? [qrUrl] : []);

  if (isQrField) {
    const size = QR_BASE_PX * (field.scale ?? 1);
    const img = getImg(qrUrl);
    return img ? (
      <>
        <Rect width={size} height={size} fill={WHITE} />
        <KonvaImage image={img} width={size} height={size} listening={false} />
      </>
    ) : (
      <>
        <Rect width={size} height={size} fill={GRAY_900} cornerRadius={2} />
        <Text
          text="QR"
          width={size}
          height={size}
          align="center"
          verticalAlign="middle"
          fill={WHITE}
          fontSize={Math.max(10, size * 0.25)}
          listening={false}
        />
      </>
    );
  }

  const w = (field.width ?? 2) * PPI;
  const h = (field.height ?? 0.3) * PPI;
  const fontSize = field.fontSize ?? 20;
  const inverted = Boolean(field.inverted);

  return (
    <>
      {imageUrl ? (
        <Rect width={w} height={h} fill="transparent" />
      ) : field.kind === "image" ? (
        <Rect
          width={w}
          height={h}
          fill={GRAY_200}
          stroke={GRAY_400}
          strokeWidth={1}
        />
      ) : field.kind === "tickets" ? (
        <Rect
          width={w}
          height={h}
          fill="transparent"
          stroke={GRAY_900}
          strokeWidth={1}
        />
      ) : (
        <Rect
          width={w}
          height={h}
          fill="transparent"
          stroke={GRAY_400}
          strokeWidth={1}
          dash={[4, 4]}
        />
      )}
      <Group
        x={inverted ? w : 0}
        y={inverted ? h : 0}
        rotation={inverted ? 180 : 0}
        listening={false}
      >
        <FieldContent
          field={field}
          w={w}
          h={h}
          fontSize={fontSize}
          data={data}
          imageUrl={imageUrl}
        />
      </Group>
    </>
  );
}
