import { useEffect, useRef } from "react";

/**
 * Close on an outside press or Escape. `enabled` is for callers that stay
 * mounted while closed.
 *
 * `pointerdown`, not `mousedown`: a touch also synthesizes a trailing mousedown
 * ~300ms later, which would dismiss a popover the moment it opened.
 */
export function useDismiss(
  ref: React.RefObject<HTMLElement | null>,
  onDismiss: () => void,
  enabled = true,
): void {
  // Ref'd so an inline callback doesn't re-subscribe on every render.
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
