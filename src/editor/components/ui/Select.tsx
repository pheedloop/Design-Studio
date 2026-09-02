import type { SelectHTMLAttributes, ReactNode } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={[
        "px-xxs py-xxxs text-xs border border-border-neutral-light rounded bg-white disabled:bg-surface-neutral disabled:text-text-subtle",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </select>
  );
}
