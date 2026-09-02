import { InlineRenameField } from "@/components/InlineRenameField";
import { useT } from "./i18n";

export function BadgeSidebarHeader({
  name,
  onNameChange,
}: {
  name: string;
  onNameChange: (name: string) => void;
}) {
  const t = useT();

  return (
    <div className="px-3 h-[43px] shrink-0 border-b border-border-neutral-light flex items-center gap-xxs min-w-0">
      <InlineRenameField
        value={name}
        onCommit={onNameChange}
        title={t("badgeeditor.sidebar.clickToRename")}
      />
    </div>
  );
}
