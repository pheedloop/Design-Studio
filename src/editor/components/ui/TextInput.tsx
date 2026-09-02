import type { InputHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ className, ...props }: TextInputProps) {
  return (
    <input
      type="text"
      className={[
        "w-full px-xxs py-xxxs text-xs border border-border-neutral-light rounded bg-white disabled:bg-surface-neutral disabled:text-text-subtle",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
