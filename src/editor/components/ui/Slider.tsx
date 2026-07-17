import type { InputHTMLAttributes } from "react";

type SliderProps = InputHTMLAttributes<HTMLInputElement>;

export function Slider({ className, ...props }: SliderProps) {
  return (
    <input
      type="range"
      className={["accent-primary-600 cursor-pointer", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
