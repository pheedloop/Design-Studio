import { Group } from "react-konva";
import type { BadgeField } from "./model";
import type { BadgeData } from "./badgeData";
import { fieldSizePx } from "./useBadgeGuides";
import { PPI } from "./canvasMetrics";
import { FieldBody } from "./FieldBody";

/** Read-only positioned field visual for the full-preview render. */
export function StaticField({
  field,
  data,
}: {
  field: BadgeField;
  data: BadgeData | null;
}) {
  const { w, h } = fieldSizePx(field);
  return (
    <Group
      x={field.left * PPI}
      y={field.top * PPI}
      width={w}
      height={h}
      listening={false}
    >
      <FieldBody field={field} data={data} />
    </Group>
  );
}
