import { Rect, Line, Ellipse, Circle, Text, Group } from "react-konva";
import type { Geometry, ElementProperties } from "../../../../types";
import {
  getLabelXY,
  getLabelFontStyle,
  getLabelRenderProps,
} from "./labelUtils";
import { LabelWithBackground } from "./LabelWithBackground";
import { UnlinkedBadge } from "./UnlinkedBadge";
import { getGeometryBounds } from "../../../utils/bounds";

interface MeetingRoomShapeProps {
  geo: Geometry;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  properties: ElementProperties;
  isLinked: boolean;
}

export function MeetingRoomShape({
  geo,
  color,
  strokeColor,
  strokeWidth,
  properties,
  isLinked,
}: MeetingRoomShapeProps) {
  const lp = getLabelRenderProps(properties);
  const bounds = getGeometryBounds(geo);
  const rawLabelPos = getLabelXY(
    lp.labelPositionV,
    lp.labelPositionH,
    bounds.width,
    bounds.height,
  );
  const fontStyle = getLabelFontStyle(lp.labelBold, lp.labelItalic);
  const displayName = properties.name ?? "Meeting Room";

  const labelPos =
    geo.shape === "polygon"
      ? (() => {
          const pts = geo.points;
          let minX = Infinity,
            minY = Infinity;
          for (let i = 0; i < pts.length; i += 2) {
            if (pts[i] < minX) minX = pts[i];
            if (pts[i + 1] < minY) minY = pts[i + 1];
          }
          return {
            ...rawLabelPos,
            x: rawLabelPos.x + (isFinite(minX) ? minX : 0),
            y: rawLabelPos.y + (isFinite(minY) ? minY : 0),
          };
        })()
      : rawLabelPos;

  const shapeStroke = isLinked ? strokeColor : "#ef4444";
  const shapeDash = isLinked ? undefined : [8, 4];

  return (
    <>
      {geo.shape === "rect" && (
        <Rect
          width={geo.width}
          height={geo.height}
          fill={color}
          stroke={shapeStroke}
          strokeWidth={strokeWidth}
          dash={shapeDash}
          opacity={isLinked ? 0.9 : 0.5}
        />
      )}
      {geo.shape === "polygon" && (
        <Line
          points={[...geo.points]}
          closed
          fill={color}
          stroke={shapeStroke}
          strokeWidth={strokeWidth}
          dash={shapeDash}
          opacity={isLinked ? 0.9 : 0.5}
        />
      )}
      {geo.shape === "ellipse" && (
        <Ellipse
          x={geo.radiusX}
          y={geo.radiusY}
          radiusX={geo.radiusX}
          radiusY={geo.radiusY}
          fill={color}
          stroke={shapeStroke}
          strokeWidth={strokeWidth}
          dash={shapeDash}
          opacity={isLinked ? 0.9 : 0.5}
        />
      )}
      {geo.shape === "circle" && (
        <Circle
          x={geo.radius}
          y={geo.radius}
          radius={geo.radius}
          fill={color}
          stroke={shapeStroke}
          strokeWidth={strokeWidth}
          dash={shapeDash}
          opacity={isLinked ? 0.9 : 0.5}
        />
      )}
      <Text text="🚪" x={3} y={2} fontSize={10} listening={false} />
      {!isLinked && <UnlinkedBadge />}
      {displayName && (
        <Group opacity={lp.labelVisible ? 1 : 0.35} listening={false}>
          <LabelWithBackground
            text={lp.labelVisible ? displayName : `${displayName} ⊘`}
            labelPos={labelPos}
            fontSize={lp.labelFontSize}
            fill={lp.labelColor}
            fontStyle={fontStyle}
            underline={lp.labelUnderline}
            background={lp.labelBackground}
          />
        </Group>
      )}
    </>
  );
}
