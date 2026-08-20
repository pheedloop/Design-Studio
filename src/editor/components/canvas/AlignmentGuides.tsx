import { Line } from "react-konva";
import type { GuideLine } from "../../hooks/useAlignmentGuides";

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
            stroke="#007bff"
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
            stroke="#007bff"
            strokeWidth={0.5}
            dash={[4, 4]}
            listening={false}
          />
        ),
      )}
    </>
  );
}
