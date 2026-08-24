// Demo chrome stays untranslated on purpose — it is the visual boundary between
// library strings and host strings.

import type { ReactNode } from "react";

export function ChromeToggle({
  active,
  title,
  className,
  onClick,
  children,
}: {
  active: boolean;
  title?: string;
  className?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={[
        "px-2 py-0.5 rounded cursor-pointer transition-colors",
        active ? "bg-white/15 text-white" : "text-gray-500 hover:text-gray-300",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
