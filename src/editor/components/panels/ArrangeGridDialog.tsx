import { useState } from "react";
import { Button } from "@/components/Button";
import { Dialog, NumberInput, SectionLabel } from "@/editor/components/ui";
import { useT } from "@/editor/i18n";

interface ArrangeGridDialogProps {
  elementCount: number;
  onConfirm: (cols: number, gapX: number, gapY: number) => void;
  onClose: () => void;
}

export function ArrangeGridDialog({
  elementCount,
  onConfirm,
  onClose,
}: ArrangeGridDialogProps) {
  const t = useT();
  const defaultCols = Math.ceil(Math.sqrt(elementCount));
  const [cols, setCols] = useState(defaultCols);
  const [gapX, setGapX] = useState(10);
  const [gapY, setGapY] = useState(10);

  const rows = Math.ceil(elementCount / Math.max(1, cols));

  return (
    <Dialog
      title={t("editor.dialog.arrangeGrid")}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" color="neutral" onClick={onClose}>
            {t("editor.action.cancel")}
          </Button>
          <Button
            variant="solid"
            color="primary"
            onClick={() => {
              onConfirm(cols, gapX, gapY);
              onClose();
            }}
          >
            {t("editor.action.apply")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-s p-4">
        <p className="text-xs text-text-caption">
          {t("editor.selection.count", { count: elementCount })}
        </p>

        <div className="flex gap-s">
          <div className="flex flex-col gap-tight flex-1">
            <SectionLabel>{t("editor.field.columns")}</SectionLabel>
            <NumberInput
              value={cols}
              onChange={v =>
                setCols(Math.max(1, Math.min(elementCount, Math.round(v))))
              }
            />
          </div>
          <div className="flex flex-col gap-tight flex-1">
            <SectionLabel>{t("editor.field.rowsComputed")}</SectionLabel>
            <div className="flex items-center h-[30px] px-2 text-xs text-text-subtle bg-surface-neutral border border-border-neutral-light rounded">
              {rows}
            </div>
          </div>
        </div>

        <div className="flex gap-s">
          <div className="flex flex-col gap-tight flex-1">
            <SectionLabel>{t("editor.field.horizontalGapPx")}</SectionLabel>
            <NumberInput value={gapX} onChange={v => setGapX(Math.max(0, v))} />
          </div>
          <div className="flex flex-col gap-tight flex-1">
            <SectionLabel>{t("editor.field.verticalGapPx")}</SectionLabel>
            <NumberInput value={gapY} onChange={v => setGapY(Math.max(0, v))} />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
