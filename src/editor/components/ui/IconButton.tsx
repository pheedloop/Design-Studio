import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const base =
  "flex items-center justify-center rounded-lg cursor-pointer transition-colors disabled:cursor-not-allowed";

const sizes = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-10 h-10",
};

const activeStyle = "bg-primary-600 text-white hover:bg-primary-700";
const inactiveStyle =
  "text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:text-gray-300 disabled:hover:bg-transparent";

export function IconButton({
  active,
  size = "md",
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={[
        base,
        sizes[size],
        active ? activeStyle : inactiveStyle,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
