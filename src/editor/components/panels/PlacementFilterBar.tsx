import React, { useState } from "react";
import { PiCaretDown, PiMagnifyingGlass, PiFunnel, PiX } from "react-icons/pi";
import { useT, type StringKey } from "@/editor/i18n";

/** The ellipse option is offered as "Circle" — the placement grid only ever squares it. */
const PLACEMENT_SHAPE_LABEL: Record<"rect" | "ellipse", StringKey> = {
  ellipse: "editor.shape.circle",
  rect: "editor.shape.rect",
};

// ---------------------------------------------------------------------------
// PlacementFilterBar — shape picker + search + status filter (per section)
// ---------------------------------------------------------------------------

export type StatusFilter = "all" | "placed" | "unplaced";

export function PlacementFilterBar({
  shape,
  onShapeChange,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
}: {
  shape: "rect" | "ellipse";
  onShapeChange: (s: "rect" | "ellipse") => void;
  query: string;
  onQueryChange: (q: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (f: StatusFilter) => void;
}) {
  const t = useT();
  const [shapeOpen, setShapeOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const toggleSearch = () => {
    if (searchOpen) {
      onQueryChange("");
    } else {
      setTimeout(() => searchRef.current?.focus(), 0);
    }
    setSearchOpen(v => !v);
    setFilterOpen(false);
  };

  return (
    <div className="border-b border-gray-100 bg-white">
      {/* Toolbar row */}
      <div className="flex items-center gap-1.5 px-3 py-1.5">
        {/* Shape picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShapeOpen(v => !v);
              setFilterOpen(false);
            }}
            className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded px-1.5 py-0.5 hover:bg-gray-50 transition-colors"
          >
            <span
              className="inline-block w-2.5 h-2.5 bg-gray-300 shrink-0"
              style={{ borderRadius: shape === "ellipse" ? "9999px" : "0px" }}
            />
            {t(PLACEMENT_SHAPE_LABEL[shape])}
            <PiCaretDown size={10} className="text-gray-400" />
          </button>
          {shapeOpen && (
            <div className="absolute top-full left-0 mt-0.5 bg-white border border-gray-200 rounded shadow-md z-20 py-0.5 w-28">
              {(["rect", "ellipse"] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    onShapeChange(s);
                    setShapeOpen(false);
                  }}
                  className={[
                    "w-full text-left flex items-center gap-1.5 px-2 py-1.5 text-xs hover:bg-gray-50 transition-colors",
                    shape === s
                      ? "text-primary-600 font-medium"
                      : "text-gray-700",
                  ].join(" ")}
                >
                  <span
                    className="inline-block w-2.5 h-2.5 bg-gray-300 shrink-0"
                    style={{ borderRadius: s === "ellipse" ? "9999px" : "0px" }}
                  />
                  {t(PLACEMENT_SHAPE_LABEL[s])}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Search toggle */}
        <button
          type="button"
          onClick={toggleSearch}
          className={[
            "p-0.5 transition-colors rounded",
            searchOpen
              ? "text-primary-600 bg-primary-50"
              : "text-gray-400 hover:text-gray-600",
          ].join(" ")}
          title={t("editor.placement.search")}
        >
          <PiMagnifyingGlass size={13} />
        </button>

        {/* Filter toggle + popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setFilterOpen(v => !v);
              setShapeOpen(false);
            }}
            className={[
              "p-0.5 transition-colors rounded",
              statusFilter !== "all"
                ? "text-primary-600 bg-primary-50"
                : filterOpen
                  ? "text-primary-600 bg-primary-50"
                  : "text-gray-400 hover:text-gray-600",
            ].join(" ")}
            title={t("editor.placement.filterByStatus")}
          >
            <PiFunnel size={13} />
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1.5 w-36">
              <div className="px-2.5 pb-1 text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                {t("editor.placement.status")}
              </div>
              {(["all", "unplaced", "placed"] as const).map(f => (
                <label
                  key={f}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="placement-status-filter"
                    checked={statusFilter === f}
                    onChange={() => {
                      onStatusFilterChange(f);
                      setFilterOpen(false);
                    }}
                    className="accent-primary-600"
                  />
                  <span className="text-gray-700">
                    {f === "all"
                      ? t("editor.placement.statusAll")
                      : f === "placed"
                        ? t("editor.placement.placed")
                        : t("editor.placement.unplaced")}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expandable search input */}
      {searchOpen && (
        <div className="px-3 pb-2">
          <div className="relative">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              placeholder={t("editor.placement.searchPlaceholder")}
              className="w-full pl-2.5 pr-6 py-1 text-xs border border-gray-200 rounded bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-400 transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <PiX size={11} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
