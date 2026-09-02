import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "ghost";
  color?: "primary" | "neutral" | "negative" | "positive";
  size?: "sm" | "md" | "lg";
  active?: boolean;
  children: ReactNode;
}

const base =
  "inline-flex items-center justify-center rounded font-medium cursor-pointer transition-colors disabled:cursor-not-allowed";

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

const styles = {
  solid: {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 disabled:bg-surface-muted disabled:text-text-subtle",
    neutral:
      "bg-surface-muted text-text-body hover:bg-surface-muted-hover disabled:bg-surface-neutral disabled:text-text-subtle",
    negative:
      "bg-red-600 text-white hover:bg-red-700 disabled:bg-surface-muted disabled:text-text-subtle",
    positive:
      "bg-green-600 text-white hover:bg-green-700 disabled:bg-surface-muted disabled:text-text-subtle",
  },
  outline: {
    primary:
      "border border-primary-200 text-primary-600 hover:bg-primary-50 disabled:border-border-neutral-light disabled:text-text-subtle disabled:hover:bg-transparent",
    neutral:
      "border border-border-neutral-light text-text-body hover:bg-surface-neutral disabled:border-border-neutral-light disabled:text-text-subtle disabled:hover:bg-transparent",
    negative:
      "border border-red-200 text-red-600 hover:bg-red-50 disabled:border-border-neutral-light disabled:text-text-subtle disabled:hover:bg-transparent",
    positive:
      "border border-green-200 text-green-600 hover:bg-green-50 disabled:border-border-neutral-light disabled:text-text-subtle disabled:hover:bg-transparent",
  },
  ghost: {
    primary:
      "text-primary-600 hover:bg-primary-50 disabled:text-text-subtle disabled:hover:bg-transparent",
    neutral:
      "text-text-body hover:bg-surface-neutral disabled:text-text-subtle disabled:hover:bg-transparent",
    negative:
      "text-red-600 hover:bg-red-50 disabled:text-text-subtle disabled:hover:bg-transparent",
    positive:
      "text-green-600 hover:bg-green-50 disabled:text-text-subtle disabled:hover:bg-transparent",
  },
};

const activeStyles = {
  primary:
    "bg-primary-600 text-white border border-primary-600 hover:bg-primary-600",
  neutral: "bg-gray-700 text-white border border-gray-700 hover:bg-gray-700",
  negative: "bg-red-600 text-white border border-red-600 hover:bg-red-600",
  positive:
    "bg-green-600 text-white border border-green-600 hover:bg-green-600",
};

export function Button({
  variant = "solid",
  color = "neutral",
  size = "sm",
  active,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={[
        base,
        sizes[size],
        active ? activeStyles[color] : styles[variant][color],
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
