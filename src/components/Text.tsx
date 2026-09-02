import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

export type TextVariant = "body" | "subtitle" | "caption" | "small";
export type TextSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl";
export type TextColor =
  | "heading"
  | "body"
  | "caption"
  | "subtle"
  | "disabled"
  | "invert"
  | "link"
  | "primary";
export type TextWeight = "normal" | "medium" | "semibold";
export type TextAlign = "left" | "center" | "right";

const variantSizeClasses: Record<TextVariant, string> = {
  body: "text-base",
  subtitle: "text-lg",
  caption: "text-sm leading-4",
  small: "text-xs",
};

const variantColorClasses: Record<TextVariant, string> = {
  body: "text-text-body",
  subtitle: "text-text-body",
  caption: "text-text-caption",
  small: "text-text-caption",
};

const sizeClasses: Record<TextSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

const colorClasses: Record<TextColor, string> = {
  heading: "text-text-heading",
  body: "text-text-body",
  caption: "text-text-caption",
  subtle: "text-text-subtle",
  disabled: "text-text-disabled",
  invert: "text-text-invert",
  link: "text-text-link",
  primary: "text-text-primary",
};

const weightClasses: Record<TextWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
};

const alignClasses: Record<TextAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  size?: TextSize;
  color?: TextColor;
  weight?: TextWeight;
  align?: TextAlign;
  truncate?: boolean;
  as?: ElementType;
  children?: ReactNode;
}

export function Text({
  variant = "body",
  size,
  color,
  weight = "normal",
  align,
  truncate,
  className,
  children,
  as: As = "p",
  ...rest
}: TextProps) {
  return (
    <As
      className={cn(
        size ? sizeClasses[size] : variantSizeClasses[variant],
        color ? colorClasses[color] : variantColorClasses[variant],
        weightClasses[weight],
        align && alignClasses[align],
        truncate && "truncate",
        className,
      )}
      {...rest}
    >
      {children}
    </As>
  );
}
