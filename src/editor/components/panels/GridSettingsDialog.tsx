import { useState } from "react";
import { Button } from "@/components/Button";
import {
  Dialog,
  Slider,
  SectionLabel,
  NumberInput,
  ColorSwatch,
} from "@/editor/components/ui";
import { useT } from "@/editor/i18n";

export interface GridSettings {
  showGrid: boolean;
  gridSpacing: number;
  snapToGrid: boolean;
  gridColor: string;
  gridOpacity: number;
}

interface GridSettingsDialogProps {
  settings: GridSettings;
  onSave: (settings: GridSettings) => void;
  onClose: () => void;
}

export function GridSettingsDialog({
  settings,
  onSave,
  onClose,
}: GridSettingsDialogProps) {
  const t = useT();
  const [local, setLocal] = useState<GridSettings>({ ...settings });

  return (
    <Dialog
      title={t("editor.dialog.gridSettings")}
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
              onSave(local);
              onClose();
            }}
          >
            {t("editor.action.apply")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1.5">
          <SectionLabel>{t("editor.field.spacingPx")}</SectionLabel>
          <NumberInput
            value={local.gridSpacing}
            onChange={v =>
              setLocal(s => ({ ...s, gridSpacing: Math.max(5, v) }))
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <SectionLabel>{t("editor.field.color")}</SectionLabel>
          <ColorSwatch
            label=""
            value={local.gridColor}
            onChange={c => setLocal(s => ({ ...s, gridColor: c }))}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <SectionLabel>{t("editor.field.opacity")}</SectionLabel>
          <div className="flex items-center gap-2">
            <Slider
              min={5}
              max={100}
              value={Math.round(local.gridOpacity * 100)}
              onChange={e =>
                setLocal(s => ({
                  ...s,
                  gridOpacity: Number(e.target.value) / 100,
                }))
              }
              className="flex-1"
            />
            <span className="text-xs text-gray-400 w-8 text-right">
              {Math.round(local.gridOpacity * 100)}%
            </span>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
