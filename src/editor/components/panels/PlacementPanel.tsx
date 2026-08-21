import React, { useState, useContext } from "react";
import { PiCaretDown, PiCaretUp, PiSparkle } from "react-icons/pi";
import type {
  PlacementRecords,
  CategoryRecords,
  PlacedRecord,
} from "@/editor/hooks/usePlacementRecords";
import type { PlacementCategory } from "@/editor/placement/types";
import { useT } from "@/editor/i18n";
import type { ElementType } from "@/types";
import {
  PLACEMENT_DRAG_TYPE,
  PLACEMENT_SHAPE_ELLIPSE_TYPE,
  type PlacementRecordRef,
} from "./placementDrag";
import { SectionShapeContext } from "./sectionShapeContext";
import { PlacementFilterBar, type StatusFilter } from "./PlacementFilterBar";

export interface AutoArrangeRecord {
  recordId: string;
  recordName: string;
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

interface SectionProps {
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

function Section({
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
}: SectionProps) {
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

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

function PlacementRow({
  isPlaced,
  recordType,
  recordId,
  children,
}: {
  isPlaced: boolean;
  recordType: ElementType;
  recordId: string;
  children: React.ReactNode;
}) {
  const defaultShape = useContext(SectionShapeContext);

  const handleDragStart = (e: React.DragEvent) => {
    if (isPlaced) {
      e.preventDefault();
      return;
    }
    const ref: PlacementRecordRef = {
      type: recordType,
      id: recordId,
      defaultShape,
    };
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData(PLACEMENT_DRAG_TYPE, JSON.stringify(ref));
    e.dataTransfer.setData("text/plain", JSON.stringify(ref));
    // Encode shape as a MIME type so it can be read during dragover
    if (defaultShape === "ellipse") {
      e.dataTransfer.setData(PLACEMENT_SHAPE_ELLIPSE_TYPE, "1");
    }
  };

  return (
    <div
      draggable={!isPlaced}
      onDragStart={handleDragStart}
      className={[
        "flex items-center gap-3 px-3 py-2.5 border-b border-gray-50 text-sm transition-colors last:border-0",
        isPlaced
          ? "opacity-40 cursor-default"
          : "cursor-grab hover:bg-gray-50 active:cursor-grabbing",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function RecordRow({
  category,
  record,
  isPlaced,
}: {
  category: PlacementCategory;
  record: unknown;
  isPlaced: boolean;
}) {
  const t = useT();
  const secondary = category.getSecondaryLabel?.(record);

  return (
    <PlacementRow
      isPlaced={isPlaced}
      recordType={category.elementType}
      recordId={category.getRecordId(record)}
    >
      <span className="flex-1 text-gray-700 truncate">
        {category.getPrimaryLabel(record)}
        {secondary && (
          <span className="text-gray-400 ml-1 text-xs">· {secondary}</span>
        )}
      </span>
      {isPlaced ? (
        <span className="shrink-0 text-xs font-medium text-green-600">
          {t("editor.placement.placed")}
        </span>
      ) : (
        <span className="shrink-0 text-xs font-medium text-amber-500">
          {t("editor.placement.unplaced")}
        </span>
      )}
    </PlacementRow>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type SectionFilter = { query: string; status: StatusFilter };
const emptyFilter: SectionFilter = { query: "", status: "all" };

interface PlacementPanelProps {
  records: PlacementRecords;
  onAutoArrange: (
    category: PlacementCategory,
    records: AutoArrangeRecord[],
    shape: "rect" | "ellipse",
  ) => void;
}

export function PlacementPanel({
  records,
  onAutoArrange,
}: PlacementPanelProps) {
  // Section state is keyed by category id so it adapts to whatever categories
  // the active product passes in.
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [sectionShapes, setSectionShapes] = useState<
    Record<string, "rect" | "ellipse">
  >({});
  const [sectionFilters, setSectionFilters] = useState<
    Record<string, SectionFilter>
  >({});

  const shapeOf = (id: string) => sectionShapes[id] ?? "rect";
  const filterOf = (id: string) => sectionFilters[id] ?? emptyFilter;

  const updateFilter = (id: string, patch: Partial<SectionFilter>) =>
    setSectionFilters(prev => ({
      ...prev,
      [id]: { ...(prev[id] ?? emptyFilter), ...patch },
    }));

  const setShape = (id: string) => (s: "rect" | "ellipse") =>
    setSectionShapes(prev => ({ ...prev, [id]: s }));

  const toggle = (id: string) =>
    setOpenSection(prev => (prev === id ? null : id));

  const applyFilter = (group: CategoryRecords, f: SectionFilter) => {
    const q = f.query.trim().toLowerCase();
    const getText = group.category.getPrimaryLabel;
    return group.records.filter(
      r =>
        (!q || getText(r.record).toLowerCase().includes(q)) &&
        (f.status === "all" ||
          (f.status === "placed" ? r.isPlaced : !r.isPlaced)),
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {records.map(group => {
          const { category } = group;
          const id = category.id;
          const filter = filterOf(id);
          const filtered = applyFilter(group, filter);
          return (
            <Section
              key={id}
              title={category.title}
              iconShape={category.iconShape}
              iconColor={category.iconColor}
              placed={filtered.filter(r => r.isPlaced).length}
              unplaced={filtered.filter(r => !r.isPlaced).length}
              totalUnplaced={group.counts.unplaced}
              isOpen={openSection === id}
              onToggle={() => toggle(id)}
              defaultShape={shapeOf(id)}
              onDefaultShapeChange={setShape(id)}
              query={filter.query}
              onQueryChange={q => updateFilter(id, { query: q })}
              statusFilter={filter.status}
              onStatusFilterChange={s => updateFilter(id, { status: s })}
              onAutoArrange={() =>
                onAutoArrange(
                  category,
                  group.records
                    .filter(r => !r.isPlaced)
                    .map(r => ({
                      recordId: category.getRecordId(r.record),
                      recordName: category.getPrimaryLabel(r.record),
                    })),
                  shapeOf(id),
                )
              }
            >
              {filtered.map((r: PlacedRecord) => (
                <RecordRow
                  key={category.getRecordId(r.record)}
                  category={category}
                  record={r.record}
                  isPlaced={r.isPlaced}
                />
              ))}
            </Section>
          );
        })}
      </div>
    </div>
  );
}
