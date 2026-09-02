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
      className={`flex items-center justify-between w-full px-3 py-1.5 text-xs transition-colors ${
        disabled
          ? "text-text-disabled cursor-default"
          : danger
            ? "text-red-600 hover:bg-red-50 cursor-pointer"
            : "text-text-body hover:bg-gray-100 cursor-pointer"
      }`}
    >
      <span>{label}</span>
      {premium ? (
        <span className="ml-6 flex items-center">
          <TrophyIcon size={12} />
        </span>
      ) : (
        shortcut && (
          <span
            className={`ml-6 ${disabled ? "text-text-disabled" : "text-text-subtle"}`}
          >
            {shortcut}
          </span>
        )
      )}
    </button>
  );
}
