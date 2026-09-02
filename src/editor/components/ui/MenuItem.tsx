import { useT } from "@/editor/i18n";
import { TrophyIcon } from "./TrophyIcon";
import type { MenuItemConfig } from "./DropdownMenu";

export function MenuItem({
  label,
  shortcut,
  disabled,
  danger,
  premium,
  onClick,
}: MenuItemConfig) {
  const t = useT();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled && premium ? t("editor.premiumFeature") : undefined}
      className={`flex items-center justify-between w-full px-xs py-tight text-xs transition-colors ${
        disabled
          ? "text-text-disabled cursor-default"
          : danger
            ? "text-red-600 hover:bg-red-50 cursor-pointer"
            : "text-text-body hover:bg-surface-neutral cursor-pointer"
      }`}
    >
      <span>{label}</span>
      {premium ? (
        <span className="ml-m flex items-center">
          <TrophyIcon size={12} />
        </span>
      ) : (
        shortcut && (
          <span
            className={`ml-m ${disabled ? "text-text-disabled" : "text-text-subtle"}`}
          >
            {shortcut}
          </span>
        )
      )}
    </button>
  );
}
