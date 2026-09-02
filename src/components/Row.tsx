import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";
import {
  alignClasses,
  gapClasses,
  justifyClasses,
  mtClasses,
  pxClasses,
  pyClasses,
  type AlignValue,
  type GapToken,
  type JustifyValue,
} from "./layoutTokens";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

// Static lookup so Tailwind sees every responsive class string at build time.
const responsiveClasses: Record<Breakpoint, string> = {
  xs: "flex-col xs:flex-row",
  sm: "flex-col sm:flex-row",
  md: "flex-col md:flex-row",
  lg: "flex-col lg:flex-row",
  xl: "flex-col xl:flex-row",
  "2xl": "flex-col 2xl:flex-row",
};

export interface RowProps extends HTMLAttributes<HTMLElement> {
  gap?: GapToken;
  align?: AlignValue;
  justify?: JustifyValue;
  wrap?: boolean;
  /** Stacks below this breakpoint, rows at and above it. */
  responsive?: Breakpoint;
  px?: GapToken;
  py?: GapToken;
  mt?: GapToken;
  as?: ElementType;
  children?: ReactNode;
}

export function Row({
  gap,
  align,
  justify,
  wrap,
  responsive,
  px,
  py,
  mt,
  className,
  children,
  as: As = "div",
  ...rest
}: RowProps) {
  return (
    <As
      className={cn(
        "flex",
        responsive ? responsiveClasses[responsive] : "flex-row",
        gap && gapClasses[gap],
        align && alignClasses[align],
        justify && justifyClasses[justify],
        wrap && "flex-wrap",
        px && pxClasses[px],
        py && pyClasses[py],
        mt && mtClasses[mt],
        className,
      )}
      {...rest}
    >
      {children}
    </As>
  );
}
