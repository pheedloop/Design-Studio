import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  variant?: "filled" | "bare";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const base = "flex items-center justify-center";

// Each variant carries its own full shape rather than sharing a base, so
// `filled` still emits the exact class string it did before `bare` existed.
const shapes = {
  filled:
    "rounded-lg cursor-pointer transition-colors disabled:cursor-not-allowed",
  bare: "rounded cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-default",
};

const sizes = {
  filled: { sm: "w-7 h-7", md: "w-9 h-9", lg: "w-10 h-10" },
  bare: { sm: "p-0.5", md: "p-1", lg: "p-1.5" },
};

const states = {
  filled: {
    active: "bg-primary-600 text-white hover:bg-primary-700",
    inactive:
      "text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:text-gray-300 disabled:hover:bg-transparent",
  },
  bare: {
    active: "text-primary-600 bg-primary-50",
    inactive: "text-gray-400 hover:text-text-body",
  },
};

export function IconButton({
  active,
  variant = "filled",
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
        shapes[variant],
        sizes[variant][size],
        active ? states[variant].active : states[variant].inactive,
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
