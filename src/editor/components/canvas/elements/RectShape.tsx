import { Rect, Group } from "react-konva";
import type { RectGeometry, ElementProperties } from "../../../../types";
import {
  getLabelXY,
  getLabelFontStyle,
  getLabelRenderProps,
} from "./labelUtils";
import { LabelWithBackground } from "./LabelWithBackground";

interface RectShapeProps {
  geo: RectGeometry;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  label: string;
  properties: ElementProperties;
}

export function RectShape({
  geo,
  color,
  strokeColor,
  strokeWidth,
  label,
  properties,
}: RectShapeProps) {
  const lp = getLabelRenderProps(properties);
  const labelPos = getLabelXY(
    lp.labelPositionV,
    lp.labelPositionH,
    geo.width,
    geo.height,
  );
  const fontStyle = getLabelFontStyle(lp.labelBold, lp.labelItalic);

  return (
    <>
      <Rect
        width={geo.width}
        height={geo.height}
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
