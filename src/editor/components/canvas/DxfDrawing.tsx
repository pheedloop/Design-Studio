import { Shape } from "react-konva";
import type { DxfDrawing as DxfDrawingType } from "../../../types";
import { drawPrimitives, type DrawContext } from "../../utils/dxf/drawPrimitives";

interface DxfDrawingProps {
  config: DxfDrawingType;
}

/** Renders an imported DXF drawing as one locked, non-interactive node on the
 *  background layer. A single Shape paints every primitive in one pass, so even
 *  large drawings stay cheap. Parser-free (shares `drawPrimitives` with the
 *  viewer and the import preview) — the DXF parser never reaches this module. */
export function DxfDrawing({ config }: DxfDrawingProps) {
  return (
    <Shape
      listening={false}
      opacity={config.opacity}
      sceneFunc={(ctx) => {
        drawPrimitives(ctx as unknown as DrawContext, config.primitives);
      }}
    />
  );
}
