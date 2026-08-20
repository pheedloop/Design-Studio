import type { Legend } from "@/types";
import { useT } from "@/editor/i18n";

interface LegendCanvasOverlayProps {
  legend: Legend;
}

export function LegendCanvasOverlay({ legend }: LegendCanvasOverlayProps) {
  const t = useT();
  const visibleEntries = legend.entries.filter(e => e.visible);

  if (!legend.visible || visibleEntries.length === 0) return null;

  return (
    <div className="absolute bottom-4 right-4 z-10 pointer-events-none select-none">
      <div className="bg-white border border-gray-200 rounded shadow-sm px-3 py-2 flex flex-col gap-1.5">
        {visibleEntries.map(entry => (
          <div key={entry.id} className="flex items-center gap-2">
            <span
              className="shrink-0 rounded-sm border border-gray-300"
              style={{ width: 12, height: 12, background: entry.color }}
            />
            <span className="text-xs text-gray-700 leading-none">
              {entry.label || (
                <em className="text-gray-400">{t("common.unlabeled")}</em>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
