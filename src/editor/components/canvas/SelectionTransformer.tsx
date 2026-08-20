import { useRef, useEffect, useCallback, useState } from "react";
import { Transformer } from "react-konva";
import type Konva from "konva";
import type { FloorPlanElement } from "@/types";

interface SelectionTransformerProps {
  selectedIds: Set<string>;
  stageRef: React.RefObject<Konva.Stage | null>;
  elements: FloorPlanElement[];
  onTransformEnd: (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number,
  ) => void;
  visible?: boolean;
}

export function SelectionTransformer({
  selectedIds,
  stageRef,
  elements,
  onTransformEnd,
  visible = true,
}: SelectionTransformerProps) {
  const trRef = useRef<Konva.Transformer>(null);
  const [shiftHeld, setShiftHeld] = useState(false);
  const isRotating = useRef(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftHeld(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftHeld(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const isSingle = selectedIds.size === 1;
  const selectedId = isSingle ? [...selectedIds][0] : null;
  const selectedElement = selectedId
    ? elements.find(el => el.id === selectedId)
    : null;
  const isLine = selectedElement?.geometry.shape === "line";
  const isArrow = selectedElement?.geometry.shape === "arrow";
  const isArc = selectedElement?.geometry.shape === "arc";
  const isPolygon = selectedElement?.geometry.shape === "polygon";

  // Geometry key for re-attaching transformer after state updates
  const geoKey =
    isSingle && selectedElement
      ? JSON.stringify(selectedElement.geometry)
      : [...selectedIds].sort().join(",");

  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;

    // Only attach transformer for single selection (not lines, arrows, arcs, polygons — these use custom handles)
    if (!isSingle || isLine || isArrow || isArc || isPolygon) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }

    const node = stage.findOne(`.${selectedId}`);
    if (node) {
      tr.nodes([node]);
      tr.getLayer()?.batchDraw();
    }
  }, [
    selectedIds,
    selectedId,
    stageRef,
    geoKey,
    isLine,
    isArrow,
    isArc,
    isPolygon,
    isSingle,
    elements,
  ]);

  const handleTransformEnd = useCallback(() => {
    const tr = trRef.current;
    if (!tr || !isSingle || !selectedId) return;

    const node = tr.nodes()[0];
    if (!node) return;

    const group = node as Konva.Group;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const rect = group.findOne("Rect");
    const ellipse = group.findOne("Ellipse");
    const text = group.findOne("Text");
    const shape = rect || ellipse || text;
    if (!shape) return;

    let newWidth: number;
    let newHeight: number;

    if (ellipse) {
      const el = ellipse as Konva.Ellipse;
      const newRadiusX = el.radiusX() * scaleX;
      const newRadiusY = el.radiusY() * scaleY;
      el.radiusX(newRadiusX);
      el.radiusY(newRadiusY);
      newWidth = newRadiusX * 2;
      newHeight = newRadiusY * 2;
    } else if (rect) {
      newWidth = (rect as Konva.Rect).width() * scaleX;
      newHeight = (rect as Konva.Rect).height() * scaleY;
      (rect as Konva.Rect).width(newWidth);
      (rect as Konva.Rect).height(newHeight);
    } else {
      // Text-only element (label/icon) — scale width/height directly
      newWidth = (shape as Konva.Text).width() * scaleX;
      newHeight = (shape as Konva.Text).height() * scaleY;
    }

    // Reset scale so it doesn't compound
    node.scaleX(1);
    node.scaleY(1);

    // Update all text children to match new dimensions
    if (text) {
      (text as Konva.Text).width(newWidth);
      (text as Konva.Text).height(newHeight);
    }
    // Also update rect text label if present alongside rect
    if (rect) {
      const rectText = group.find("Text");
      rectText.forEach(t => {
        t.width(newWidth);
        t.height(newHeight);
      });
    }

    const rotation = node.rotation();
    onTransformEnd(
      selectedId,
      node.x(),
      node.y(),
      newWidth,
      newHeight,
      rotation,
    );
  }, [isSingle, selectedId, onTransformEnd]);

  if (!visible) return null;

  return (
    <Transformer
      ref={trRef}
      rotateEnabled={isSingle}
      resizeEnabled={isSingle}
      rotateAnchorOffset={20}
      rotationSnaps={
        shiftHeld ? Array.from({ length: 24 }, (_, i) => i * 15) : []
      }
      rotationSnapTolerance={shiftHeld ? 10 : 0}
      borderStroke="#007bff"
      borderStrokeWidth={1.5}
      anchorFill="#fff"
      anchorStroke="#007bff"
      anchorSize={8}
      anchorCornerRadius={2}
      boundBoxFunc={(_oldBox, newBox) => {
        if (isRotating.current) return newBox;
        if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) {
          return _oldBox;
        }
        if (shiftHeld) {
          const size = Math.max(
            Math.abs(newBox.width),
            Math.abs(newBox.height),
          );
          return {
            ...newBox,
            width: size * Math.sign(newBox.width),
            height: size * Math.sign(newBox.height),
          };
        }
        return newBox;
      }}
      onTransformStart={() => {
        const tr = trRef.current;
        if (!tr) return;
        const activeAnchor = tr.getActiveAnchor();
        isRotating.current = activeAnchor === "rotater";
      }}
      onTransform={() => {
        const tr = trRef.current;
        if (!tr || !isSingle) return;
        const node = tr.nodes()[0];
        if (!node) return;

        const group = node as Konva.Group;
        const text = group.findOne("Text");
        const rect = group.findOne("Rect");
        const ellipse = group.findOne("Ellipse");

        // For text-only elements (no rect/ellipse), convert scale to width/height in real-time
        // This prevents the visual stretching during drag
        if (text && !rect && !ellipse) {
          const sx = node.scaleX();
          const sy = node.scaleY();
          const t = text as Konva.Text;
          t.width(t.width() * sx);
          t.height(t.height() * sy);
          node.scaleX(1);
          node.scaleY(1);
        }
      }}
      onTransformEnd={handleTransformEnd}
    />
  );
}
