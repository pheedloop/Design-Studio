import type { WalkableGrid } from "../../types";

interface Cell {
  col: number;
  row: number;
}

// --- A* pathfinding on walkable grid ---

const SQRT2 = Math.SQRT2;

/** 8-directional neighbors: [dcol, drow, cost] */
const DIRECTIONS: [number, number, number][] = [
  [0, -1, 1], // up
  [1, 0, 1], // right
  [0, 1, 1], // down
  [-1, 0, 1], // left
  [1, -1, SQRT2], // up-right
  [1, 1, SQRT2], // down-right
  [-1, 1, SQRT2], // down-left
  [-1, -1, SQRT2], // up-left
];

function heuristic(a: Cell, b: Cell): number {
  // Octile distance — consistent with 8-directional movement costs
  const dx = Math.abs(a.col - b.col);
  const dy = Math.abs(a.row - b.row);
  return dx + dy + (SQRT2 - 2) * Math.min(dx, dy);
}

function isWalkable(grid: WalkableGrid, col: number, row: number): boolean {
  return (
    col >= 0 &&
    row >= 0 &&
    col < grid.cols &&
    row < grid.rows &&
    grid.cells[row][col] === 1
  );
}

/**
 * A* pathfinding on a walkable grid with 8-directional movement.
 *
 * Diagonal movement is only allowed when both adjacent orthogonal cells
 * are walkable (no corner-cutting through walls).
 *
 * Returns the shortest path as grid cells, or null if unreachable.
 */
export function findPath(
  grid: WalkableGrid,
  start: Cell,
  end: Cell,
): Cell[] | null {
  if (!isWalkable(grid, start.col, start.row)) return null;
  if (!isWalkable(grid, end.col, end.row)) return null;
  if (start.col === end.col && start.row === end.row) return [start];

  // Simple binary heap for the open set (min-heap by fScore)
  const openSet: { cell: Cell; g: number; f: number }[] = [];
  const gScore = new Map<string, number>();
  const cameFrom = new Map<string, string>();

  const key = (c: Cell) => `${c.col},${c.row}`;
  const startKey = key(start);

  gScore.set(startKey, 0);
  openSet.push({ cell: start, g: 0, f: heuristic(start, end) });

  while (openSet.length > 0) {
    // Find lowest f-score (for grids this size, linear scan is fast enough)
    let bestIdx = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[bestIdx].f) bestIdx = i;
    }
    const current = openSet[bestIdx];
    openSet[bestIdx] = openSet[openSet.length - 1];
    openSet.pop();

    const currentKey = key(current.cell);

    // Skip stale entries
    const bestG = gScore.get(currentKey);
    if (bestG !== undefined && current.g > bestG) continue;

    // Reached the goal — reconstruct path
    if (current.cell.col === end.col && current.cell.row === end.row) {
      const path: Cell[] = [];
      let k: string | undefined = currentKey;
      while (k !== undefined) {
        const [c, r] = k.split(",").map(Number);
        path.push({ col: c, row: r });
        k = cameFrom.get(k);
      }
      path.reverse();
      return path;
    }

    for (const [dc, dr, cost] of DIRECTIONS) {
      const nc = current.cell.col + dc;
      const nr = current.cell.row + dr;

      if (!isWalkable(grid, nc, nr)) continue;

      // Diagonal: require both orthogonal neighbors to be walkable (no corner-cutting)
      if (dc !== 0 && dr !== 0) {
        if (
          !isWalkable(grid, current.cell.col + dc, current.cell.row) ||
          !isWalkable(grid, current.cell.col, current.cell.row + dr)
        ) {
          continue;
        }
      }

      const tentativeG = current.g + cost;
      const neighborKey = key({ col: nc, row: nr });
      const existingG = gScore.get(neighborKey);

      if (existingG === undefined || tentativeG < existingG) {
        gScore.set(neighborKey, tentativeG);
        cameFrom.set(neighborKey, currentKey);
        openSet.push({
          cell: { col: nc, row: nr },
          g: tentativeG,
          f: tentativeG + heuristic({ col: nc, row: nr }, end),
        });
      }
    }
  }

  return null; // No path found
}

// --- Path smoothing (string-pulling) ---

/**
 * Check if there is a clear walkable line-of-sight between two cells.
 * Uses Bresenham's line to check every cell along the line.
 */
function hasLineOfSight(grid: WalkableGrid, a: Cell, b: Cell): boolean {
  let x0 = a.col,
    y0 = a.row;
  const x1 = b.col,
    y1 = b.row;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    if (!isWalkable(grid, x0, y0)) return false;
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
  return true;
}

/**
 * Smooth a raw A* cell path using string-pulling.
 *
 * Walks through the path and skips intermediate points when there's a
 * clear walkable line-of-sight between non-adjacent points.
 *
 * Returns canvas-space {x, y} points (cell center coordinates).
 */
export function smoothPath(
  grid: WalkableGrid,
  path: Cell[],
): { x: number; y: number }[] {
  if (path.length <= 2) {
    return path.map(c => cellToCanvas(c, grid.cellSize));
  }

  const smoothed: Cell[] = [path[0]];
  let current = 0;

  while (current < path.length - 1) {
    // Look as far ahead as possible while maintaining line-of-sight
    let farthest = current + 1;
    for (let i = path.length - 1; i > current + 1; i--) {
      if (hasLineOfSight(grid, path[current], path[i])) {
        farthest = i;
        break;
      }
    }
    smoothed.push(path[farthest]);
    current = farthest;
  }

  return smoothed.map(c => cellToCanvas(c, grid.cellSize));
}

/** Convert a grid cell to its canvas center point. */
function cellToCanvas(cell: Cell, cellSize: number): { x: number; y: number } {
  return {
    x: cell.col * cellSize + cellSize / 2,
    y: cell.row * cellSize + cellSize / 2,
  };
}
