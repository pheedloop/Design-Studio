import { useEffect, useRef } from "react";

/**
 * Dismiss a popover, menu or picker when the user presses outside it or hits
 * Escape. Seven components hand-rolled this effect before; this is the one
 * implementation.
 *
 * Listens for `pointerdown` rather than `mousedown` + `touchstart`. A pointer
 * event fires once per gesture, whereas a touch also synthesizes a trailing
 * mousedown roughly 300ms later — and that trailing event is what used to close
 * a popover the instant it opened on mobile. The two viewer popovers each
 * carried a 350ms grace window to swallow it; listening for pointerdown removes
 * the cause, so the workaround is gone rather than duplicated a third time.
 *
 * `enabled` is for callers that keep the element mounted and toggle it with
 * state — pass `false` while closed so no listener is attached. Callers that
 * mount conditionally can leave it defaulted.
 */
export function useDismiss(
  ref: React.RefObject<HTMLElement | null>,
  onDismiss: () => void,
  enabled = true,
): void {
  // Held in a ref so an inline `() => setOpen(false)` at the call site doesn't
  // tear down and re-attach both listeners on every render.
  const latest = useRef(onDismiss);
  useEffect(() => {
    latest.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!enabled) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        latest.current();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") latest.current();
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [ref, enabled]);
}
