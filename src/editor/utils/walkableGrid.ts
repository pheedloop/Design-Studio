import type { WalkableGrid } from "@/types";

const DEFAULT_CELL_SIZE = 20;

/** Create an empty walkable grid (all cells impassable). */
export function createWalkableGrid(
  canvasWidth: number,
  canvasHeight: number,
  cellSize: number = DEFAULT_CELL_SIZE,
): WalkableGrid {
  const cols = Math.ceil(canvasWidth / cellSize);
  const rows = Math.ceil(canvasHeight / cellSize);
  const cells = Array.from({ length: rows }, () => new Array(cols).fill(0));
  return { enabled: true, cellSize, cols, rows, cells };
}

/** Resize an existing grid to fit new canvas dimensions. Expands with 0s or truncates. */
export function resizeWalkableGrid(
  grid: WalkableGrid,
  canvasWidth: number,
  canvasHeight: number,
): WalkableGrid {
  const newCols = Math.ceil(canvasWidth / grid.cellSize);
  const newRows = Math.ceil(canvasHeight / grid.cellSize);

  if (newCols === grid.cols && newRows === grid.rows) return grid;

  const cells = Array.from({ length: newRows }, (_, row) =>
    Array.from({ length: newCols }, (_, col) =>
      row < grid.rows && col < grid.cols ? grid.cells[row][col] : 0,
    ),
  );

  return { ...grid, cols: newCols, rows: newRows, cells };
}

/** Convert canvas pixel coordinates to grid cell coordinates. */
export function canvasToCellCoord(
  x: number,
  y: number,
  cellSize: number,
): { col: number; row: number } {
  return {
    col: Math.floor(x / cellSize),
    row: Math.floor(y / cellSize),
  };
}

/** Convert grid cell coordinates to canvas pixel coordinates (top-left of cell). */
export function cellToCanvasCoord(
  col: number,
  row: number,
  cellSize: number,
): { x: number; y: number } {
  return {
    x: col * cellSize,
    y: row * cellSize,
  };
}

/** Bresenham's line algorithm — returns all cells between two grid positions (inclusive). */
export function bresenhamLine(
  col0: number,
  row0: number,
  col1: number,
  row1: number,
): Array<{ col: number; row: number }> {
  const cells: Array<{ col: number; row: number }> = [];
  let x0 = col0,
    y0 = row0;
  const x1 = col1,
    y1 = row1;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    cells.push({ col: x0, row: y0 });
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
  return cells;
}
