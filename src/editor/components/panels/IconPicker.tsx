import { useState, useRef, useEffect } from "react";
import { PiMagnifyingGlass } from "react-icons/pi";
import {
  ICON_CATEGORIES,
  iconRegistry,
  type IconEntry,
} from "@/editor/utils/iconRegistry";
import { ICON_CATEGORY_LABEL, ICON_LABEL } from "@/editor/utils/iconLabels";
import { useT } from "@/editor/i18n";
import { useDismiss } from "@/hooks/useDismiss";
import { Row } from "@/components/Row";

interface IconPickerProps {
  selectedId: string | null;
  onSelect: (iconId: string) => void;
  onClose: () => void;
  anchorRect: DOMRect;
}

export function IconPicker({
  selectedId,
  onSelect,
  onClose,
  anchorRect,
}: IconPickerProps) {
  const t = useT();
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useDismiss(ref, onClose);

  // Matches the translated label so search works in the reading language, and the
  // English keywords, which stay untranslated as a synonym index.
  const q = query.trim().toLowerCase();
  const filtered = q
    ? iconRegistry.filter(
        entry =>
          t(ICON_LABEL[entry.id]).toLowerCase().includes(q) ||
          t(ICON_CATEGORY_LABEL[entry.category]).toLowerCase().includes(q) ||
          entry.keywords.some(kw => kw.toLowerCase().includes(q)),
      )
    : null;

  const renderIcon = (entry: IconEntry) => {
    const Icon = entry.component;
    const isSelected = entry.id === selectedId;
    return (
      <button
        key={entry.id}
        onClick={() => onSelect(entry.id)}
        title={t(ICON_LABEL[entry.id])}
        className={`flex items-center justify-center w-9 h-9 rounded cursor-pointer transition-colors ${
          isSelected
            ? "bg-primary-600 text-white"
            : "hover:bg-surface-neutral text-text-body"
        }`}
      >
        <Icon size={20} />
      </button>
    );
  };

  const top = Math.min(anchorRect.top, window.innerHeight - 416);

  return (
    <div
      ref={ref}
      className="bg-white border border-border-neutral-light rounded-lg shadow-lg z-dialog w-[280px] max-h-[400px] flex flex-col"
      style={{ position: "fixed", left: anchorRect.right + 8, top }}
    >
      <Row
        gap="xxs"
        align="center"
        className="px-3 py-2 border-b border-border-neutral-light"
      >
        <PiMagnifyingGlass size={14} className="text-text-subtle shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t("editor.icon.search")}
          className="flex-1 text-xs text-text-heading placeholder:text-text-subtle outline-none bg-transparent"
        />
      </Row>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered ? (
          filtered.length === 0 ? (
            <p className="text-xs text-text-subtle p-2">
              {t("editor.icon.noResults")}
            </p>
          ) : (
            <Row gap="hair" className="flex-wrap">
              {filtered.map(renderIcon)}
            </Row>
          )
        ) : (
          ICON_CATEGORIES.map(category => (
            <div key={category} className="mb-3">
              <div className="text-[10px] font-medium text-text-subtle uppercase tracking-wide px-1 mb-1">
                {t(ICON_CATEGORY_LABEL[category])}
              </div>
              <Row gap="hair" className="flex-wrap">
                {iconRegistry
                  .filter(e => e.category === category)
                  .map(renderIcon)}
              </Row>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
