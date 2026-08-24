import type { ReactNode } from "react";

export function SidebarRow({
  label,
  icon,
  shortcut,
  badge,
  isActive = false,
  disabled = false,
  title,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  shortcut?: string;
  /** Takes the shortcut's place when present — e.g. a tier trophy. */
  badge?: ReactNode;
  isActive?: boolean;
  /** Greys the row out and ignores clicks. */
  disabled?: boolean;
  title?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      className={[
        "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors",
        disabled
          ? "text-gray-300 cursor-not-allowed"
          : isActive
            ? "bg-primary-600 text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800",
      ].join(" ")}
    >
      <span className="shrink-0 flex items-center w-4">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge ??
        (shortcut && (
          <span
            className={[
              "text-xs font-mono",
              isActive ? "text-primary-200" : "text-gray-400",
            ].join(" ")}
          >
            {shortcut}
          </span>
        ))}
    </button>
  );
}
