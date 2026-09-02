export type GapToken =
  | "none"
  | "hair"
  | "xxxs"
  | "tight"
  | "xxs"
  | "snug"
  | "xs"
  | "s"
  | "m"
  | "l"
  | "xl"
  | "xxl"
  | "xxxl";
export type AlignValue = "start" | "center" | "end" | "stretch" | "baseline";
export type JustifyValue =
  "start" | "center" | "end" | "between" | "around" | "evenly";

// Static lookups, not template strings: Tailwind only emits classes it can see
// in the source at build time.
export const gapClasses: Record<GapToken, string> = {
  none: "gap-0",
  hair: "gap-hair",
  xxxs: "gap-xxxs",
  tight: "gap-tight",
  xxs: "gap-xxs",
  snug: "gap-snug",
  xs: "gap-xs",
  s: "gap-s",
  m: "gap-m",
  l: "gap-l",
  xl: "gap-xl",
  xxl: "gap-xxl",
  xxxl: "gap-xxxl",
};

export const pxClasses: Record<GapToken, string> = {
  none: "px-0",
  hair: "px-hair",
  xxxs: "px-xxxs",
  tight: "px-tight",
  xxs: "px-xxs",
  snug: "px-snug",
  xs: "px-xs",
  s: "px-s",
  m: "px-m",
  l: "px-l",
  xl: "px-xl",
  xxl: "px-xxl",
  xxxl: "px-xxxl",
};

export const pyClasses: Record<GapToken, string> = {
  none: "py-0",
  hair: "py-hair",
  xxxs: "py-xxxs",
  tight: "py-tight",
  xxs: "py-xxs",
  snug: "py-snug",
  xs: "py-xs",
  s: "py-s",
  m: "py-m",
  l: "py-l",
  xl: "py-xl",
  xxl: "py-xxl",
  xxxl: "py-xxxl",
};

export const mtClasses: Record<GapToken, string> = {
  none: "mt-0",
  hair: "mt-hair",
  xxxs: "mt-xxxs",
  tight: "mt-tight",
  xxs: "mt-xxs",
  snug: "mt-snug",
  xs: "mt-xs",
  s: "mt-s",
  m: "mt-m",
  l: "mt-l",
  xl: "mt-xl",
  xxl: "mt-xxl",
  xxxl: "mt-xxxl",
};

export const alignClasses: Record<AlignValue, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

export const justifyClasses: Record<JustifyValue, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};
