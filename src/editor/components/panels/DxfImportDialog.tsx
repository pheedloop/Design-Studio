import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Dialog } from "../ui";
import type { DxfDrawing, DxfPrimitive, Unit } from "../../../types";
import { parseDxf, type ParsedDxf } from "../../utils/dxf/parseDxf";
import { bakeDrawing, type FitMode } from "../../utils/dxf/bakeDrawing";
import { drawPrimitives, type DrawContext } from "../../utils/dxf/drawPrimitives";

/** Serialized-size budget for the imported primitives. pikachu caps the whole
 *  PATCH body (floor_plan_data) at 10 MB, so keep the DXF payload well under it. */
const WARN_BYTES = 4_000_000;
const MAX_BYTES = 8_000_000;

const PREVIEW_W = 432;
const PREVIEW_H = 220;

export interface DxfImportResult {
  drawing: DxfDrawing;
  /** Present when the user chose "resize canvas to drawing". */
  resizeCanvasTo?: { width: number; height: number };
  /** Present when the DXF declared real-world units — seeds scale calibration. */
  calibration?: { pixelsPerUnit: number; unit: Unit };
}

interface DxfImportDialogProps {
  canvasWidth: number;
  canvasHeight: number;
  onConfirm: (result: DxfImportResult) => void;
  onClose: () => void;
}

export function DxfImportDialog({
  canvasWidth,
  canvasHeight,
  onConfirm,
  onClose,
}: DxfImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedDxf | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [opacity, setOpacity] = useState(0.7);
  const [mode, setMode] = useState<FitMode>("fit");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    if (!chosen) return;
    setFile(chosen);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = parseDxf(reader.result as string);
        if (result.primitives.length === 0) {
          setError("No supported geometry found in this DXF.");
          setParsed(null);
          return;
        }
        setParsed(result);
        setSelected(new Set(result.layers));
      } catch {
        setError("Could not read this file as DXF.");
        setParsed(null);
      }
    };
    reader.onerror = () => setError("Could not read the file.");
    reader.readAsText(chosen);
  };

  // Primitive count per layer, for the checklist labels.
  const layerCounts = useMemo(() => {
    const counts = new Map<string, number>();
    parsed?.primitives.forEach((p) => counts.set(p.layer, (counts.get(p.layer) ?? 0) + 1));
    return counts;
  }, [parsed]);

  const selectedPrimitives = useMemo<DxfPrimitive[]>(
    () => parsed?.primitives.filter((p) => selected.has(p.layer)) ?? [],
    [parsed, selected]
  );

  const estimatedBytes = useMemo(
    () => (selectedPrimitives.length ? JSON.stringify(selectedPrimitives).length : 0),
    [selectedPrimitives]
  );
  const tooLarge = estimatedBytes > MAX_BYTES;

  // Live preview: always fit-with-margin into the preview canvas.
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !parsed) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (selectedPrimitives.length === 0) return;
    const baked = bakeDrawing(selectedPrimitives, {
      box: { width: PREVIEW_W, height: PREVIEW_H },
      bounds: parsed.bounds,
      mode: "fit",
      fill: 0.9,
    });
    ctx.globalAlpha = opacity;
    drawPrimitives(ctx as unknown as DrawContext, baked.primitives);
    ctx.globalAlpha = 1;
  }, [parsed, selectedPrimitives, opacity]);

  const toggleLayer = (layer: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  const reset = () => {
    setFile(null);
    setParsed(null);
    setSelected(new Set());
    setError(null);
  };

  const canConfirm = !!parsed && selected.size > 0 && !tooLarge;

  const handleConfirm = () => {
    if (!parsed || !canConfirm) return;
    const baked = bakeDrawing(selectedPrimitives, {
      box: { width: canvasWidth, height: canvasHeight },
      bounds: parsed.bounds,
      mode,
    });
    const drawing: DxfDrawing = {
      primitives: baked.primitives,
      layers: [...selected].sort(),
      bounds: parsed.bounds,
      sourceUnits: parsed.sourceUnits,
      opacity,
      sourceFileName: file?.name,
    };
    const result: DxfImportResult = { drawing };
    if (mode === "resize") {
      result.resizeCanvasTo = { width: baked.width, height: baked.height };
    }
    if (parsed.sourceUnits) {
      result.calibration = {
        pixelsPerUnit: baked.scale * parsed.unitsPerRealUnit,
        unit: parsed.sourceUnits,
      };
    }
    onConfirm(result);
  };

  return (
    <Dialog
      title="Import DXF"
      onClose={onClose}
      width="480px"
      footer={
        <>
          <Button variant="outline" color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="solid" color="primary" onClick={handleConfirm} disabled={!canConfirm}>
            Import
          </Button>
        </>
      }
    >
      <div className="p-4 flex flex-col gap-4">
        {!parsed ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm text-gray-500">Click to select a DXF file</span>
            <span className="text-xs text-gray-400 mt-1">AutoCAD .dxf floor plans</span>
            <input
              ref={fileRef}
              type="file"
              accept=".dxf"
              onChange={handleFileChange}
              className="hidden"
            />
            {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
          </div>
        ) : (
          <>
            <canvas
              ref={previewRef}
              width={PREVIEW_W}
              height={PREVIEW_H}
              className="w-full bg-gray-100 rounded-lg border border-gray-200"
            />

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-700">Layers to import</span>
              <div className="max-h-40 overflow-y-auto flex flex-col gap-1 border border-gray-200 rounded-md p-2">
                {parsed.layers.map((layer) => (
                  <label key={layer} className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={selected.has(layer)}
                      onChange={() => toggleLayer(layer)}
                      className="accent-primary-600"
                    />
                    <span className="flex-1 text-gray-700 truncate">{layer}</span>
                    <span className="text-gray-400">{layerCounts.get(layer) ?? 0}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700 w-16">Opacity</span>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="accent-primary-600 cursor-pointer flex-1"
              />
              <span className="text-xs text-gray-500 w-8 text-right">
                {Math.round(opacity * 100)}%
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dxfMode"
                  checked={mode === "fit"}
                  onChange={() => setMode("fit")}
                  className="accent-primary-600"
                />
                <div>
                  <span className="text-xs font-medium text-gray-700">Fit to canvas</span>
                  <p className="text-[11px] text-gray-400">
                    Scale the drawing to the current canvas size
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dxfMode"
                  checked={mode === "resize"}
                  onChange={() => setMode("resize")}
                  className="accent-primary-600"
                />
                <div>
                  <span className="text-xs font-medium text-gray-700">Resize canvas to drawing</span>
                  <p className="text-[11px] text-gray-400">
                    Match the floor plan dimensions to the drawing
                  </p>
                </div>
              </label>
            </div>

            <div className="text-xs text-gray-500 flex flex-col gap-1">
              {parsed.unsupportedCount > 0 && (
                <span>{parsed.unsupportedCount} unsupported entities were skipped.</span>
              )}
              {parsed.sourceUnits && <span>Scale detected from DXF units ({parsed.sourceUnits}).</span>}
              {tooLarge ? (
                <span className="text-red-600">
                  Selection is too large ({Math.round(estimatedBytes / 1_000_000)} MB). Deselect
                  some layers.
                </span>
              ) : estimatedBytes > WARN_BYTES ? (
                <span className="text-amber-600">
                  Large selection ({Math.round(estimatedBytes / 1_000_000)} MB) — may slow saving.
                </span>
              ) : null}
            </div>

            <Button
              variant="ghost"
              color="neutral"
              className="px-0 self-start"
              onClick={reset}
            >
              Choose different file
            </Button>
          </>
        )}
      </div>
    </Dialog>
  );
}
