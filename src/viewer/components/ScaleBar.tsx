import type { Dimensions } from "../../types";
import { unitLabel } from "../../utils/unitConversion";
import { formatNumber } from "../../i18n/format";
import { useLocale, useT } from "../i18n";

interface ScaleBarProps {
  dimensions: Dimensions;
  scale: number;
}

/** Pick a "nice" round distance for the bar label. */
function niceDistance(rough: number): number {
  if (rough <= 0) return 1;
  const exponent = Math.floor(Math.log10(rough));
  const fraction = rough / 10 ** exponent;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * 10 ** exponent;
}

export function ScaleBar({ dimensions, scale }: ScaleBarProps) {
  // Above the early return below.
  const t = useT();
  const locale = useLocale();

  if (dimensions.unit === "px" || dimensions.pixelsPerUnit <= 0) return null;

  // Target ~120px of screen space for the bar
  const targetScreenPx = 120;
  const pxPerUnit = scale * dimensions.pixelsPerUnit;
  const roughUnits = targetScreenPx / pxPerUnit;
  const niceUnits = niceDistance(roughUnits);
  const barWidthPx = niceUnits * pxPerUnit;

  return (
    <div
      className="absolute bottom-4 left-4 z-10 flex flex-col items-start gap-0.5 pointer-events-none select-none"
    >
      <span className="text-[10px] font-medium text-gray-600 bg-white/80 px-1 rounded">
        {t("common.measurement", {
          value: formatNumber(niceUnits, locale, Number.isInteger(niceUnits) ? 0 : 1),
          unit: unitLabel(dimensions.unit, t),
        })}
      </span>
      <div
        className="h-1.5 bg-gray-700/70 rounded-sm"
        style={{ width: barWidthPx }}
      >
        {/* End caps */}
        <div className="flex justify-between h-full">
          <div className="w-px h-full bg-gray-700/70" />
          <div className="w-px h-full bg-gray-700/70" />
        </div>
      </div>
    </div>
  );
}
