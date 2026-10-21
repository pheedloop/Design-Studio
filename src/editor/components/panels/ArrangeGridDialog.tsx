import { useState } from "react";
import { Button } from "@/components/Button";
import {
  Dialog,
  NumberInput,
  SectionLabel,
  Select,
} from "@/editor/components/ui";
import { useT } from "@/editor/i18n";
import { Row } from "@/components/Row";
import { Stack } from "@/components/Stack";

export interface ArrangeGridSettings {
  cols: number;
  gapX: number;
  gapY: number;
  byName: boolean;
}

interface ArrangeGridDialogProps {
  elementCount: number;
  initial: ArrangeGridSettings | null;
  onConfirm: (settings: ArrangeGridSettings) => void;
  onClose: () => void;
}

export function ArrangeGridDialog({
  elementCount,
  initial,
  onConfirm,
  onClose,
}: ArrangeGridDialogProps) {
  const t = useT();
  const [cols, setCols] = useState(
    Math.min(initial?.cols ?? Math.ceil(Math.sqrt(elementCount)), elementCount),
  );
  const [gapX, setGapX] = useState(initial?.gapX ?? 10);
  const [gapY, setGapY] = useState(initial?.gapY ?? 10);
  const [byName, setByName] = useState(initial?.byName ?? false);

  const rows = Math.ceil(elementCount / Math.max(1, cols));

  return (
    <Dialog
      title={t("editor.dialog.arrangeGrid")}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" color="neutral" onClick={onClose}>
            {t("common.action.cancel")}
          </Button>
          <Button
            variant="solid"
            color="primary"
            onClick={() => {
              onConfirm({ cols, gapX, gapY, byName });
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

        <Stack gap="tight">
          <SectionLabel>{t("editor.field.order")}</SectionLabel>
          <Select
            aria-label={t("editor.field.order")}
            value={byName ? "name" : "position"}
            onChange={e => setByName(e.target.value === "name")}
          >
            <option value="position">{t("editor.gridOrder.position")}</option>
            <option value="name">{t("editor.gridOrder.name")}</option>
          </Select>
        </Stack>
      </Stack>
    </Dialog>
  );
}
