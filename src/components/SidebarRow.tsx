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
  badge?: ReactNode;
  isActive?: boolean;
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
          ? "text-text-disabled cursor-not-allowed"
          : isActive
            ? "bg-primary-600 text-white"
            : "text-text-body hover:bg-surface-neutral hover:text-text-heading",
      ].join(" ")}
    >
      <span className="shrink-0 flex items-center w-4">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge ??
        (shortcut && (
          <span
            className={[
              "text-xs font-mono",
              isActive ? "text-primary-200" : "text-text-subtle",
            ].join(" ")}
          >
            {shortcut}
          </span>
        ))}
    </button>
  );
}
