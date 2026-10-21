import { Fragment } from "react";
import { Rect } from "react-konva";
import type { FloorPlanElement } from "@/types";
import { getElementBounds, getElementOutline } from "@/editor/utils/bounds";
import { BRAND } from "@/canvasColors";

interface MultiSelectBoundsProps {
  elements: FloorPlanElement[];
  selectedIds: Set<string>;
  // The multi-select transformer draws the same box when it is shown.
  showBox: boolean;
  // A group reads as one object, so its members aren't marked one by one.
  showEach: boolean;
}

export function MultiSelectBounds({
  elements,
  selectedIds,
  showBox,
  showEach,
}: MultiSelectBoundsProps) {
  if (selectedIds.size < 2) return null;

  const selected = elements.filter(el => selectedIds.has(el.id));
  if (selected.length < 2) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of selected) {
    const b = getElementBounds(el);
    minX = Math.min(minX, b.left);
    minY = Math.min(minY, b.top);
    maxX = Math.max(maxX, b.right);
    maxY = Math.max(maxY, b.bottom);
  }

  const padding = 4;

  return (
    <>
      {showBox && (
        <Rect
          x={minX - padding}
          y={minY - padding}
          width={maxX - minX + padding * 2}
          height={maxY - minY + padding * 2}
          stroke={BRAND}
          strokeWidth={1}
          dash={[6, 3]}
          listening={false}
        />
      )}
      {showEach &&
        selected.map(el => {
          const outline = getElementOutline(el);
          return (
            <Fragment key={el.id}>
              <Rect
                {...outline}
                fill={BRAND}
                opacity={0.15}
                listening={false}
              />
              <Rect
                {...outline}
                stroke={BRAND}
                strokeWidth={2}
                strokeScaleEnabled={false}
                listening={false}
              />
            </Fragment>
          );
        })}
    </>
  );
}
