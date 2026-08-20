import { useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import type { FloorPlanElement } from "@/types";

const PASTE_OFFSET = 20;

export function useClipboard() {
  const [buffer, setBuffer] = useState<FloorPlanElement[]>([]);
  const pasteCount = useRef(0);

  const copy = useCallback((elements: FloorPlanElement[]) => {
    setBuffer(structuredClone(elements));
    pasteCount.current = 0;
  }, []);

  const paste = useCallback((): FloorPlanElement[] => {
    if (buffer.length === 0) return [];

    pasteCount.current += 1;
    const offset = PASTE_OFFSET * pasteCount.current;

    return buffer.map(el => {
      const newElement = structuredClone(el);
      newElement.id = uuidv4();
      // Pasted elements are independent — don't inherit group membership
      newElement.properties = { ...newElement.properties, groupId: undefined };

      // Offset position
      const geo = newElement.geometry;
      if ("x" in geo) {
        (geo as { x: number }).x += offset;
      }
      if ("y" in geo) {
        (geo as { y: number }).y += offset;
      }

      return newElement;
    });
  }, [buffer]);

  return { copy, paste, hasBuffer: buffer.length > 0 };
}
