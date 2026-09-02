import type { TypeStyles, ElementTypeDefaults } from "@/types";
import { Dialog } from "@/editor/components/ui";
import { Stack } from "@/components/Stack";
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
      <Stack gap="xs" className="overflow-y-auto flex-1 p-s">
        <p className="text-xs text-text-caption leading-snug">
          {t("editor.dialog.elementDefaultsHint")}
        </p>
        <TypeDefaultsPanel
          typeStyles={typeStyles}
          typeKeys={typeKeys}
          onUpdateTypeStyles={onUpdateTypeStyles}
        />
      </Stack>
    </Dialog>
  );
}
