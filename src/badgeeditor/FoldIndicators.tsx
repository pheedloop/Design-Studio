import { Group, Line, Arrow } from "react-konva";
import { PPI } from "./canvasMetrics";

/**
 * Section-plane-style fold indicator: a dash-dot line across a panel edge with
 * arrows pointing toward the adjacent panel (the fold direction). Drawn on the
 * edges that connect to other panels in a multi-page badge.
 */
export function FoldIndicators({
  foldTop,
  foldBottom,
  panelW,
  panelH,
}: {
  foldTop: boolean;
  foldBottom: boolean;
  panelW: number;
  panelH: number;
}) {
  const color = "#6366f1"; // indigo — distinct from guides/slots/tearaways
  const gap = 0.12 * PPI; // breathing room between the panel edge and the line
  const overhang = 0.35 * PPI; // how far the line extends past the panel width
  const arrowLen = 0.3 * PPI;
  const dash = [10, 4, 2, 4]; // dash-dot

  // `edgeY` is the panel edge; the line sits `gap` beyond it in the fold dir.
  const edge = (edgeY: number, dir: 1 | -1, key: string) => {
    const y = edgeY + dir * gap;
    const x1 = -overhang;
    const x2 = panelW + overhang;
    return (
      <Group key={key} listening={false}>
        <Line
          points={[x1, y, x2, y]}
          stroke={color}
          strokeWidth={1}
          dash={dash}
        />
        {[x1, x2].map((x, i) => (
          <Arrow
            key={i}
            points={[x, y, x, y + dir * arrowLen]}
            stroke={color}
            fill={color}
            strokeWidth={1.5}
            pointerLength={6}
            pointerWidth={6}
          />
        ))}
      </Group>
    );
  };

  return (
    <>
      {foldTop && edge(0, -1, "top")}
      {foldBottom && edge(panelH, 1, "bottom")}
    </>
  );
}
