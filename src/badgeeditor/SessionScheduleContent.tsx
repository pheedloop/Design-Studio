import { useMemo } from "react";
import { Group, Line, Text } from "react-konva";
import { GRAY_400, GRAY_900 } from "@/canvasColors";
import { canvasGlyphSum, canvasTextMeasure } from "./canvasTextMeasure";
import { layoutSessionTable } from "./sessionLayout";
import type { SessionRow } from "./sessionLayout";

/** The generator's session table, drawn unclipped from `layoutSessionTable`. */
export function SessionScheduleContent({
  w,
  h,
  fontPx,
  fontFamily,
  rows,
  inverted,
  mutedPlaceholder,
}: {
  w: number;
  h: number;
  fontPx: number;
  fontFamily: string;
  rows: SessionRow[];
  inverted: boolean;
  mutedPlaceholder: boolean;
}) {
  const layout = useMemo(
    () =>
      layoutSessionTable({
        width: w,
        boxHeight: h,
        fontPx,
        rows,
        inverted,
        measure: canvasTextMeasure(fontFamily),
      }),
    [w, h, fontPx, rows, inverted, fontFamily],
  );
  // Konva draws with the canvas's unrounded advances; spread each line's
  // difference from the print's width across its glyphs.
  const glyphSum = canvasGlyphSum(fontFamily);
  return (
    <Group y={layout.offsetY} listening={false}>
      <Line
        points={[0, layout.ruleY, w, layout.ruleY]}
        stroke={GRAY_900}
        strokeWidth={1}
        listening={false}
      />
      {layout.lines.map((line, i) => (
        <Text
          key={i}
          x={line.x}
          y={line.y}
          text={line.text}
          fontFamily={fontFamily}
          fontStyle="bold"
          fontSize={fontPx}
          lineHeight={layout.lineHeight / fontPx}
          letterSpacing={
            (line.width - glyphSum(line.text, fontPx)) / [...line.text].length
          }
          wrap="none"
          fill={line.placeholder && mutedPlaceholder ? GRAY_400 : GRAY_900}
          listening={false}
        />
      ))}
    </Group>
  );
}
