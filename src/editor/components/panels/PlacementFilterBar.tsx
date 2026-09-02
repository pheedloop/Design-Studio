import React, { useState } from "react";
import { PiCaretDown, PiMagnifyingGlass, PiFunnel, PiX } from "react-icons/pi";
import { IconButton } from "@/components/IconButton";
import { useT, type StringKey } from "@/editor/i18n";
import { Row } from "@/components/Row";

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
    <div className="border-b border-border-neutral-faint bg-white">
      {/* Toolbar row */}
      <Row gap="tight" align="center" className="px-xs py-tight">
        {/* Shape picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShapeOpen(v => !v);
              setFilterOpen(false);
            }}
            className="flex items-center gap-xxxs text-xs text-text-body border border-border-neutral-light rounded px-tight py-hair hover:bg-surface-neutral transition-colors"
          >
            <span
              className="inline-block w-2.5 h-2.5 bg-surface-muted-hover shrink-0"
              style={{ borderRadius: shape === "ellipse" ? "9999px" : "0px" }}
            />
            {t(PLACEMENT_SHAPE_LABEL[shape])}
            <PiCaretDown size={10} className="text-text-subtle" />
          </button>
          {shapeOpen && (
            <div className="absolute top-full left-0 mt-hair bg-white border border-border-neutral-light rounded shadow-md z-20 py-hair w-28">
              {(["rect", "ellipse"] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    onShapeChange(s);
                    setShapeOpen(false);
                  }}
                  className={[
                    "w-full text-left flex items-center gap-tight px-xxs py-tight text-xs hover:bg-surface-neutral transition-colors",
                    shape === s
                      ? "text-primary-600 font-medium"
                      : "text-text-body",
                  ].join(" ")}
                >
                  <span
                    className="inline-block w-2.5 h-2.5 bg-surface-muted-hover shrink-0"
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
        <IconButton
          variant="bare"
          size="sm"
          active={searchOpen}
          onClick={toggleSearch}
          title={t("editor.placement.search")}
        >
          <PiMagnifyingGlass size={13} />
        </IconButton>

        {/* Filter toggle + popover */}
        <div className="relative">
          <IconButton
            variant="bare"
            size="sm"
            active={statusFilter !== "all" || filterOpen}
            onClick={() => {
              setFilterOpen(v => !v);
              setShapeOpen(false);
            }}
            title={t("editor.placement.filterByStatus")}
          >
            <PiFunnel size={13} />
          </IconButton>
          {filterOpen && (
            <div className="absolute right-0 top-full mt-xxxs bg-white border border-border-neutral-light rounded-lg shadow-lg z-20 py-tight w-36">
              <div className="px-snug pb-xxxs text-[10px] uppercase tracking-wider text-text-subtle font-medium">
                {t("editor.placement.status")}
              </div>
              {(["all", "unplaced", "placed"] as const).map(f => (
                <label
                  key={f}
                  className="flex items-center gap-xxs px-snug py-tight text-xs cursor-pointer hover:bg-surface-neutral transition-colors"
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
                  <span className="text-text-body">
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
      </Row>

      {/* Expandable search input */}
      {searchOpen && (
        <div className="px-xs pb-xxs">
          <div className="relative">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              placeholder={t("editor.placement.searchPlaceholder")}
              className="w-full pl-snug pr-m py-xxxs text-xs border border-border-neutral-light rounded bg-surface-neutral focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-400 transition"
            />
            {query && (
              <IconButton
                variant="bare"
                size="sm"
                onClick={() => onQueryChange("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2"
              >
                <PiX size={11} />
              </IconButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
