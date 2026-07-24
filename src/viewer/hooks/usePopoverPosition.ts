import { useLayoutEffect, useRef, useState } from "react";

/**
 * Position a fixed popover next to a tap/click point, clamped to stay within
 * the viewport (with a margin) so it never clips off-screen — important on
 * mobile where a tap can land near any edge.
 *
 * Returns a ref to attach to the popover element and the resolved {left, top}.
 * Measures the rendered size, so it reflects the popover's actual dimensions.
 */
export function usePopoverPosition(x: number, y: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x + 12, top: y - 20 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const margin = 8;
    const { width, height } = el.getBoundingClientRect();
    const maxLeft = window.innerWidth - width - margin;
    const maxTop = window.innerHeight - height - margin;
    setPos({
      left: Math.max(margin, Math.min(x + 12, maxLeft)),
      top: Math.max(margin, Math.min(y - 20, maxTop)),
    });
  }, [x, y]);

  return { ref, pos };
}
