import { Shape } from "react-konva";
import type { Context } from "konva/lib/Context";
import type { WalkableGrid } from "@/types";

interface WalkableGridOverlayProps {
  grid: WalkableGrid;
  showGridLines: boolean;
  opacity: number;
  hoverCell?: { col: number; row: number } | null;
  /** Cells being painted in the current stroke (live preview before commit) */
  pendingCells?: Set<string>;
  /** Value being painted: 1 = walkable (green), 0 = impassable (erase) */
  pendingValue?: 0 | 1;
}

export function WalkableGridOverlay({
  grid,
  showGridLines,
  opacity,
  hoverCell,
  pendingCells,
  pendingValue = 1,
}: WalkableGridOverlayProps) {
  const { cellSize, cols, rows, cells } = grid;
  const hasPending = pendingCells && pendingCells.size > 0;

  return (
    <Shape
      sceneFunc={(ctx: Context) => {
        const context = ctx._context;

        // Batch-draw all walkable cells as green
        context.fillStyle = `rgba(34, 197, 94, ${opacity})`;
        context.beginPath();
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const key = `${col},${row}`;
            const committed = cells[row][col] === 1;

            // Determine effective state: pending changes override committed
            let isWalkable: boolean;
            if (hasPending && pendingCells.has(key)) {
              isWalkable = pendingValue === 1;
            } else {
              isWalkable = committed;
            }

            if (isWalkable) {
              context.rect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
          }
        }
        context.fill();

        // Hover highlight
        if (
          hoverCell &&
          hoverCell.col >= 0 &&
          hoverCell.col < cols &&
          hoverCell.row >= 0 &&
          hoverCell.row < rows
        ) {
          context.fillStyle = "rgba(255, 255, 255, 0.4)";
          context.fillRect(
            hoverCell.col * cellSize,
            hoverCell.row * cellSize,
            cellSize,
            cellSize,
          );
        }

        // Grid lines (only when explicitly requested)
        if (showGridLines) {
          context.strokeStyle = "rgba(156, 163, 175, 0.3)";
          context.lineWidth = 0.5;
          context.beginPath();
          const totalWidth = cols * cellSize;
          const totalHeight = rows * cellSize;
          for (let col = 0; col <= cols; col++) {
            const x = col * cellSize;
            context.moveTo(x, 0);
            context.lineTo(x, totalHeight);
          }
          for (let row = 0; row <= rows; row++) {
            const y = row * cellSize;
            context.moveTo(0, y);
            context.lineTo(totalWidth, y);
          }
          context.stroke();
        }
      }}
      listening={false}
    />
  );
}
