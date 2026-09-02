import type { InputHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ className, ...props }: TextInputProps) {
  return (
    <input
      type="text"
      className={[
        "w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white disabled:bg-surface-neutral disabled:text-gray-400",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
