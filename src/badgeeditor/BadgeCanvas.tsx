import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Line, Transformer } from "react-konva";
import type Konva from "konva";
import { BLACK, BRAND, GRAY_300, GRAY_400, WHITE } from "@/canvasColors";
import type { BadgeField, BadgePage, SlotType } from "./model";
import { GridLayer } from "@/editor/components/canvas/GridLayer";
import { PANEL_CORNER_IN, PPI } from "./canvasMetrics";
import { fieldSizePx, useBadgeGuides } from "./useBadgeGuides";
import type { BadgeData } from "./badgeData";
import { FieldShape } from "./FieldShape";
import { Slots } from "./Slots";
import { FoldIndicators } from "./FoldIndicators";

interface BadgeCanvasProps {
  page: BadgePage;
  panelSize: { width: number; height: number };
  /** Resolved attendee data to render, or null for placeholders. */
  data: BadgeData | null;
  /** Lanyard slot style, drawn near the top of the front panel only. */
  slots: SlotType;
  isFrontPage: boolean;
  /** Fold edges connecting to adjacent panels (multi-page badges). */
  foldTop: boolean;
  foldBottom: boolean;
  /** Draw a reference grid over the panel. */
  showGrid: boolean;
  /** Snap dragged fields to grid increments. */
  snapToGrid: boolean;
  /** Grid spacing in canvas px (inch spacing × PPI). */
  gridSpacingPx: number;
  selectedIds: Set<string>;
  /** mousedown on a field — additive = shift held. */
  onFieldMouseDown: (id: string, additive: boolean) => void;
  onClearSelection: () => void;
  /** marquee finished — select these ids (additive = shift held). */
  onMarqueeSelect: (ids: string[], additive: boolean) => void;
  onChangeField: (id: string, patch: Partial<BadgeField>) => void;
  /** commit a (possibly multi-field) move in one history entry. */
  onMoveMany: (updates: { id: string; top: number; left: number }[]) => void;
  // From useCanvasControls
  scale: number;
  position: { x: number; y: number };
  stageSize: { width: number; height: number };
  stageRef: React.RefObject<Konva.Stage | null>;
  onWheel: (e: Konva.KonvaEventObject<WheelEvent>) => void;
  onPositionChange: (pos: { x: number; y: number }) => void;
}

export function BadgeCanvas({
  page,
  panelSize,
  data,
  slots,
  isFrontPage,
  foldTop,
  foldBottom,
  showGrid,
  snapToGrid,
  gridSpacingPx,
  selectedIds,
  onFieldMouseDown,
  onClearSelection,
  onMarqueeSelect,
  onChangeField,
  onMoveMany,
  scale,
  position,
  stageSize,
  stageRef,
  onWheel,
  onPositionChange,
}: BadgeCanvasProps) {
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef(new Map<string, Konva.Group>());
  const { activeGuides, snap, clear } = useBadgeGuides(page.fields, panelSize);

  // Hold Space to pan (matches the map editor). While held, the stage drags and
  // fields are inert.
  const [spaceHeld, setSpaceHeld] = useState(false);
  useEffect(() => {
    const isForm = (t: EventTarget | null) =>
      t instanceof HTMLInputElement ||
      t instanceof HTMLTextAreaElement ||
      t instanceof HTMLSelectElement;
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isForm(e.target)) {
        e.preventDefault();
        setSpaceHeld(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceHeld(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  const panMode = spaceHeld;

  // Reflect pan mode on the cursor.
  useEffect(() => {
    const c = stageRef.current?.container();
    if (c) c.style.cursor = panMode ? "grab" : "default";
  }, [panMode, stageRef]);

  // Marquee + middle-mouse pan state.
  const marqueeOrigin = useRef<{ x: number; y: number } | null>(null);
  const [marquee, setMarquee] = useState<
    (Konva.Vector2d & { w: number; h: number }) | null
  >(null);
  const middlePan = useRef<{
    cx: number;
    cy: number;
    sx: number;
    sy: number;
  } | null>(null);
  // Start positions captured at drag start (for multi-move).
  const dragStarts = useRef(new Map<string, { x: number; y: number }>());

  const singleSelectedId = selectedIds.size === 1 ? [...selectedIds][0] : null;

  // Transformer attaches only for a single selection (group resize is disabled).
  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    const node = singleSelectedId
      ? nodeRefs.current.get(singleSelectedId)
      : null;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [singleSelectedId, page.fields]);

  const panelW = panelSize.width * PPI;
  const panelH = panelSize.height * PPI;

  const isQr =
    page.fields.find(f => f.id === singleSelectedId)?.kind === "qrCode";
  const enabledAnchors = isQr
    ? ["top-left", "top-right", "bottom-left", "bottom-right"]
    : ["middle-left", "middle-right", "top-center", "bottom-center"];

  const localPoint = () => {
    const stage = stageRef.current;
    if (!stage) return null;
    const p = stage.getPointerPosition();
    if (!p) return null;
    return { x: (p.x - position.x) / scale, y: (p.y - position.y) / scale };
  };

  const isEmpty = (e: Konva.KonvaEventObject<MouseEvent>) =>
    e.target === e.target.getStage() || e.target.name() === "panel";

  // --- Stage-level mouse (marquee + middle-pan) ---

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === 1) {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;
      middlePan.current = {
        cx: e.evt.clientX,
        cy: e.evt.clientY,
        sx: stage.x(),
        sy: stage.y(),
      };
      return;
    }
    if (panMode) return; // stage handles the drag-pan natively
    if (e.evt.button !== 0) return;
    if (isEmpty(e)) {
      if (!e.evt.shiftKey) onClearSelection();
      const p = localPoint();
      if (p) {
        marqueeOrigin.current = p;
        setMarquee({ x: p.x, y: p.y, w: 0, h: 0 });
      }
    }
  };

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (middlePan.current) {
      const stage = stageRef.current;
      if (!stage) return;
      const { cx, cy, sx, sy } = middlePan.current;
      stage.position({
        x: sx + (e.evt.clientX - cx),
        y: sy + (e.evt.clientY - cy),
      });
      return;
    }
    if (marqueeOrigin.current) {
      const p = localPoint();
      if (!p) return;
      const o = marqueeOrigin.current;
      setMarquee({
        x: Math.min(o.x, p.x),
        y: Math.min(o.y, p.y),
        w: Math.abs(p.x - o.x),
        h: Math.abs(p.y - o.y),
      });
    }
  };

  const handleStageMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (middlePan.current) {
      const stage = stageRef.current;
      if (stage) onPositionChange(stage.position());
      middlePan.current = null;
      return;
    }
    if (marqueeOrigin.current && marquee) {
      const r = marquee;
      const hit = page.fields.filter(f => {
        const { w, h } = fieldSizePx(f);
        const fl = f.left * PPI;
        const ft = f.top * PPI;
        return fl < r.x + r.w && fl + w > r.x && ft < r.y + r.h && ft + h > r.y;
      });
      // Treat a click (no real drag) as "no marquee selection".
      if (r.w > 2 || r.h > 2)
        onMarqueeSelect(
          hit.map(f => f.id),
          e.evt.shiftKey,
        );
    }
    marqueeOrigin.current = null;
    setMarquee(null);
  };

  // --- Field drag (single snap or multi move) ---

  const handleFieldDragStart = (id: string) => {
    const ids = selectedIds.has(id) ? [...selectedIds] : [id];
    dragStarts.current.clear();
    for (const fid of ids) {
      const n = nodeRefs.current.get(fid);
      if (n) dragStarts.current.set(fid, { x: n.x(), y: n.y() });
    }
  };

  const snapToGridPx = (v: number) =>
    snapToGrid && gridSpacingPx > 0
      ? Math.round(v / gridSpacingPx) * gridSpacingPx
      : v;

  const handleFieldDragMove = (id: string, node: Konva.Node) => {
    if (dragStarts.current.size <= 1) {
      const field = page.fields.find(f => f.id === id);
      if (!field) return;
      const { w, h } = fieldSizePx(field);
      // Grid snap first; alignment guides then refine when near other fields.
      const { x, y } = snap(
        id,
        snapToGridPx(node.x()),
        snapToGridPx(node.y()),
        w,
        h,
      );
      node.x(x);
      node.y(y);
      return;
    }
    // Multi-move: snap the lead node to grid, then shift the rest by that delta.
    const start = dragStarts.current.get(id);
    if (!start) return;
    const nx = snapToGridPx(node.x());
    const ny = snapToGridPx(node.y());
    node.x(nx);
    node.y(ny);
    const dx = nx - start.x;
    const dy = ny - start.y;
    dragStarts.current.forEach((s, fid) => {
      if (fid === id) return;
      const n = nodeRefs.current.get(fid);
      if (n) {
        n.x(s.x + dx);
        n.y(s.y + dy);
      }
    });
  };

  const handleFieldDragEnd = () => {
    const updates: { id: string; top: number; left: number }[] = [];
    dragStarts.current.forEach((_, fid) => {
      const n = nodeRefs.current.get(fid);
      if (n) updates.push({ id: fid, left: n.x() / PPI, top: n.y() / PPI });
    });
    if (updates.length) onMoveMany(updates);
    dragStarts.current.clear();
    clear();
  };

  // Union bounds for a multi-selection outline.
  const multiBounds =
    selectedIds.size > 1
      ? (() => {
          let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
          for (const f of page.fields) {
            if (!selectedIds.has(f.id)) continue;
            const { w, h } = fieldSizePx(f);
            minX = Math.min(minX, f.left * PPI);
            minY = Math.min(minY, f.top * PPI);
            maxX = Math.max(maxX, f.left * PPI + w);
            maxY = Math.max(maxY, f.top * PPI + h);
          }
          return minX === Infinity
            ? null
            : { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
        })()
      : null;

  return (
    <Stage
      ref={stageRef}
      width={stageSize.width}
      height={stageSize.height}
      scaleX={scale}
      scaleY={scale}
      x={position.x}
      y={position.y}
      draggable={panMode}
      onWheel={onWheel}
      onMouseDown={handleStageMouseDown}
      onMouseMove={handleStageMouseMove}
      onMouseUp={handleStageMouseUp}
      onDragEnd={e => {
        if (e.target === stageRef.current)
          onPositionChange(stageRef.current.position());
      }}
    >
      <Layer>
        {/* Card */}
        <Rect
          name="panel"
          x={0}
          y={0}
          width={panelW}
          height={panelH}
          cornerRadius={PANEL_CORNER_IN * PPI}
          fill={WHITE}
          stroke={GRAY_300}
          strokeWidth={1}
          shadowColor={BLACK}
          shadowOpacity={0.12}
          shadowBlur={12}
          shadowOffsetY={2}
        />

        {/* Reference grid (editor-only) */}
        {showGrid && gridSpacingPx > 0 && (
          <GridLayer
            width={panelW}
            height={panelH}
            spacing={gridSpacingPx}
            color={GRAY_400}
            opacity={0.35}
          />
        )}

        {/* Lanyard slots — front panel only (static; editor-only) */}
        {isFrontPage && slots !== "none" && (
          <Slots slots={slots} panelW={panelW} />
        )}

        {/* Tear-away perforation lines (static; editor-only) */}
        {page.tearaway &&
          (() => {
            const stubs = Math.max(1, page.tearawayCount ?? 3);
            return Array.from({ length: stubs - 1 }).map((_, i) => {
              const y = (panelH * (i + 1)) / stubs;
              return (
                <Line
                  key={`tear-${i}`}
                  points={[0, y, panelW, y]}
                  stroke={GRAY_400}
                  strokeWidth={1}
                  dash={[2, 3]}
                  listening={false}
                />
              );
            });
          })()}

        {page.fields.map(field => (
          <FieldShape
            key={field.id}
            field={field}
            data={data}
            panMode={panMode}
            registerRef={node => {
              if (node) nodeRefs.current.set(field.id, node);
              else nodeRefs.current.delete(field.id);
            }}
            onMouseDown={additive => onFieldMouseDown(field.id, additive)}
            onChange={patch => onChangeField(field.id, patch)}
            onDragStart={() => handleFieldDragStart(field.id)}
            onDragMove={node => handleFieldDragMove(field.id, node)}
            onDragFinish={handleFieldDragEnd}
          />
        ))}

        {/* Multi-selection outline */}
        {multiBounds && (
          <Rect
            x={multiBounds.x - 4}
            y={multiBounds.y - 4}
            width={multiBounds.w + 8}
            height={multiBounds.h + 8}
            stroke={BRAND}
            strokeWidth={1}
            dash={[6, 3]}
            listening={false}
          />
        )}

        {/* Alignment guides */}
        {activeGuides.map((g, i) =>
          g.axis === "x" ? (
            <Line
              key={`gx-${i}`}
              points={[g.position, 0, g.position, panelH]}
              stroke="#ec4899"
              strokeWidth={1}
              dash={[4, 4]}
              listening={false}
            />
          ) : (
            <Line
              key={`gy-${i}`}
              points={[0, g.position, panelW, g.position]}
              stroke="#ec4899"
              strokeWidth={1}
              dash={[4, 4]}
              listening={false}
            />
          ),
        )}

        {/* Marquee */}
        {marquee && (marquee.w > 0 || marquee.h > 0) && (
          <Rect
            x={marquee.x}
            y={marquee.y}
            width={marquee.w}
            height={marquee.h}
            fill="rgba(0, 123, 255, 0.08)"
            stroke={BRAND}
            strokeWidth={1}
            dash={[4, 4]}
            listening={false}
          />
        )}

        {/* Fold indicators (section-plane style) on edges that connect panels */}
        {(foldTop || foldBottom) && (
          <FoldIndicators
            foldTop={foldTop}
            foldBottom={foldBottom}
            panelW={panelW}
            panelH={panelH}
          />
        )}

        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          keepRatio={isQr}
          enabledAnchors={enabledAnchors}
          ignoreStroke
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 8 || newBox.height < 8 ? oldBox : newBox
          }
        />
      </Layer>
    </Stage>
  );
}
