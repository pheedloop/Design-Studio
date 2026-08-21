import { Group, Line, Rect, Text } from "react-konva";
import type { CalibrationState } from "@/editor/hooks/useCalibration";
import type { ScaleCalibration, Unit } from "@/types";
import { useLocale, useT } from "@/editor/i18n";
import { formatNumber } from "@/i18n/format";
import { unitLabel } from "@/utils/unitConversion";
import { CalibrationPointMarker } from "./CalibrationPointMarker";

interface CalibrationPreviewProps {
  calibrationState: CalibrationState;
  /** Persisted calibration data (shown when re-entering calibration mode) */
  existingCalibration?: ScaleCalibration;
  scale: number;
}
const LINE_COLOR = "#2563eb";
const LINE_DASH = [6, 4];

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

function CalibrationLine({
  p1,
  p2,
  inverseScale,
  label,
  dashed,
  dimmed,
}: {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  inverseScale: number;
  label?: string;
  dashed?: boolean;
  dimmed?: boolean;
}) {
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const opacity = dimmed ? 0.4 : 0.9;

  return (
    <Group listening={false}>
      <Line
        points={[p1.x, p1.y, p2.x, p2.y]}
        stroke={LINE_COLOR}
        strokeWidth={2 * inverseScale}
        dash={dashed ? LINE_DASH.map(d => d * inverseScale) : undefined}
        opacity={opacity}
        listening={false}
      />
      <CalibrationPointMarker
        point={p1}
        inverseScale={inverseScale}
        dimmed={dimmed}
      />
      <CalibrationPointMarker
        point={p2}
        inverseScale={inverseScale}
        dimmed={dimmed}
      />
      {label && (
        <>
          <Rect
            x={midX - label.length * 4 * inverseScale}
            y={midY - 10 * inverseScale}
            width={label.length * 8 * inverseScale}
            height={18 * inverseScale}
            fill="#fff"
            cornerRadius={3 * inverseScale}
            opacity={0.9}
            listening={false}
          />
          <Text
            x={midX - label.length * 4 * inverseScale}
            y={midY - 7 * inverseScale}
            width={label.length * 8 * inverseScale}
            text={label}
            fontSize={11 * inverseScale}
            fill="#1e40af"
            fontFamily="system-ui, sans-serif"
            align="center"
            listening={false}
          />
        </>
      )}
    </Group>
  );
}
