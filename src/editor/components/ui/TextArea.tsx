import type { TextareaHTMLAttributes } from "react";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextArea({ className, ...props }: TextAreaProps) {
  return (
    <textarea
      className={[
        "w-full px-xxs py-xxxs text-xs border border-border-neutral-light rounded bg-white resize-none disabled:bg-surface-neutral disabled:text-text-subtle",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
