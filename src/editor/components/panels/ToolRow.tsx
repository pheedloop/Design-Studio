import type React from "react";
import type { StringKey } from "@/editor/i18n";
import { useT } from "@/editor/i18n";
import { TrophyIcon } from "@/editor/components/ui";
import { SidebarRow } from "@/components/SidebarRow";

export interface ToolDef<T extends string> {
  id: T;
  labelKey: StringKey;
  shortcut?: string;
  icon: React.ReactNode;
}

/** Resolves a tool's string key and tier state onto the shared row. */
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
    <SidebarRow
      label={t(tool.labelKey)}
      icon={tool.icon}
      shortcut={tool.shortcut}
      badge={locked ? <TrophyIcon size={14} /> : undefined}
      isActive={isActive}
      disabled={disabled}
      title={disabled ? t("editor.premiumFeature") : undefined}
      onClick={onClick}
    />
  );
}
