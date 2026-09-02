import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
export type HeadingWeight = "medium" | "semibold";
export type HeadingColor = "heading" | "body" | "subtle" | "primary" | "invert";

// Split by property rather than one string per level, so an explicit size or
// weight replaces the level's default instead of being appended after it. cn()
// does not merge, and Tailwind resolves duplicates by stylesheet order.
const levelSize: Record<HeadingLevel, HeadingSize> = {
  1: "3xl",
  2: "2xl",
  3: "xl",
  4: "lg",
  5: "base",
  6: "sm",
};

const levelWeight: Record<HeadingLevel, HeadingWeight> = {
  1: "semibold",
  2: "semibold",
  3: "medium",
  4: "medium",
  5: "medium",
  6: "medium",
};

const sizeClasses: Record<HeadingSize, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
};

const weightClasses: Record<HeadingWeight, string> = {
  medium: "font-medium",
  semibold: "font-semibold",
};

const colorClasses: Record<HeadingColor, string> = {
  heading: "text-text-heading",
  body: "text-text-body",
  subtle: "text-text-subtle",
  primary: "text-text-primary",
  invert: "text-text-invert",
};

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level: HeadingLevel;
  size?: HeadingSize;
  weight?: HeadingWeight;
  color?: HeadingColor;
  children?: ReactNode;
}

export function Heading({
  level,
  size,
  weight,
  color,
  className,
  children,
  ...rest
}: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag
      className={cn(
        sizeClasses[size ?? levelSize[level]],
        weightClasses[weight ?? levelWeight[level]],
        colorClasses[color ?? "heading"],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
