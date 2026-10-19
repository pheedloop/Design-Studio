import { useSyncExternalStore } from "react";
import fontUrl from "./RobotoCondensed-Bold.ttf";

// pikachu prints every badge field in Roboto Condensed Bold (badge.html). Konva
// draws to a canvas, so the font must be loaded before text is measured; the
// returned family changes when it is, which redraws the text.
const FAMILY = "Roboto Condensed";
const FALLBACK = "Arial, sans-serif";

let loaded = false;
let started = false;
const listeners = new Set<() => void>();

function start() {
  if (started || typeof FontFace === "undefined") return;
  started = true;
  const face = new FontFace(FAMILY, `url(${fontUrl})`, { weight: "700" });
  document.fonts.add(face);
  face.load().then(
    () => {
      loaded = true;
      listeners.forEach(l => l());
    },
    () => {
      started = false;
    },
  );
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Canvas fontFamily for badge text; use with fontStyle="bold". */
export function useBadgeFontFamily(): string {
  const ready = useSyncExternalStore(subscribe, () => loaded);
  return ready ? `${FAMILY}, ${FALLBACK}` : FALLBACK;
}
