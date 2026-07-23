import { useMemo } from "react";
import { Shape } from "react-konva";
import type { BackgroundDxfData } from "../../../types";
import { drawPrimitives, type DrawContext } from "../../utils/dxf/drawPrimitives";

interface DxfDrawingProps {
  config: BackgroundDxfData;
}

/** Renders an imported DXF drawing as one locked, non-interactive node on the
 *  background layer. A single Shape paints every primitive in one pass, so even
 *  large drawings stay cheap. Parser-free (shares `drawPrimitives` with the
 *  viewer and the import preview) — the DXF parser never reaches this module.
 *
 *  `hiddenLayers` (set in the Properties panel after import) is a pure render
 *  filter — nothing is re-parsed or re-baked to toggle a layer's visibility. */
export function DxfDrawing({ config }: DxfDrawingProps) {
  const hiddenLayers = useMemo(
    () => (config.hiddenLayers?.length ? new Set(config.hiddenLayers) : undefined),
    [config.hiddenLayers]
  );
  return (
    <Shape
      listening={false}
      opacity={config.opacity}
      sceneFunc={(ctx) => {
        drawPrimitives(ctx as unknown as DrawContext, config.primitives, { hiddenLayers });
      }}
    />
  );
}
