import { useState } from "react";
import type { Legend } from "@/types";
import { PiCaretUp, PiCaretDown } from "react-icons/pi";
import { useT } from "@/viewer/i18n";

interface ViewerLegendProps {
  legend: Legend;
}

export function ViewerLegend({ legend }: ViewerLegendProps) {
  const [collapsed, setCollapsed] = useState(false);
  const t = useT();

  const visibleEntries = legend.entries.filter(e => e.visible);

  if (!legend.visible || visibleEntries.length === 0) return null;

  return (
    <div className="absolute bottom-4 right-4 z-20 select-none">
      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden min-w-[120px]">
        {!collapsed && (
          <div className="px-3 py-2 border-b border-gray-100 flex flex-col gap-1.5">
            {visibleEntries.map(entry => (
              <div key={entry.id} className="flex items-center gap-2">
                <span
                  className="shrink-0 rounded-sm border border-gray-300"
                  style={{ width: 12, height: 12, background: entry.color }}
                />
                <span className="text-xs text-text-body leading-none whitespace-nowrap">
                  {entry.label || (
                    <em className="text-text-subtle">
                      {t("common.unlabeled")}
                    </em>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
        <button
          className="flex items-center justify-between gap-4 px-3 py-1.5 w-full cursor-pointer hover:bg-surface-neutral transition-colors"
          onClick={() => setCollapsed(c => !c)}
        >
          <span className="text-xs font-medium text-text-body">
            {t("common.legend")}
          </span>
          {collapsed ? (
            <PiCaretUp size={11} className="text-text-subtle" />
          ) : (
            <PiCaretDown size={11} className="text-text-subtle" />
          )}
        </button>
      </div>
    </div>
  );
}
