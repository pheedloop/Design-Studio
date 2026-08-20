import { useRef, useCallback, useState } from "react";
import type Konva from "konva";
import type { WalkableGrid } from "../../types";
import type { PathingTool } from "../types";
import { canvasToCellCoord, bresenhamLine } from "../utils/walkableGrid";
import { getCanvasPoint } from "../utils/canvas";

interface UsePathingToolOptions {
  stageRef: React.RefObject<Konva.Stage | null>;
  position: { x: number; y: number };
  scale: number;
  grid: WalkableGrid | undefined;
  activePathingTool: PathingTool;
  onPaintStroke: (
    changes: Array<{ col: number; row: number; value: 0 | 1 }>,
  ) => void;
  onRectFill: (
    startCol: number,
    startRow: number,
    endCol: number,
    endRow: number,
    value: 0 | 1,
  ) => void;
}

export function usePathingTool({
  stageRef,
  position,
  scale,
  grid,
  activePathingTool,
  onPaintStroke,
  onRectFill,
}: UsePathingToolOptions) {
  const isPainting = useRef(false);
  const lastCell = useRef<{ col: number; row: number } | null>(null);
  const strokeChanges = useRef<
    Array<{ col: number; row: number; value: 0 | 1 }>
  >([]);
  const paintedCellsRef = useRef<Set<string>>(new Set());

  // Live preview of cells being painted during current stroke
  const [pendingCells, setPendingCells] = useState<Set<string>>(new Set());
  const [pendingValue, setPendingValue] = useState<0 | 1>(1);

  // Rect fill preview state
  const [rectPreview, setRectPreview] = useState<{
    startCol: number;
    startRow: number;
    endCol: number;
    endRow: number;
  } | null>(null);
  const rectStart = useRef<{ col: number; row: number } | null>(null);

  // Hover cell for visual feedback
  const [hoverCell, setHoverCell] = useState<{
    col: number;
    row: number;
  } | null>(null);

  const getCell = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !grid) return null;
    const point = getCanvasPoint(stage, position, scale);
    if (!point) return null;
    const cell = canvasToCellCoord(point.x, point.y, grid.cellSize);
    if (
      cell.col < 0 ||
      cell.col >= grid.cols ||
      cell.row < 0 ||
      cell.row >= grid.rows
    )
      return null;
    return cell;
  }, [stageRef, position, scale, grid]);

  const paintValue: 0 | 1 = activePathingTool === "paintWalkable" ? 1 : 0;

  const handleMouseDown = useCallback(() => {
    if (!grid) return;
    if (activePathingTool === "select") return;

    const cell = getCell();
    if (!cell) return;

    if (activePathingTool === "rectFill") {
      rectStart.current = cell;
      setRectPreview({
        startCol: cell.col,
        startRow: cell.row,
        endCol: cell.col,
        endRow: cell.row,
      });
      return;
    }

    // Paint tool — start stroke
    isPainting.current = true;
    lastCell.current = cell;
    strokeChanges.current = [];
    paintedCellsRef.current = new Set();

    const key = `${cell.col},${cell.row}`;
    paintedCellsRef.current.add(key);
    strokeChanges.current.push({
      col: cell.col,
      row: cell.row,
      value: paintValue,
    });

    // Update live preview
    setPendingValue(paintValue);
    setPendingCells(new Set(paintedCellsRef.current));
  }, [grid, activePathingTool, getCell, paintValue]);

  const handleMouseMove = useCallback(() => {
    if (!grid) return;

    const cell = getCell();

    // Update hover cell
    setHoverCell(cell);

    if (activePathingTool === "rectFill" && rectStart.current && cell) {
      setRectPreview({
        startCol: rectStart.current.col,
        startRow: rectStart.current.row,
        endCol: cell.col,
        endRow: cell.row,
      });
      return;
    }

    if (!isPainting.current || !cell || activePathingTool === "select") return;

    const prev = lastCell.current;
    if (!prev) {
      lastCell.current = cell;
      return;
    }

    // Bresenham between last and current to avoid skipping cells
    let changed = false;
    const line = bresenhamLine(prev.col, prev.row, cell.col, cell.row);
    for (const { col, row } of line) {
      const key = `${col},${row}`;
      if (!paintedCellsRef.current.has(key)) {
        paintedCellsRef.current.add(key);
        strokeChanges.current.push({ col, row, value: paintValue });
        changed = true;
      }
    }

    lastCell.current = cell;

    // Update live preview only if new cells were added
    if (changed) {
      setPendingCells(new Set(paintedCellsRef.current));
    }
  }, [grid, activePathingTool, getCell, paintValue]);

  const handleMouseUp = useCallback(() => {
    if (activePathingTool === "rectFill" && rectStart.current && rectPreview) {
      onRectFill(
        rectPreview.startCol,
        rectPreview.startRow,
        rectPreview.endCol,
        rectPreview.endRow,
        1,
      );
      rectStart.current = null;
      setRectPreview(null);
      return;
    }

    if (isPainting.current && strokeChanges.current.length > 0) {
      onPaintStroke(strokeChanges.current);
    }
    isPainting.current = false;
    lastCell.current = null;
    strokeChanges.current = [];
    paintedCellsRef.current = new Set();
    setPendingCells(new Set());
  }, [activePathingTool, rectPreview, onPaintStroke, onRectFill]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    hoverCell,
    rectPreview,
    pendingCells,
    pendingValue,
  };
}
