import type { ComponentType, ReactNode, SVGProps } from "react";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "color"> {
  size?: number | string;
  color?: string;
}

export type IconComponent = ComponentType<IconProps>;

// The PheedLoop glyphs run to the edge of their box; the inset gives them the
// margin the rest of the UI was sized around.
const INSET = 1;

function inset(viewBox: string): string {
  const [x, y, w, h] = viewBox.split(/\s+/).map(Number);
  return `${x - INSET} ${y - INSET} ${w + 2 * INSET} ${h + 2 * INSET}`;
}

export function SvgIcon({
  viewBox,
  size = "1em",
  color = "currentColor",
  style,
  children,
  ...props
}: IconProps & { viewBox: string; children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={inset(viewBox)}
      fill="none"
      style={{ color, ...style }}
      {...props}
    >
      {children}
    </svg>
  );
}
