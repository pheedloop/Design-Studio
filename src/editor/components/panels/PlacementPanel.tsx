import { useState } from "react";
import type {
  PlacementRecords,
  CategoryRecords,
  PlacedRecord,
} from "@/editor/hooks/usePlacementRecords";
import type { PlacementCategory } from "@/editor/placement/types";
import { PlacementRecordRow } from "./PlacementRecordRow";
import type { StatusFilter } from "./PlacementFilterBar";
import { PlacementSection } from "./PlacementSection";

export interface AutoArrangeRecord {
  recordId: string;
  recordName: string;
}

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
            <PlacementSection
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
                <PlacementRecordRow
                  key={category.getRecordId(r.record)}
                  category={category}
                  record={r.record}
                  isPlaced={r.isPlaced}
                />
              ))}
            </PlacementSection>
          );
        })}
      </div>
    </div>
  );
}
