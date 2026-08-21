import type { CalibrationState } from "@/editor/hooks/useCalibration";
import type { ScaleCalibration, Unit } from "@/types";
import { useLocale, useT } from "@/editor/i18n";
import { formatNumber } from "@/i18n/format";
import { unitLabel } from "@/utils/unitConversion";
import { CalibrationPointMarker } from "./CalibrationPointMarker";
import { CalibrationLine } from "./CalibrationLine";

interface CalibrationPreviewProps {
  calibrationState: CalibrationState;
  /** Persisted calibration data (shown when re-entering calibration mode) */
  existingCalibration?: ScaleCalibration;
  scale: number;
}

export function CalibrationPreview({
  calibrationState,
  existingCalibration,
  scale,
}: CalibrationPreviewProps) {
  const t = useT();
  const locale = useLocale();
  const { step, p1, p2, mousePos } = calibrationState;
  const inverseScale = 1 / scale;
  const measurement = (value: number, unit: Unit, fractionDigits: number) =>
    t("common.measurement", {
      value: formatNumber(value, locale, fractionDigits),
      unit: unitLabel(unit, t),
    });

  // Show persisted calibration when idle (tool just activated, before picking)
  if (step === "idle" && existingCalibration) {
    return (
      <CalibrationLine
        p1={existingCalibration.p1}
        p2={existingCalibration.p2}
        inverseScale={inverseScale}
        label={measurement(
          existingCalibration.distance,
          existingCalibration.unit,
          1,
        )}
        dimmed
      />
    );
  }

  // Nothing to show yet
  if (!p1) return null;

  // While picking p2: line from p1 to mouse cursor
  if (step === "pickingP2" && mousePos) {
    return (
      <CalibrationLine
        p1={p1}
        p2={mousePos}
        inverseScale={inverseScale}
        dashed
      />
    );
  }

  // Both points placed (confirming step): solid line with distance label
  if (p2) {
    const dist = Math.round(Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2));
    return (
      <CalibrationLine
        p1={p1}
        p2={p2}
        inverseScale={inverseScale}
        label={measurement(dist, "px", 0)}
      />
    );
  }

  // Only p1 placed, waiting for first move
  return <CalibrationPointMarker point={p1} inverseScale={inverseScale} />;
}

// --- Sub-components ---
