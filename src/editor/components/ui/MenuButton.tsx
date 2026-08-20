import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface MenuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  open?: boolean;
  children: ReactNode;
}

const base =
  "flex items-center gap-1 px-3 h-10 text-sm cursor-pointer transition-colors";
const openStyle = "text-gray-800 bg-gray-100";
const closedStyle = "text-gray-400 hover:text-gray-600";

export function MenuButton({
  open,
  className,
  children,
  ...props
}: MenuButtonProps) {
  return (
    <button
      type="button"
      className={[base, open ? openStyle : closedStyle, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
