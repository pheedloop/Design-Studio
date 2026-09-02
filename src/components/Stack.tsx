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

export interface StackProps extends HTMLAttributes<HTMLElement> {
  gap?: GapToken;
  align?: AlignValue;
  justify?: JustifyValue;
  px?: GapToken;
  py?: GapToken;
  mt?: GapToken;
  height?: "full";
  as?: ElementType;
  children?: ReactNode;
}

export function Stack({
  gap = "m",
  align,
  justify,
  px,
  py,
  mt,
  height,
  className,
  children,
  as: As = "div",
  ...rest
}: StackProps) {
  return (
    <As
      className={cn(
        "flex flex-col",
        gapClasses[gap],
        align && alignClasses[align],
        justify && justifyClasses[justify],
        px && pxClasses[px],
        py && pyClasses[py],
        mt && mtClasses[mt],
        height === "full" && "h-full",
        className,
      )}
      {...rest}
    >
      {children}
    </As>
  );
}
