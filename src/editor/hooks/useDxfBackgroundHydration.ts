import { useEffect, useRef } from "react";
import type { Background, Dimensions } from "@/types";
import { parseDxf } from "@/editor/utils/dxf/parseDxf";
import { bakeDrawing } from "@/editor/utils/dxf/bakeDrawing";

interface UseDxfBackgroundHydrationArgs {
  background: Background | undefined;
  canvasWidth: number;
  canvasHeight: number;
  setBackground: (bg: Background) => void;
  updateDimensions: (dims: Partial<Dimensions>) => void;
  /** Surface a hydration failure to the user (the editor has no toast system;
   *  the caller renders the message as a dismissible banner). */
  onError?: (message: string) => void;
}

/**
 * Hydrates a DXF background that arrived with a URL but no parsed geometry.
 *
 * This happens when a `.dxf` is chosen at map-creation time (in the host's
 * create form): the raw file is uploaded to the backend and the floor plan
 * opens with a `{ kind: "dxf", url, primitives: [] }` stub. Here — once, in the
 * editor — we fetch the source file, parse it into baked primitives, and write
 * them back via `setBackground` (persisted on the next save, like any edit).
 * DXF units seed the scale calibration, matching the Import dialog.
 *
 * Editor-only by design: the parser never reaches the viewer, which only ever
 * renders primitives that were already baked and saved.
 *
 * The `attemptedUrl` ref is the sole dedup guard. We deliberately do NOT cancel
 * the in-flight fetch on effect cleanup: under React StrictMode the effect runs
 * twice in dev (run → cleanup → run), and a cleanup-driven cancel would abort
 * the only fetch while the guard blocks the retry, leaving the stub forever
 * un-hydrated. Letting the async finish is safe — a state update after unmount
 * is a no-op in React 18+.
 */
export function useDxfBackgroundHydration({
  background,
  canvasWidth,
  canvasHeight,
  setBackground,
  updateDimensions,
  onError,
}: UseDxfBackgroundHydrationArgs) {
  const attemptedUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!background || background.kind !== "dxf") return;
    if (background.primitives.length > 0) return; // already hydrated
    if (!background.url) return; // nothing to fetch (no backend / demo)
    if (attemptedUrl.current === background.url) return; // in-flight or done
    attemptedUrl.current = background.url;

    const { url, sourceFileName, opacity } = background;

    void (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch DXF (${res.status})`);
        const text = await res.text();

        const parsed = parseDxf(text);
        if (parsed.primitives.length === 0) {
          // Parsed cleanly but nothing renderable — retrying the same file
          // won't help, so leave the guard set and surface it once.
          onError?.("No supported geometry found in this DXF.");
          return;
        }

        // "resize" reshapes the canvas to the DXF's own aspect ratio (scaled to
        // fit within the created dimensions), so a wide/tall drawing fills the
        // canvas instead of sitting letterboxed inside the default 1000x600.
        const baked = bakeDrawing(parsed.primitives, {
          box: { width: canvasWidth, height: canvasHeight },
          bounds: parsed.bounds,
          mode: "resize",
        });

        setBackground({
          kind: "dxf",
          url,
          sourceFileName,
          primitives: baked.primitives,
          layers: parsed.layers,
          bounds: parsed.bounds,
          sourceUnits: parsed.sourceUnits,
          opacity,
        });

        const dims: Partial<Dimensions> = {
          width: baked.width,
          height: baked.height,
        };
        if (parsed.sourceUnits) {
          dims.pixelsPerUnit = baked.scale * parsed.unitsPerRealUnit;
          dims.unit = parsed.sourceUnits;
        }
        updateDimensions(dims);
      } catch (err) {
        // Allow a retry on the next open; surface the reason (was silent before).
        attemptedUrl.current = null;
        console.error("DXF background hydration failed:", err);
        onError?.("Couldn't load the DXF background. Reopen the map to retry.");
      }
    })();
  }, [
    background,
    canvasWidth,
    canvasHeight,
    setBackground,
    updateDimensions,
    onError,
  ]);
}
