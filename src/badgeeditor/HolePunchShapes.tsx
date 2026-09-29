import { Ellipse, Rect } from "react-konva";
import { GRAY_100, GRAY_400 } from "@/canvasColors";
import type { HolePunch } from "./model";
import { holePunchBoxes } from "./holePunchGeometry";

export function HolePunchShapes({
  holePunch,
  panelW,
}: {
  holePunch: HolePunch;
  panelW: number;
}) {
  const style = {
    fill: GRAY_100,
    stroke: GRAY_400,
    strokeWidth: 1,
    listening: false,
  };
  return (
    <>
      {holePunchBoxes(holePunch, panelW).map((box, i) =>
        holePunch.shape === "circle" ? (
          <Ellipse
            key={i}
            x={box.x + box.width / 2}
            y={box.y + box.height / 2}
            radiusX={box.width / 2}
            radiusY={box.height / 2}
            {...style}
          />
        ) : (
          <Rect
            key={i}
            {...box}
            cornerRadius={Math.min(box.width, box.height) / 2}
            {...style}
          />
        ),
      )}
    </>
  );
}
