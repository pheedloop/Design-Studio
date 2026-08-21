import type { ElementType } from "@/types";

// ---------------------------------------------------------------------------
// Data transfer constants
// ---------------------------------------------------------------------------

export const PLACEMENT_DRAG_TYPE = "application/x-placement-record";
// Encoding shape in a MIME type allows reading it during dragover (types[] is readable
// before drop, unlike actual data payload which browsers restrict for security).
export const PLACEMENT_SHAPE_ELLIPSE_TYPE =
  "application/x-placement-shape-ellipse";

export interface PlacementRecordRef {
  /** Element type to create/link for the dragged record. */
  type: ElementType;
  id: string;
  defaultShape: "rect" | "ellipse";
}
