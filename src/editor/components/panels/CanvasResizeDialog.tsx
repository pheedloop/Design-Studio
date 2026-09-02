import { useState, useMemo } from "react";
import { Button } from "@/components/Button";
import { Dialog, SectionLabel, NumberInput } from "@/editor/components/ui";
import type { FloorPlanElement, Dimensions } from "@/types";
import { formatMeasurement } from "@/utils/unitConversion";
import { useLocale, useT, type StringKey } from "@/editor/i18n";
import { getElementBounds } from "@/editor/utils/bounds";
import {
  anchorOffset,
  type ResizeMode,
  type ResizeAnchor,
} from "@/editor/hooks/useEditorState";

interface CanvasResizeDialogProps {
  width: number;
  height: number;
  dimensions: Dimensions;
  elements: FloorPlanElement[];
  onConfirm: (
    width: number,
    height: number,
    mode: ResizeMode,
    anchor: ResizeAnchor,
  ) => void;
  /** Closes the dialog and enters interactive crop mode on the canvas. */
  onStartCrop?: () => void;
  onClose: () => void;
}

// 3×3 anchor grid, laid out visually (row-major, top→bottom).
const ANCHOR_GRID: ResizeAnchor[] = [
  "top-left",
  "top",
  "top-right",
  "left",
  "center",
  "right",
  "bottom-left",
  "bottom",
  "bottom-right",
];

const ANCHOR_LABEL_KEYS: Record<ResizeAnchor, StringKey> = {
  "top-left": "editor.anchor.topLeft",
  top: "editor.anchor.top",
  "top-right": "editor.anchor.topRight",
  left: "editor.anchor.left",
  center: "editor.anchor.center",
  right: "editor.anchor.right",
  "bottom-left": "editor.anchor.bottomLeft",
  bottom: "editor.anchor.bottom",
  "bottom-right": "editor.anchor.bottomRight",
};

export function CanvasResizeDialog({
  width,
  height,
  dimensions,
  elements,
  onConfirm,
  onStartCrop,
  onClose,
}: CanvasResizeDialogProps) {
  const t = useT();
  const locale = useLocale();
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
    if (m === "scale")
      setNewHeight(Math.max(100, Math.round(newWidth / aspect)));
  };

  // Count elements pushed outside the new bounds after the anchor shift (advisory).
  const clippedCount = useMemo(() => {
    if (mode === "scale") return 0;
    const { dx, dy } = anchorOffset(
      anchor,
      newWidth - width,
      newHeight - height,
    );
    if (dx === 0 && dy === 0 && newWidth >= width && newHeight >= height)
      return 0;
    return elements.filter(el => {
      const b = getElementBounds(el);
      return (
        b.left + dx < 0 ||
        b.top + dy < 0 ||
        b.right + dx > newWidth ||
        b.bottom + dy > newHeight
      );
    }).length;
  }, [elements, newWidth, newHeight, width, height, mode, anchor]);

  return (
    <Dialog
      title={t("editor.dialog.canvasSize")}
      width="420px"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" color="neutral" onClick={onClose}>
            {t("editor.action.cancel")}
          </Button>
          <Button
            variant="solid"
            color="primary"
            onClick={() => {
              onConfirm(newWidth, newHeight, mode, anchor);
              onClose();
            }}
          >
            {t("editor.action.apply")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1.5">
          <SectionLabel>{t("editor.field.widthPx")}</SectionLabel>
          <NumberInput value={newWidth} onChange={setW} />
          {dimensions.unit !== "px" && (
            <span className="text-[11px] text-gray-400">
              {formatMeasurement(newWidth, dimensions, t, locale)}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <SectionLabel>{t("editor.field.heightPx")}</SectionLabel>
          <NumberInput
            value={newHeight}
            onChange={setH}
            disabled={mode === "scale"}
          />
          {dimensions.unit !== "px" && (
            <span className="text-[11px] text-gray-400">
              {formatMeasurement(newHeight, dimensions, t, locale)}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <SectionLabel>{t("editor.field.content")}</SectionLabel>
          <div className="flex gap-2">
            <Button
              variant="outline"
              color="neutral"
              active={mode === "preserve"}
              className="flex-1"
              onClick={() => selectMode("preserve")}
            >
              {t("editor.resize.keepSize")}
            </Button>
            <Button
              variant="outline"
              color="neutral"
              active={mode === "scale"}
              className="flex-1"
              onClick={() => selectMode("scale")}
            >
              {t("editor.resize.scaleToFit")}
            </Button>
          </div>
          <span className="text-[11px] text-gray-400">
            {mode === "scale"
              ? t("editor.resize.scaleHint")
              : t("editor.resize.preserveHint")}
          </span>
        </div>

        {mode === "preserve" && (
          <div className="flex flex-col gap-2">
            <SectionLabel>{t("editor.resize.anchor")}</SectionLabel>
            <div className="grid grid-cols-3 gap-1 w-max">
              {ANCHOR_GRID.map(a => {
                const selected = anchor === a;
                return (
                  <button
                    key={a}
                    type="button"
                    aria-label={t(ANCHOR_LABEL_KEYS[a])}
                    title={t(ANCHOR_LABEL_KEYS[a])}
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
              {t("editor.resize.anchorHint")}
            </span>
          </div>
        )}

        {onStartCrop && (
          <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-4">
            <SectionLabel>{t("editor.resize.cropSection")}</SectionLabel>
            <Button
              variant="outline"
              color="neutral"
              onClick={() => {
                onClose();
                onStartCrop();
              }}
            >
              {t("editor.resize.cropCta")}
            </Button>
            <span className="text-[11px] text-gray-400">
              {t("editor.resize.cropHint")}
            </span>
          </div>
        )}

        {clippedCount > 0 && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
            {t("editor.resize.clipped", { count: clippedCount })}
          </p>
        )}
      </div>
    </Dialog>
  );
}
