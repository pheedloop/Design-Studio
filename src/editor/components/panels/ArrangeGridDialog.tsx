import { useState } from "react";
import { Button } from "@/components/Button";
import { Dialog, NumberInput, SectionLabel } from "@/editor/components/ui";
import { useT } from "@/editor/i18n";
import { Row } from "@/components/Row";
import { Stack } from "@/components/Stack";

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
      <Stack gap="s" className="p-s">
        <p className="text-xs text-text-caption">
          {t("editor.selection.count", { count: elementCount })}
        </p>

        <Row gap="s">
          <Stack gap="tight" className="flex-1">
            <SectionLabel>{t("editor.field.columns")}</SectionLabel>
            <NumberInput
              value={cols}
              onChange={v =>
                setCols(Math.max(1, Math.min(elementCount, Math.round(v))))
              }
            />
          </Stack>
          <Stack gap="tight" className="flex-1">
            <SectionLabel>{t("editor.field.rowsComputed")}</SectionLabel>
            <Row
              align="center"
              px="xxs"
              className="h-[30px] text-xs text-text-subtle bg-surface-neutral border border-border-neutral-light rounded"
            >
              {rows}
            </Row>
          </Stack>
        </Row>

        <Row gap="s">
          <Stack gap="tight" className="flex-1">
            <SectionLabel>{t("editor.field.horizontalGapPx")}</SectionLabel>
            <NumberInput value={gapX} onChange={v => setGapX(Math.max(0, v))} />
          </Stack>
          <Stack gap="tight" className="flex-1">
            <SectionLabel>{t("editor.field.verticalGapPx")}</SectionLabel>
            <NumberInput value={gapY} onChange={v => setGapY(Math.max(0, v))} />
          </Stack>
        </Row>
      </Stack>
    </Dialog>
  );
}
