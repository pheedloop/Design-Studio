import { Text } from "react-konva";
import type { RectGeometry } from "@/types";

interface TextShapeProps {
  geo: RectGeometry;
  text: string;
  color: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textDecoration: "none" | "underline";
  textAlign: "left" | "center" | "right";
}

export function TextShape({
  geo,
  text,
  color,
  fontSize,
  fontWeight,
  fontStyle,
  textDecoration,
  textAlign,
}: TextShapeProps) {
  // Konva combines bold/italic into fontStyle as a space-separated string
  const parts: string[] = [];
  if (fontWeight === "bold") parts.push("bold");
  if (fontStyle === "italic") parts.push("italic");
  const konvaFontStyle = parts.length > 0 ? parts.join(" ") : "normal";

  return (
    <Text
      text={text}
      width={geo.width}
      height={geo.height}
      fill={color}
      fontSize={fontSize}
      fontStyle={konvaFontStyle}
      textDecoration={textDecoration === "underline" ? "underline" : ""}
      align={textAlign}
      verticalAlign="middle"
    />
  );
}
