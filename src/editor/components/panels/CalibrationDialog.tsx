import { useState } from "react";
import { Button, Dialog, NumberInput, Select, SectionLabel } from "../ui";
import type { Unit } from "../../../types";
import { useT } from "../../i18n";

type DisplayUnit = Unit | "in";

interface CalibrationDialogProps {
  pixelDistance: number;
  existingUnit?: Unit;
  onConfirm: (distance: number, unit: Unit) => void;
  onClose: () => void;
}

/** Convert display-unit value to base Unit + distance for storage. */
function toBaseUnit(distance: number, displayUnit: DisplayUnit): { distance: number; unit: Unit } {
  if (displayUnit === "in") {
    return { distance: distance / 12, unit: "ft" };
  }
  return { distance, unit: displayUnit };
}

export function CalibrationDialog({
  pixelDistance,
  existingUnit,
  onConfirm,
  onClose,
}: CalibrationDialogProps) {
  const t = useT();
  const [distance, setDistance] = useState<number>(0);
  const [displayUnit, setDisplayUnit] = useState<DisplayUnit>(
    existingUnit && existingUnit !== "px" ? existingUnit : "ft",
  );

  const canConfirm = distance > 0;

  const handleConfirm = () => {
    if (!canConfirm) return;
    const { distance: baseDistance, unit } = toBaseUnit(distance, displayUnit);
    onConfirm(baseDistance, unit);
  };

  return (
    <Dialog
      title={t("editor.dialog.setScale")}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" color="neutral" onClick={onClose}>
            {t("editor.action.cancel")}
          </Button>
          <Button
            variant="solid"
            color="primary"
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            {t("editor.action.apply")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 p-4">
        <p className="text-xs text-gray-500">
          You selected two points{" "}
          <span className="font-medium text-gray-700">
            {Math.round(pixelDistance)} px
          </span>{" "}
          apart. Enter the real-world distance between them.
        </p>

        <div className="flex gap-3 items-end">
          <div className="flex flex-col gap-1.5 flex-1">
            <SectionLabel>{t("editor.field.distance")}</SectionLabel>
            <NumberInput
              value={distance}
              onChange={(v) => setDistance(Math.max(0, v))}
              step={1}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <SectionLabel>{t("editor.field.unit")}</SectionLabel>
            <Select
              value={displayUnit}
              onChange={(e) => setDisplayUnit(e.target.value as DisplayUnit)}
            >
              <option value="ft">{t("editor.unit.feet")}</option>
              <option value="in">{t("editor.unit.inches")}</option>
              <option value="m">{t("editor.unit.meters")}</option>
            </Select>
          </div>
        </div>

        {displayUnit === "in" && distance > 0 && (
          <p className="text-[11px] text-gray-400">
            = {(distance / 12).toFixed(2)} ft
          </p>
        )}
      </div>
    </Dialog>
  );
}
