import { useMemo } from "react";
import Konva from "konva";
import { Rect, Text } from "react-konva";

interface LabelWithBackgroundProps {
  text: string;
  labelPos: {
    x: number;
    y: number;
    width: number;
    height: number;
    align: string;
    verticalAlign: string;
    padding: number;
  };
  fontSize: number;
  fill: string;
  fontStyle: string;
  underline: boolean;
  background?: { color: string; opacity: number };
}

const BG_PADDING = 3;

export function LabelWithBackground({
  text,
  labelPos,
  fontSize,
  fill,
  fontStyle,
  underline,
  background,
}: LabelWithBackgroundProps) {
  // Measure text dimensions for tight background rect
  const textSize = useMemo(() => {
    const node = new Konva.Text({ text, fontSize, fontStyle });
    const w = node.width();
    const h = node.height();
    node.destroy();
    return { w, h };
  }, [text, fontSize, fontStyle]);

  // Calculate background rect position based on text alignment within the element
  const bgRect = useMemo(() => {
    if (!background) return null;

    const bgW = textSize.w + BG_PADDING * 2;
    const bgH = textSize.h + BG_PADDING * 2;

    let bgX: number;
    if (labelPos.align === "left") {
      bgX = labelPos.padding - BG_PADDING;
    } else if (labelPos.align === "right") {
      bgX = labelPos.width - labelPos.padding - textSize.w - BG_PADDING;
    } else {
      bgX = (labelPos.width - textSize.w) / 2 - BG_PADDING;
    }

    let bgY: number;
    if (labelPos.verticalAlign === "top") {
      bgY = labelPos.padding - BG_PADDING;
    } else if (labelPos.verticalAlign === "bottom") {
      bgY = labelPos.height - labelPos.padding - textSize.h - BG_PADDING;
    } else {
      bgY = (labelPos.height - textSize.h) / 2 - BG_PADDING;
    }

    return { x: labelPos.x + bgX, y: labelPos.y + bgY, w: bgW, h: bgH };
  }, [background, textSize, labelPos]);

  return (
    <>
      {bgRect && background && (
        <Rect
          x={bgRect.x}
          y={bgRect.y}
          width={bgRect.w}
          height={bgRect.h}
          fill={background.color}
          opacity={background.opacity}
          cornerRadius={2}
          listening={false}
        />
      )}
      <Text
        text={text}
        x={labelPos.x}
        y={labelPos.y}
        width={labelPos.width}
        height={labelPos.height}
        align={labelPos.align}
        verticalAlign={labelPos.verticalAlign}
        padding={labelPos.padding}
        fontSize={fontSize}
        fill={fill}
        fontStyle={fontStyle}
        textDecoration={underline ? "underline" : ""}
        listening={false}
      />
    </>
  );
}
