import type { ElementProperties } from "@/types";

type VPos = "top" | "middle" | "bottom";
type HPos = "left" | "center" | "right";

/**
 * Convert label position axes to Konva Text props.
 * When useLabelTag is true, returns x/y for a Konva Label (positioned at a point).
 * When false, returns width/height/align/verticalAlign for a full-area Text.
 */
export function getLabelXY(
  v: VPos,
  h: HPos,
  elWidth: number,
  elHeight: number,
  padding: number = 4,
) {
  return {
    x: 0,
    y: 0,
    width: elWidth,
    height: elHeight,
    align: h as string,
    verticalAlign: v as string,
    padding,
  };
}

/** Build Konva fontStyle string from bold + italic flags. */
export function getLabelFontStyle(bold?: boolean, italic?: boolean): string {
  if (bold && italic) return "bold italic";
  if (bold) return "bold";
  if (italic) return "italic";
  return "normal";
}

/** All label rendering props derived from ElementProperties. */
export interface LabelRenderProps {
  labelPositionV: VPos;
  labelPositionH: HPos;
  labelColor: string;
  labelFontSize: number;
  labelBold: boolean;
  labelItalic: boolean;
  labelUnderline: boolean;
  labelBackground?: { color: string; opacity: number };
  labelVisible: boolean;
}

/** Extract label props with defaults from element properties. */
export function getLabelRenderProps(
  props: ElementProperties,
): LabelRenderProps {
  return {
    labelPositionV: props.labelPositionV ?? "middle",
    labelPositionH: props.labelPositionH ?? "center",
    labelColor: props.labelColor ?? "#ffffff",
    labelFontSize: props.labelFontSize ?? 12,
    labelBold: props.labelBold ?? true,
    labelItalic: props.labelItalic ?? false,
    labelUnderline: props.labelUnderline ?? false,
    labelBackground: props.labelBackground,
    labelVisible: props.labelVisible !== false,
  };
}
