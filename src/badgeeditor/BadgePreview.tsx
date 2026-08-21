import { useLayoutEffect, useRef } from "react";
import { Stage, Layer, Rect, Group, Line } from "react-konva";
import { useCanvasControls } from "@/editor/hooks/useCanvasControls";
import { Slots } from "./BadgeCanvas";
import { StaticField } from "./StaticField";
import { PANEL_CORNER_IN, PPI } from "./canvasMetrics";
import { BadgeRulers } from "./BadgeRulers";
import { foldInvertForPage } from "./serialize";
import { DPI } from "./model";
import type { Unit } from "./units";
import type { BadgeData } from "./badgeData";
import type { BadgeDocument } from "./model";

/**
 * Read-only "as printed" preview: every panel stitched at its true print offset
 * on one tall sheet, with folded-back panels rendered upside-down (page-level
 * 180° rotation, composed with any field-level inversion). Pan with drag, zoom
 * with the wheel. No editing.
 */
export function BadgePreview({
  doc,
  data,
  showRulers = false,
  unit = "in",
}: {
  doc: BadgeDocument;
  data: BadgeData | null;
  showRulers?: boolean;
  unit?: Unit;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Destructured individually (not kept as one bundled object) — accessing a
  // property off an object that also holds a ref (stageRef) gets conservatively
  // treated as a ref read by the linter even for non-ref fields like `scale`.
  const {
    stageRef,
    scale,
    position,
    stageSize,
    hasMeasured,
    fitToBounds,
    handleWheel,
    handleDragEnd,
  } = useCanvasControls(containerRef);

  const panelW = doc.panelSize.width * PPI;
  const panelH = doc.panelSize.height * PPI;
  const n = doc.pages.length;
  const totalH = panelH * n;

  // On open, fit the full sheet in the viewport (centered, with a margin) rather
  // than pinning it to the top-left — matching the editors and viewers.
  const didFit = useRef(false);
  useLayoutEffect(() => {
    if (didFit.current || !hasMeasured) return;
    didFit.current = true;
    fitToBounds(
      { width: panelW, height: totalH },
      { padding: 48, maxScale: 1 },
    );
  }, [hasMeasured, fitToBounds, panelW, totalH]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gray-100"
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
      >
        <Layer>
          {/* The full unfolded sheet */}
          <Rect
            x={0}
            y={0}
            width={panelW}
            height={totalH}
            cornerRadius={PANEL_CORNER_IN * PPI}
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth={1}
            shadowColor="#000000"
            shadowOpacity={0.12}
            shadowBlur={12}
            shadowOffsetY={2}
          />

          {/* Lanyard slots — top of the front panel */}
          {doc.slots && doc.slots !== "none" && (
            <Slots slots={doc.slots} panelW={panelW} />
          )}

          {/* Each panel at its print offset, flipped if it prints inverted */}
          {doc.pages.map((page, i) => {
            const offsetTop = i * panelH;
            const inverted = page.inverted ?? foldInvertForPage(doc.fold, i);
            const stubs = page.tearaway
              ? Math.max(1, page.tearawayCount ?? 3)
              : 0;
            return (
              <Group key={page.id} x={0} y={offsetTop}>
                <Group
                  x={inverted ? panelW : 0}
                  y={inverted ? panelH : 0}
                  rotation={inverted ? 180 : 0}
                >
                  {page.fields.map(f => (
                    <StaticField key={f.id} field={f} data={data} />
                  ))}
                  {stubs > 1 &&
                    Array.from({ length: stubs - 1 }).map((_, k) => {
                      const y = (panelH * (k + 1)) / stubs;
                      return (
                        <Line
                          key={k}
                          points={[0, y, panelW, y]}
                          stroke="#94a3b8"
                          strokeWidth={1}
                          dash={[2, 3]}
                          listening={false}
                        />
                      );
                    })}
                </Group>
              </Group>
            );
          })}

          {/* Fold creases between panels */}
          {Array.from({ length: n - 1 }).map((_, i) => {
            const y = (i + 1) * panelH;
            return (
              <Line
                key={`crease-${i}`}
                points={[0, y, panelW, y]}
                stroke="#cbd5e1"
                strokeWidth={1}
                dash={[8, 4]}
                listening={false}
              />
            );
          })}
        </Layer>
      </Stage>
      <BadgeRulers
        visible={showRulers}
        scale={scale}
        position={position}
        stageSize={stageSize}
        ppi={DPI}
        unit={unit}
      />
    </div>
  );
}
