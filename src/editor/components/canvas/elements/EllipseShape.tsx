import { Ellipse, Group } from "react-konva";
import type { EllipseGeometry, ElementProperties } from "@/types";
import {
  getLabelXY,
  getLabelFontStyle,
  getLabelRenderProps,
} from "./labelUtils";
import { LabelWithBackground } from "./LabelWithBackground";

interface EllipseShapeProps {
  geo: EllipseGeometry;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  label: string;
  properties: ElementProperties;
}

export function EllipseShape({
  geo,
  color,
  strokeColor,
  strokeWidth,
  label,
  properties,
}: EllipseShapeProps) {
  const lp = getLabelRenderProps(properties);
  const w = geo.radiusX * 2;
  const h = geo.radiusY * 2;
  const labelPos = getLabelXY(lp.labelPositionV, lp.labelPositionH, w, h);
  const fontStyle = getLabelFontStyle(lp.labelBold, lp.labelItalic);

  return (
    <>
      <Ellipse
        x={geo.radiusX}
        y={geo.radiusY}
        radiusX={geo.radiusX}
        radiusY={geo.radiusY}
        fill={color}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={0.9}
      />
      {label && (
        <Group opacity={lp.labelVisible ? 1 : 0.35} listening={false}>
          <LabelWithBackground
            text={lp.labelVisible ? label : `${label} ⊘`}
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
