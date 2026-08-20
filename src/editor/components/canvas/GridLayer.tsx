import { useMemo } from "react";
import { Line } from "react-konva";

interface GridLayerProps {
  width: number;
  height: number;
  spacing: number;
  color: string;
  opacity: number;
}

export function GridLayer({
  width,
  height,
  spacing,
  color,
  opacity,
}: GridLayerProps) {
  const lines = useMemo(() => {
    const result: { points: number[]; key: string }[] = [];

    // Vertical lines
    for (let x = spacing; x < width; x += spacing) {
      result.push({ points: [x, 0, x, height], key: `v-${x}` });
    }

    // Horizontal lines
    for (let y = spacing; y < height; y += spacing) {
      result.push({ points: [0, y, width, y], key: `h-${y}` });
    }

    return result;
  }, [width, height, spacing]);

  return (
    <>
      {lines.map(line => (
        <Line
          key={line.key}
          points={line.points}
          stroke={color}
          strokeWidth={0.5}
          opacity={opacity}
          listening={false}
        />
      ))}
    </>
  );
}
