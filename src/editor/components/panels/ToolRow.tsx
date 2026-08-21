import type React from "react";
import type { StringKey } from "@/editor/i18n";
import { useT } from "@/editor/i18n";
import { TrophyIcon } from "@/editor/components/ui";

export interface ToolDef<T extends string> {
  id: T;
  labelKey: StringKey;
  shortcut?: string;
  icon: React.ReactNode;
}

export function ToolRow<T extends string>({
  tool,
  isActive,
  onClick,
  disabled = false,
  locked = false,
}: {
  tool: ToolDef<T>;
  isActive: boolean;
  onClick: () => void;
  /** When true, the tool is greyed out and clicks are ignored. */
  disabled?: boolean;
  /** When true, show the premium trophy badge (implies disabled styling). */
  locked?: boolean;
}) {
  const t = useT();

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={disabled ? t("editor.premiumFeature") : undefined}
      className={[
        "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors",
        disabled
          ? "text-gray-300 cursor-not-allowed"
          : isActive
            ? "bg-primary-600 text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800",
      ].join(" ")}
    >
      <span className="shrink-0 flex items-center w-4">{tool.icon}</span>
      <span className="flex-1 text-left">{t(tool.labelKey)}</span>
      {locked ? (
        <TrophyIcon size={14} />
      ) : (
        tool.shortcut && (
          <span
            className={[
              "text-xs font-mono",
              isActive ? "text-primary-200" : "text-gray-400",
            ].join(" ")}
          >
            {tool.shortcut}
          </span>
        )
      )}
    </button>
  );
}
