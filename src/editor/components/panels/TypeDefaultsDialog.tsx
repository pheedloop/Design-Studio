import type { TypeStyles, ElementTypeDefaults } from "@/types";
import { Dialog } from "@/editor/components/ui";
import { TypeDefaultsPanel } from "./TypeDefaultsPanel";
import { useT } from "@/editor/i18n";

interface TypeDefaultsDialogProps {
  typeStyles: TypeStyles;
  /** Object type keys to show defaults for (the active product's categories). */
  typeKeys: string[];
  onUpdateTypeStyles: (
    key: string,
    updates: Partial<ElementTypeDefaults>,
  ) => void;
  onClose: () => void;
}

export function TypeDefaultsDialog({
  typeStyles,
  typeKeys,
  onUpdateTypeStyles,
  onClose,
}: TypeDefaultsDialogProps) {
  const t = useT();
  return (
    <Dialog
      title={t("editor.dialog.elementDefaults")}
      onClose={onClose}
      width="400px"
      maxHeight="80vh"
    >
      <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
        <p className="text-xs text-gray-500 leading-snug">
          {t("editor.dialog.elementDefaultsHint")}
        </p>
        <TypeDefaultsPanel
          typeStyles={typeStyles}
          typeKeys={typeKeys}
          onUpdateTypeStyles={onUpdateTypeStyles}
        />
      </div>
    </Dialog>
  );
}
