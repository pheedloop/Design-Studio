import type { WalkableGrid, FloorPlanElement, Geometry } from "@/types";
import { canvasToCellCoord } from "@/editor/utils/walkableGrid";

interface Cell {
  col: number;
  row: number;
}

/** Get the center point of any element geometry in canvas coordinates. */
export function getElementCenter(geometry: Geometry): { x: number; y: number } {
  switch (geometry.shape) {
    case "rect":
      return {
        x: geometry.x + geometry.width / 2,
        y: geometry.y + geometry.height / 2,
      };
    case "ellipse":
      return { x: geometry.x, y: geometry.y };
    case "circle":
      return { x: geometry.x, y: geometry.y };
    case "polygon": {
      const pts = geometry.points;
      const count = pts.length / 2;
      if (count === 0) return { x: geometry.x, y: geometry.y };
      let sx = 0,
        sy = 0;
      for (let i = 0; i < pts.length; i += 2) {
        sx += pts[i];
        sy += pts[i + 1];
      }
      return { x: geometry.x + sx / count, y: geometry.y + sy / count };
    }
    case "line":
    case "arrow":
      return {
        x: geometry.x + (geometry.points[0] + geometry.points[2]) / 2,
        y: geometry.y + (geometry.points[1] + geometry.points[3]) / 2,
      };
    case "arc":
      return {
        x: geometry.x + (geometry.points[0] + geometry.points[4]) / 2,
        y: geometry.y + (geometry.points[1] + geometry.points[5]) / 2,
      };
  }
}

/**
 * Find the nearest walkable cell to a canvas point using BFS spiral outward.
 * Returns null if no walkable cell is found within maxRadius cells.
 */
export function findNearestWalkableCell(
  grid: WalkableGrid,
  canvasX: number,
  canvasY: number,
  maxRadius: number = 50,
): Cell | null {
  const origin = canvasToCellCoord(canvasX, canvasY, grid.cellSize);

  // If the origin cell is walkable, return it directly
  if (
    origin.col >= 0 &&
    origin.row >= 0 &&
    origin.col < grid.cols &&
    origin.row < grid.rows &&
    grid.cells[origin.row][origin.col] === 1
  ) {
    return origin;
  }

  // BFS outward
  const visited = new Set<string>();
  const queue: Cell[] = [origin];
  visited.add(`${origin.col},${origin.row}`);

  while (queue.length > 0) {
    const cell = queue.shift()!;

    // Check distance from origin
    const dist = Math.max(
      Math.abs(cell.col - origin.col),
      Math.abs(cell.row - origin.row),
    );
    if (dist > maxRadius) continue;

    // Check if walkable
    if (
      cell.col >= 0 &&
      cell.row >= 0 &&
      cell.col < grid.cols &&
      cell.row < grid.rows &&
      grid.cells[cell.row][cell.col] === 1
    ) {
      return cell;
    }

    // Enqueue 8 neighbors
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (dc === 0 && dr === 0) continue;
        const nc = cell.col + dc;
        const nr = cell.row + dr;
        const key = `${nc},${nr}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ col: nc, row: nr });
        }
      }
    }
  }

  return null;
}

/** Resolve a booth element to its nearest walkable cell. */
export function resolveBoothToCell(
  grid: WalkableGrid,
  element: FloorPlanElement,
): Cell | null {
  const center = getElementCenter(element.geometry);
  return findNearestWalkableCell(grid, center.x, center.y);
}
