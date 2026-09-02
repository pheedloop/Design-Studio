import React, { useContext } from "react";
import type { ElementType } from "@/types";
import { SectionShapeContext } from "./sectionShapeContext";
import {
  PLACEMENT_DRAG_TYPE,
  PLACEMENT_SHAPE_ELLIPSE_TYPE,
  type PlacementRecordRef,
} from "./placementDrag";

export function PlacementRow({
  isPlaced,
  recordType,
  recordId,
  children,
}: {
  isPlaced: boolean;
  recordType: ElementType;
  recordId: string;
  children: React.ReactNode;
}) {
  const defaultShape = useContext(SectionShapeContext);

  const handleDragStart = (e: React.DragEvent) => {
    if (isPlaced) {
      e.preventDefault();
      return;
    }
    const ref: PlacementRecordRef = {
      type: recordType,
      id: recordId,
      defaultShape,
    };
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData(PLACEMENT_DRAG_TYPE, JSON.stringify(ref));
    e.dataTransfer.setData("text/plain", JSON.stringify(ref));
    // Encode shape as a MIME type so it can be read during dragover
    if (defaultShape === "ellipse") {
      e.dataTransfer.setData(PLACEMENT_SHAPE_ELLIPSE_TYPE, "1");
    }
  };

  return (
    <div
      draggable={!isPlaced}
      onDragStart={handleDragStart}
      className={[
        "flex items-center gap-3 px-3 py-2.5 border-b border-border-neutral-faint text-sm transition-colors last:border-0",
        isPlaced
          ? "opacity-40 cursor-default"
          : "cursor-grab hover:bg-surface-neutral active:cursor-grabbing",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
