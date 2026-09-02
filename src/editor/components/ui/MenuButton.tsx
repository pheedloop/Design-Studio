import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface MenuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  open?: boolean;
  children: ReactNode;
}

const base =
  "flex items-center gap-xxxs px-3 h-10 text-sm cursor-pointer transition-colors";
const openStyle = "text-text-heading bg-surface-neutral";
const closedStyle = "text-text-subtle hover:text-text-body";

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
