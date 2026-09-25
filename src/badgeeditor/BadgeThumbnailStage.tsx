import { memo, type RefObject } from "react";
import type Konva from "konva";
import { Layer, Rect, Stage } from "react-konva";
import { WHITE } from "@/canvasColors";
import { THUMBNAIL_MAX_EDGE } from "@/editor/utils/captureThumbnail";
import type { BadgeDocument } from "./model";
import { PPI, mmToPx } from "./canvasMetrics";
import { HolePunchShapes } from "./HolePunchShapes";
import { StaticField } from "./StaticField";

export const BadgeThumbnailStage = memo(function BadgeThumbnailStage({
  doc,
  stageRef,
}: {
  doc: BadgeDocument;
  stageRef: RefObject<Konva.Stage | null>;
}) {
  const panelW = doc.panelSize.width * PPI;
  const panelH = doc.panelSize.height * PPI;
  const ratio =
    panelW > 0 && panelH > 0
      ? Math.min(THUMBNAIL_MAX_EDGE / panelW, THUMBNAIL_MAX_EDGE / panelH)
      : 1;

  return (
    <div className="hidden" aria-hidden>
      <Stage
        ref={stageRef}
        width={Math.max(1, Math.round(panelW * ratio))}
        height={Math.max(1, Math.round(panelH * ratio))}
        scaleX={ratio}
        scaleY={ratio}
        listening={false}
      >
        <Layer>
          <Rect
            width={panelW}
            height={panelH}
            cornerRadius={mmToPx(doc.cornerRadiusMm ?? 0)}
            fill={WHITE}
          />
          {doc.holePunch && (
            <HolePunchShapes holePunch={doc.holePunch} panelW={panelW} />
          )}
          {doc.pages[0]?.fields.map(f => (
            <StaticField key={f.id} field={f} data={null} />
          ))}
        </Layer>
      </Stage>
    </div>
  );
});
