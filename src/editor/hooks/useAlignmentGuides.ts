import { useState, useCallback, useMemo } from "react";
import type { FloorPlanElement } from "../../types";
import { getElementBounds, type ElementBounds } from "../utils/bounds";

export interface GuideLine {
  axis: "x" | "y"; // x = vertical line, y = horizontal line
  position: number;
}

const SNAP_THRESHOLD = 5;

export function useAlignmentGuides(elements: FloorPlanElement[]) {
  const [activeGuides, setActiveGuides] = useState<GuideLine[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Precompute snap points for all elements
  const allSnapPoints = useMemo(() => {
    return elements.map(el => ({
      id: el.id,
      bounds: getElementBounds(el),
    }));
  }, [elements]);

  const startDrag = useCallback((id: string) => {
    setDraggedId(id);
  }, []);

  const endDrag = useCallback(() => {
    setDraggedId(null);
    setActiveGuides([]);
  }, []);

  const snapPosition = useCallback(
    (
      id: string,
      bounds: ElementBounds,
    ): { x: number; y: number; guides: GuideLine[] } => {
      const others = allSnapPoints.filter(sp => sp.id !== id);
      const guides: GuideLine[] = [];

      // The dragged element's 5 x-snap points (left, center, right)
      const dragXPoints = [
        { value: bounds.left, offset: 0 },
        { value: bounds.centerX, offset: bounds.centerX - bounds.left },
        { value: bounds.right, offset: bounds.right - bounds.left },
      ];

      // The dragged element's 5 y-snap points (top, center, bottom)
      const dragYPoints = [
        { value: bounds.top, offset: 0 },
        { value: bounds.centerY, offset: bounds.centerY - bounds.top },
        { value: bounds.bottom, offset: bounds.bottom - bounds.top },
      ];

      let snappedX: number | null = null;
      let snappedY: number | null = null;
      let bestDx = SNAP_THRESHOLD + 1;
      let bestDy = SNAP_THRESHOLD + 1;

      for (const other of others) {
        const targetXValues = [
          other.bounds.left,
          other.bounds.centerX,
          other.bounds.right,
        ];
        const targetYValues = [
          other.bounds.top,
          other.bounds.centerY,
          other.bounds.bottom,
        ];

        for (const dragPoint of dragXPoints) {
          for (const targetX of targetXValues) {
            const dx = Math.abs(dragPoint.value - targetX);
            if (dx < bestDx) {
              bestDx = dx;
              snappedX = targetX - dragPoint.offset;
              // Replace x guides with this one
              const newGuide: GuideLine = { axis: "x", position: targetX };
              // Remove old x guides and add new
              const filtered = guides.filter(g => g.axis !== "x");
              filtered.push(newGuide);
              guides.length = 0;
              guides.push(...filtered);
            }
          }
        }

        for (const dragPoint of dragYPoints) {
          for (const targetY of targetYValues) {
            const dy = Math.abs(dragPoint.value - targetY);
            if (dy < bestDy) {
              bestDy = dy;
              snappedY = targetY - dragPoint.offset;
              const newGuide: GuideLine = { axis: "y", position: targetY };
              const filtered = guides.filter(g => g.axis !== "y");
              filtered.push(newGuide);
              guides.length = 0;
              guides.push(...filtered);
            }
          }
        }
      }

      // Only keep guides that are within threshold
      if (bestDx > SNAP_THRESHOLD) {
        snappedX = null;
        const filtered = guides.filter(g => g.axis !== "x");
        guides.length = 0;
        guides.push(...filtered);
      }
      if (bestDy > SNAP_THRESHOLD) {
        snappedY = null;
        const filtered = guides.filter(g => g.axis !== "y");
        guides.length = 0;
        guides.push(...filtered);
      }

      setActiveGuides([...guides]);

      return {
        x: snappedX ?? bounds.left,
        y: snappedY ?? bounds.top,
        guides,
      };
    },
    [allSnapPoints],
  );

  return {
    activeGuides,
    draggedId,
    startDrag,
    endDrag,
    snapPosition,
  };
}
