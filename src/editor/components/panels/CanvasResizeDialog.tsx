import { useState, useMemo } from "react";
import { Button, Dialog, SectionLabel, NumberInput } from "../ui";
import type { FloorPlanElement, Dimensions } from "../../../types";
import { formatMeasurement } from "../../../utils/unitConversion";
import { getElementBounds } from "../../utils/bounds";
import { anchorOffset, type ResizeMode, type ResizeAnchor } from "../../hooks/useEditorState";

interface CanvasResizeDialogProps {
  width: number;
  height: number;
  dimensions: Dimensions;
  elements: FloorPlanElement[];
  onConfirm: (width: number, height: number, mode: ResizeMode, anchor: ResizeAnchor) => void;
  /** Closes the dialog and enters interactive crop mode on the canvas. */
  onStartCrop?: () => void;
  onClose: () => void;
}

// 3×3 anchor grid, laid out visually (row-major, top→bottom).
const ANCHOR_GRID: ResizeAnchor[] = [
  "top-left", "top", "top-right",
  "left", "center", "right",
  "bottom-left", "bottom", "bottom-right",
];

export function CanvasResizeDialog({
  width,
  height,
  dimensions,
  elements,
  onConfirm,
  onStartCrop,
  onClose,
}: CanvasResizeDialogProps) {
  const [newWidth, setNewWidth] = useState(width);
  const [newHeight, setNewHeight] = useState(height);
  const [mode, setMode] = useState<ResizeMode>("preserve");
  const [anchor, setAnchor] = useState<ResizeAnchor>("top-left");

  const aspect = width / height;

  // Scale mode is aspect-locked: editing one dimension derives the other, so a
  // DXF/image background never distorts and there's a single valid scale.
  const setW = (v: number) => {
    const w = Math.max(100, v);
    setNewWidth(w);
    if (mode === "scale") setNewHeight(Math.max(100, Math.round(w / aspect)));
  };
  const setH = (v: number) => {
    const h = Math.max(100, v);
    setNewHeight(h);
    if (mode === "scale") setNewWidth(Math.max(100, Math.round(h * aspect)));
  };

  const selectMode = (m: ResizeMode) => {
    setMode(m);
    if (m === "scale") setNewHeight(Math.max(100, Math.round(newWidth / aspect)));
  };

  // Count elements pushed outside the new bounds after the anchor shift (advisory).
  const clippedCount = useMemo(() => {
    if (mode === "scale") return 0;
    const { dx, dy } = anchorOffset(anchor, newWidth - width, newHeight - height);
    if (dx === 0 && dy === 0 && newWidth >= width && newHeight >= height) return 0;
    return elements.filter((el) => {
      const b = getElementBounds(el);
      return b.left + dx < 0 || b.top + dy < 0 || b.right + dx > newWidth || b.bottom + dy > newHeight;
    }).length;
  }, [elements, newWidth, newHeight, width, height, mode, anchor]);

  return (
    <Dialog
      title="Canvas Size"
      width="420px"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" color="neutral" onClick={onClose}>Cancel</Button>
          <Button variant="solid" color="primary" onClick={() => { onConfirm(newWidth, newHeight, mode, anchor); onClose(); }}>Apply</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1.5">
          <SectionLabel>Width (px)</SectionLabel>
          <NumberInput value={newWidth} onChange={setW} />
          {dimensions.unit !== "px" && (
            <span className="text-[11px] text-gray-400">{formatMeasurement(newWidth, dimensions)}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <SectionLabel>Height (px)</SectionLabel>
          <NumberInput value={newHeight} onChange={setH} disabled={mode === "scale"} />
          {dimensions.unit !== "px" && (
            <span className="text-[11px] text-gray-400">{formatMeasurement(newHeight, dimensions)}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <SectionLabel>Content</SectionLabel>
          <div className="flex gap-2">
            <Button variant="outline" color="neutral" active={mode === "preserve"} className="flex-1" onClick={() => selectMode("preserve")}>Keep size</Button>
            <Button variant="outline" color="neutral" active={mode === "scale"} className="flex-1" onClick={() => selectMode("scale")}>Scale to fit</Button>
          </div>
          <span className="text-[11px] text-gray-400">
            {mode === "scale"
              ? "Everything (background, elements, scale) resizes together — aspect locked so a floor plan stays true to size."
              : "Everything keeps its current size; the canvas grows or shrinks around it."}
          </span>
        </div>

        {mode === "preserve" && (
          <div className="flex flex-col gap-2">
            <SectionLabel>Resize from</SectionLabel>
            <div className="grid grid-cols-3 gap-1 w-max">
              {ANCHOR_GRID.map((a) => {
                const selected = anchor === a;
                return (
                  <button
                    key={a}
                    type="button"
                    aria-label={a}
                    title={a}
                    onClick={() => setAnchor(a)}
                    className={`flex h-8 w-8 items-center justify-center rounded border transition-colors ${
                      selected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${selected ? "bg-blue-500" : "bg-gray-300"}`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-gray-400 leading-relaxed">
              Where existing content stays. New space is added on the opposite
              side — e.g. pick <strong>bottom-right</strong> to add margin on the
              top-left, or <strong>center</strong> for even margins all around.
            </span>
          </div>
        )}

        {onStartCrop && (
          <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-4">
            <SectionLabel>Or crop visually</SectionLabel>
            <Button
              variant="outline"
              color="neutral"
              onClick={() => {
                onClose();
                onStartCrop();
              }}
            >
              Crop / resize on canvas…
            </Button>
            <span className="text-[11px] text-gray-400">
              Draw a box to keep — the canvas resizes to it and all content stays aligned.
            </span>
          </div>
        )}

        {clippedCount > 0 && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
            {clippedCount} element{clippedCount > 1 ? "s" : ""} will be outside the new canvas bounds.
          </p>
        )}
      </div>
    </Dialog>
  );
}
