import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import type Konva from "konva";

const MIN_SCALE = 0.1;
const MAX_SCALE = 5;
const ZOOM_STEP = 1.08;

export function useCanvasControls(containerRef: React.RefObject<HTMLDivElement | null>) {
  const stageRef = useRef<Konva.Stage>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const lastPinch = useRef<{
    distance: number;
    center: { x: number; y: number };
  } | null>(null);
  // True once the container has been measured at least once — lets callers run a
  // one-time "fit to content" against the real viewport rather than the default.
  const [hasMeasured, setHasMeasured] = useState(false);

  // Synchronous initial measurement so the very first paint already uses the
  // real viewport size. Without this the first frame renders at the default
  // size/scale and the one-time fit only kicks in after the async ResizeObserver
  // fires — producing a visible zoom/pan "flash".
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      setStageSize({ width: r.width, height: r.height });
      setHasMeasured(true);
    }
  }, [containerRef]);

  // Responsive sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setStageSize({ width, height });
        setHasMeasured(true);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);

  /**
   * Center the given content box in the viewport, scaling it down to fit (with
   * padding) when it's larger than the stage. `maxScale` caps zoom-in so small
   * content isn't blown up past its natural size.
   */
  const fitToBounds = useCallback(
    (
      bounds: { x?: number; y?: number; width: number; height: number },
      opts?: { padding?: number; maxScale?: number },
    ) => {
      if (bounds.width <= 0 || bounds.height <= 0) return;
      const padding = opts?.padding ?? 40;
      const maxScale = opts?.maxScale ?? 1;
      const x0 = bounds.x ?? 0;
      const y0 = bounds.y ?? 0;
      const fitScale = Math.min(
        (stageSize.width - padding * 2) / bounds.width,
        (stageSize.height - padding * 2) / bounds.height,
        maxScale,
      );
      const clamped = Math.min(Math.max(fitScale, MIN_SCALE), MAX_SCALE);
      setScale(clamped);
      setPosition({
        x: stageSize.width / 2 - (x0 + bounds.width / 2) * clamped,
        y: stageSize.height / 2 - (y0 + bounds.height / 2) * clamped,
      });
    },
    [stageSize],
  );

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const oldScale = scale;
      const newScale =
        e.evt.deltaY < 0 ? oldScale * ZOOM_STEP : oldScale / ZOOM_STEP;
      const clamped = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);

      const mousePointTo = {
        x: (pointer.x - position.x) / oldScale,
        y: (pointer.y - position.y) / oldScale,
      };

      setScale(clamped);
      setPosition({
        x: pointer.x - mousePointTo.x * clamped,
        y: pointer.y - mousePointTo.y * clamped,
      });
    },
    [scale, position]
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (e.target === stageRef.current) {
        setPosition({ x: e.target.x(), y: e.target.y() });
      }
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      const [touch1, touch2] = e.evt.touches;
      if (!touch1 || !touch2) return;

      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      // Konva's own drag would fight the pinch and pan the stage as well.
      if (stage.isDragging()) stage.stopDrag();

      const box = stage.container().getBoundingClientRect();
      const p1 = { x: touch1.clientX - box.left, y: touch1.clientY - box.top };
      const p2 = { x: touch2.clientX - box.left, y: touch2.clientY - box.top };
      const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);

      if (!lastPinch.current) {
        lastPinch.current = { distance, center };
        return;
      }

      const clamped = Math.min(
        Math.max((scale * distance) / lastPinch.current.distance, MIN_SCALE),
        MAX_SCALE,
      );

      const centerPointTo = {
        x: (center.x - position.x) / scale,
        y: (center.y - position.y) / scale,
      };

      setScale(clamped);
      setPosition({
        x: center.x - centerPointTo.x * clamped,
        y: center.y - centerPointTo.y * clamped,
      });

      lastPinch.current = { distance, center };
    },
    [scale, position],
  );

  const handleTouchEnd = useCallback(() => {
    lastPinch.current = null;
  }, []);

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(s * 1.2, MAX_SCALE));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(s / 1.2, MIN_SCALE));
  }, []);

  const zoomReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  return {
    stageRef,
    scale,
    setScale,
    position,
    setPosition,
    stageSize,
    hasMeasured,
    fitToBounds,
    handleWheel,
    handleDragEnd,
    handleTouchMove,
    handleTouchEnd,
    zoomIn,
    zoomOut,
    zoomReset,
  };
}
