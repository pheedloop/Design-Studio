import { OCCUPANCY_LEGEND } from "@/seatviewer/logic";
import { useT } from "@/seatviewer/i18n";
import { Stack } from "@/components/Stack";

/**
 * Key for the table occupancy colors, pinned to the bottom-right of the canvas.
 * Swatch colors match the table fills exactly (both come from logic.ts).
 */
export function OccupancyLegend() {
  const t = useT();

  return (
    <Stack
      gap="tight"
      className="absolute right-3 bottom-3 z-10 bg-surface-contrast/95 border border-border-neutral-light rounded-lg px-xs py-snug shadow-[0_4px_16px_rgba(38,59,90,0.1)] backdrop-blur-sm"
    >
      <span className="text-[10px] tracking-wider uppercase text-text-subtle font-semibold">
        {t("seatviewer.legend.title")}
      </span>
      {OCCUPANCY_LEGEND.map(item => (
        <span
          key={item.level}
          className="flex items-center gap-xxs text-xs text-text-caption"
        >
          <span
            className="size-2.5 rounded-sm border border-black/10 shrink-0"
            style={{ backgroundColor: item.color }}
          />
          {t(item.labelKey)}
        </span>
      ))}
    </Stack>
  );
}
