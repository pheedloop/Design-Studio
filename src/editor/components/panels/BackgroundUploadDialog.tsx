import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Dialog } from "@/editor/components/ui";
import type { Background, DxfPrimitive, Unit } from "@/types";
import { parseDxf, type ParsedDxf } from "@/editor/utils/dxf/parseDxf";
import { bakeDrawing, type FitMode } from "@/editor/utils/dxf/bakeDrawing";
import {
  drawPrimitives,
  type DrawContext,
} from "@/editor/utils/dxf/drawPrimitives";
import { useT, type StringKey } from "@/editor/i18n";
import { Row } from "@/components/Row";
import { Stack } from "@/components/Stack";
import { Text } from "@/components/Text";
import { FitModeRadios } from "./FitModeRadios";

/** Serialized-size budget for the imported DXF primitives. pikachu caps the
 *  whole PATCH body (floor_plan_data) at 10 MB, so keep the payload well
 *  under it. Images don't hit this — they're a hosted URL, not inline data. */
const WARN_BYTES = 4_000_000;
const MAX_BYTES = 8_000_000;

const PREVIEW_W = 432;
const PREVIEW_H = 220;

type Kind = "image" | "dxf";

function detectKind(file: File): Kind {
  return file.name.toLowerCase().endsWith(".dxf") ? "dxf" : "image";
  // Future: ".pdf" → "pdf"
}

export interface BackgroundUploadResult {
  background: Background;
  /** Present when the user chose "resize canvas to file". */
  resizeCanvasTo?: { width: number; height: number };
  /** Present when a DXF declared real-world units — seeds scale calibration. */
  calibration?: { pixelsPerUnit: number; unit: Unit };
}

interface BackgroundUploadDialogProps {
  canvasWidth: number;
  canvasHeight: number;
  /** Current background's opacity, if replacing one — only applied to a new
   *  image upload's default (DXF always starts its own slider at 70%, matching
   *  prior behavior). */
  existingOpacity?: number;
  /**
   * Delegates the raw file to the host (e.g. uploads to the backend's single
   * background_image FileField) instead of inlining a data URL. Used for both
   * images and DXFs — one upload path regardless of file type. `width`/`height`
   * may be null (e.g. dimension-less SVGs, or a DXF where they're meaningless);
   * the dialog measures/bakes locally when needed.
   */
  onUpload?: (file: File) => Promise<{
    url: string;
    width: number | null;
    height: number | null;
  }>;
  onConfirm: (result: BackgroundUploadResult) => void;
  onClose: () => void;
}

/** Load a URL into an Image and read its intrinsic pixel dimensions. */
function measureImage(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = url;
  });
}

export function BackgroundUploadDialog({
  canvasWidth,
  canvasHeight,
  existingOpacity,
  onUpload,
  onConfirm,
  onClose,
}: BackgroundUploadDialogProps) {
  const t = useT();
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<Kind | null>(null);
  const [mode, setMode] = useState<FitMode>("fit");
  const [opacity, setOpacity] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<StringKey | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Image-specific
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // DXF-specific
  const [parsed, setParsed] = useState<ParsedDxf | null>(null);
  const [selectedLayers, setSelectedLayers] = useState<Set<string>>(new Set());
  const previewRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    if (!chosen) return;
    const detected = detectKind(chosen);
    setFile(chosen);
    setKind(detected);
    setError(null);
    setOpacity(detected === "dxf" ? 0.7 : (existingOpacity ?? 1));

    if (detected === "dxf") {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const result = parseDxf(reader.result as string);
          if (result.primitives.length === 0) {
            setError("editor.error.noGeometry");
            setParsed(null);
            return;
          }
          setParsed(result);
          setSelectedLayers(new Set(result.layers));
        } catch {
          setError("editor.error.dxfRead");
          setParsed(null);
        }
      };
      reader.onerror = () => setError("editor.error.fileRead");
      reader.readAsText(chosen);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const img = new Image();
        img.onload = () => {
          setImagePreview(dataUrl);
          setImageSize({ width: img.width, height: img.height });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(chosen);
    }
  };

  const reset = () => {
    setFile(null);
    setKind(null);
    setError(null);
    setImagePreview(null);
    setImageSize(null);
    setParsed(null);
    setSelectedLayers(new Set());
  };

  // --- DXF-only derived state ---

  const layerCounts = useMemo(() => {
    const counts = new Map<string, number>();
    parsed?.primitives.forEach(p =>
      counts.set(p.layer, (counts.get(p.layer) ?? 0) + 1),
    );
    return counts;
  }, [parsed]);

  const selectedPrimitives = useMemo<DxfPrimitive[]>(
    () => parsed?.primitives.filter(p => selectedLayers.has(p.layer)) ?? [],
    [parsed, selectedLayers],
  );

  const estimatedBytes = useMemo(
    () =>
      selectedPrimitives.length ? JSON.stringify(selectedPrimitives).length : 0,
    [selectedPrimitives],
  );
  const tooLarge = estimatedBytes > MAX_BYTES;

  // Live DXF preview: always fit-with-margin into the preview canvas.
  useEffect(() => {
    if (kind !== "dxf") return;
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
  }, [kind, parsed, selectedPrimitives, opacity]);

  const toggleLayer = (layer: string) => {
    setSelectedLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  const canConfirm =
    kind === "dxf"
      ? !!parsed && selectedLayers.size > 0 && !tooLarge
      : kind === "image"
        ? onUpload
          ? !!file
          : !!imagePreview && !!imageSize
        : false;

  const handleConfirm = async () => {
    if (!canConfirm || !file || !kind) return;
    setPending(true);
    setError(null);

    try {
      if (kind === "image") {
        let url: string;
        let width: number;
        let height: number;
        if (onUpload) {
          const uploaded = await onUpload(file);
          url = uploaded.url;
          if (uploaded.width == null || uploaded.height == null) {
            const measured = await measureImage(uploaded.url);
            width = measured.width;
            height = measured.height;
          } else {
            width = uploaded.width;
            height = uploaded.height;
          }
        } else {
          if (!imagePreview || !imageSize) throw new Error("No image preview");
          url = imagePreview;
          width = imageSize.width;
          height = imageSize.height;
        }
        const targetWidth = mode === "resize" ? width : canvasWidth;
        const targetHeight = mode === "resize" ? height : canvasHeight;
        onConfirm({
          background: {
            kind: "image",
            url,
            width: targetWidth,
            height: targetHeight,
            opacity,
          },
          resizeCanvasTo: mode === "resize" ? { width, height } : undefined,
        });
      } else {
        if (!parsed) throw new Error("No parsed DXF");
        const baked = bakeDrawing(selectedPrimitives, {
          box: { width: canvasWidth, height: canvasHeight },
          bounds: parsed.bounds,
          mode,
        });
        // Same upload path as images — one background_image FileField either
        // way. Without a host callback (e.g. the standalone demo), fall back
        // to a client-side object URL: fine for this session, but it won't
        // survive a reload without a real backend storing the file.
        const url = onUpload
          ? (await onUpload(file)).url
          : URL.createObjectURL(file);
        const result: BackgroundUploadResult = {
          background: {
            kind: "dxf",
            url,
            sourceFileName: file.name,
            primitives: baked.primitives,
            layers: [...selectedLayers].sort(),
            bounds: parsed.bounds,
            sourceUnits: parsed.sourceUnits,
            opacity,
          },
        };
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
      }
    } catch {
      setError("editor.error.uploadFailed");
      setPending(false);
    }
  };

  return (
    <Dialog
      title={t("editor.field.background")}
      onClose={onClose}
      width="480px"
      footer={
        <>
          <Button
            variant="outline"
            color="neutral"
            onClick={onClose}
            disabled={pending}
          >
            {t("editor.action.cancel")}
          </Button>
          <Button
            variant="solid"
            color="primary"
            onClick={handleConfirm}
            disabled={!canConfirm || pending}
          >
            {pending
              ? t("editor.background.uploading")
              : t("editor.background.upload")}
          </Button>
        </>
      }
    >
      <Stack gap="s" className="p-4">
        {!file ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border-neutral rounded-lg cursor-pointer hover:border-primary-400 hover:bg-surface-neutral transition-colors"
          >
            <span className="text-sm text-text-caption">
              {t("editor.background.chooseFile")}
            </span>
            <span className="text-xs text-text-subtle mt-1">
              {t("editor.background.fileTypes")}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.dxf"
              onChange={handleFileChange}
              className="hidden"
            />
            {error && <p className="text-xs text-red-600 mt-3">{t(error)}</p>}
          </div>
        ) : kind === "dxf" ? (
          !parsed ? (
            <>
              <div className="flex items-center justify-center h-40 bg-surface-neutral rounded-lg">
                <span className="text-xs text-text-caption px-4 text-center truncate">
                  {file.name}
                </span>
              </div>
              {error && <p className="text-xs text-red-600">{t(error)}</p>}
              <Button
                variant="ghost"
                color="neutral"
                className="px-0 self-start"
                onClick={reset}
              >
                {t("editor.background.chooseDifferent")}
              </Button>
            </>
          ) : (
            <>
              <canvas
                ref={previewRef}
                width={PREVIEW_W}
                height={PREVIEW_H}
                className="w-full bg-surface-neutral rounded-lg border border-border-neutral-light"
              />

              <Stack gap="xxxs">
                <Text size="xs" weight="medium" color="body" as="span">
                  {t("editor.background.layersToImport")}
                </Text>
                <Stack
                  gap="xxxs"
                  className="max-h-40 overflow-y-auto border border-border-neutral-light rounded-md p-2"
                >
                  {parsed.layers.map(layer => (
                    <label
                      key={layer}
                      className="flex items-center gap-xxs cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLayers.has(layer)}
                        onChange={() => toggleLayer(layer)}
                        className="accent-primary-600"
                      />
                      <span className="flex-1 text-text-body truncate">
                        {layer}
                      </span>
                      <span className="text-text-subtle">
                        {layerCounts.get(layer) ?? 0}
                      </span>
                    </label>
                  ))}
                </Stack>
              </Stack>

              <Row gap="xxs" align="center">
                <span className="text-xs font-medium text-text-body w-16">
                  {t("editor.field.opacity")}
                </span>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={opacity}
                  onChange={e => setOpacity(Number(e.target.value))}
                  className="accent-primary-600 cursor-pointer flex-1"
                />
                <span className="text-xs text-text-caption w-8 text-right">
                  {Math.round(opacity * 100)}%
                </span>
              </Row>

              <FitModeRadios mode={mode} onChange={setMode} t={t} />

              <Stack gap="xxxs" className="text-xs text-text-caption">
                {parsed.unsupportedCount > 0 && (
                  <span>
                    {t("editor.background.skipped", {
                      count: parsed.unsupportedCount,
                    })}
                  </span>
                )}
                {parsed.sourceUnits && (
                  <span>
                    {t("editor.background.dxfUnits", {
                      units: parsed.sourceUnits,
                    })}
                  </span>
                )}
                {tooLarge ? (
                  <span className="text-red-600">
                    {t("editor.background.tooLarge", {
                      size: Math.round(estimatedBytes / 1_000_000),
                    })}
                  </span>
                ) : estimatedBytes > WARN_BYTES ? (
                  <span className="text-amber-600">
                    {t("editor.background.largeSelection", {
                      size: Math.round(estimatedBytes / 1_000_000),
                    })}
                  </span>
                ) : null}
              </Stack>

              {error && <p className="text-xs text-red-600">{t(error)}</p>}

              <Button
                variant="ghost"
                color="neutral"
                className="px-0 self-start"
                onClick={reset}
                disabled={pending}
              >
                {t("editor.background.chooseDifferent")}
              </Button>
            </>
          )
        ) : (
          <>
            <div className="flex items-center justify-center h-40 bg-surface-neutral rounded-lg overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt={t("editor.background.preview")}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-xs text-text-caption px-4 text-center truncate">
                  {file.name}
                </span>
              )}
            </div>

            <div className="text-xs text-text-caption">
              {imageSize
                ? t("editor.background.dimensions", {
                    imageWidth: imageSize.width,
                    imageHeight: imageSize.height,
                    canvasWidth,
                    canvasHeight,
                  })
                : t("editor.background.canvasDimensions", {
                    canvasWidth,
                    canvasHeight,
                  })}
            </div>

            <Row gap="xxs" align="center">
              <span className="text-xs font-medium text-text-body w-16">
                {t("editor.field.opacity")}
              </span>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={opacity}
                onChange={e => setOpacity(Number(e.target.value))}
                className="accent-primary-600 cursor-pointer flex-1"
              />
              <span className="text-xs text-text-caption w-8 text-right">
                {Math.round(opacity * 100)}%
              </span>
            </Row>

            <FitModeRadios mode={mode} onChange={setMode} t={t} />

            {error && <p className="text-xs text-red-600">{t(error)}</p>}

            <Button
              variant="ghost"
              color="neutral"
              className="px-0 self-start"
              onClick={reset}
              disabled={pending}
            >
              {t("editor.background.chooseDifferent")}
            </Button>
          </>
        )}
      </Stack>
    </Dialog>
  );
}
