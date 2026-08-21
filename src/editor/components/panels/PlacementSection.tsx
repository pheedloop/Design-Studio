import type React from "react";
import { PiSparkle, PiCaretUp, PiCaretDown } from "react-icons/pi";
import { useT } from "@/editor/i18n";
import { SectionShapeContext } from "./sectionShapeContext";
import { PlacementFilterBar, type StatusFilter } from "./PlacementFilterBar";

export interface PlacementSectionProps {
  title: string;
  iconShape: "rect" | "oval";
  iconColor: string;
  placed: number;
  unplaced: number;
  /** Total unplaced across the full (unfiltered) record pool — used by the sparkle button. */
  totalUnplaced: number;
  isOpen: boolean;
  onToggle: () => void;
  defaultShape: "rect" | "ellipse";
  onDefaultShapeChange: (s: "rect" | "ellipse") => void;
  query: string;
  onQueryChange: (q: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (f: StatusFilter) => void;
  onAutoArrange?: () => void;
  children?: React.ReactNode;
}

export function PlacementSection({
  title,
  placed,
  unplaced,
  totalUnplaced,
  iconShape,
  iconColor,
  isOpen,
  onToggle,
  defaultShape,
  onDefaultShapeChange,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  onAutoArrange,
  children,
}: PlacementSectionProps) {
  const t = useT();
  const total = placed + unplaced;

  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className={[
          "w-full flex items-center gap-2.5 py-2.5 text-left transition-colors border-l-2",
          isOpen
            ? "bg-primary-100 border-primary-500 px-[10px]"
            : "border-transparent px-3 hover:bg-gray-100",
        ].join(" ")}
      >
        <span
          className="shrink-0 w-4 h-4"
          style={{
            backgroundColor: iconColor,
            borderRadius: iconShape === "oval" ? "9999px" : "0px",
            opacity: 0.7,
          }}
        />
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-gray-800 truncate">
            {title}
          </span>
          <span className="block text-xs text-gray-400 tabular-nums">
            {t("editor.placement.counts", { placed, unplaced })}
          </span>
        </span>
        <span
          className={[
            "shrink-0 transition-colors",
            totalUnplaced > 0 && onAutoArrange
              ? "text-amber-400 hover:text-amber-500 cursor-pointer"
              : "text-gray-200 cursor-default",
          ].join(" ")}
          title={
            totalUnplaced > 0
              ? t("editor.placement.autoPlace", { count: totalUnplaced })
              : t("editor.placement.noUnplaced")
          }
          onClick={e => {
            e.stopPropagation();
            if (totalUnplaced > 0) onAutoArrange?.();
          }}
        >
          <PiSparkle size={14} />
        </span>
        <span className="shrink-0 text-gray-400">
          {isOpen ? <PiCaretUp size={12} /> : <PiCaretDown size={12} />}
        </span>
      </button>

      {/* Body */}
      {isOpen && (
        <SectionShapeContext.Provider value={defaultShape}>
          {total === 0 ? (
            <p className="px-3 py-2.5 text-xs text-gray-400 italic">
              {t("editor.placement.noRecords")}
            </p>
          ) : (
            <>
              <PlacementFilterBar
                shape={defaultShape}
                onShapeChange={onDefaultShapeChange}
                query={query}
                onQueryChange={onQueryChange}
                statusFilter={statusFilter}
                onStatusFilterChange={onStatusFilterChange}
              />
              {children}
            </>
          )}
        </SectionShapeContext.Provider>
      )}
    </div>
  );
}
