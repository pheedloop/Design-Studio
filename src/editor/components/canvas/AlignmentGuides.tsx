import { Line } from "react-konva";
import type { GuideLine } from "@/editor/hooks/useAlignmentGuides";
import { BRAND } from "@/canvasColors";

interface AlignmentGuidesProps {
  guides: GuideLine[];
  canvasWidth: number;
  canvasHeight: number;
}

export function AlignmentGuides({
  guides,
  canvasWidth,
  canvasHeight,
}: AlignmentGuidesProps) {
  return (
    <>
      {guides.map((guide, i) =>
        guide.axis === "x" ? (
          <Line
            key={`guide-${i}`}
            points={[
              guide.position,
              -canvasHeight,
              guide.position,
              canvasHeight * 2,
            ]}
            stroke={BRAND}
            strokeWidth={0.5}
            dash={[4, 4]}
            listening={false}
          />
        ) : (
          <Line
            key={`guide-${i}`}
            points={[
              -canvasWidth,
              guide.position,
              canvasWidth * 2,
              guide.position,
            ]}
            stroke={BRAND}
            strokeWidth={0.5}
            dash={[4, 4]}
            listening={false}
          />
        ),
      )}
    </>
  );
}
