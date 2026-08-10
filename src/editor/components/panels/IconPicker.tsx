import { useState, useRef, useEffect } from "react";
import { PiMagnifyingGlass } from "react-icons/pi";
import { ICON_CATEGORIES, iconRegistry, type IconEntry } from "../../utils/iconRegistry";
import { ICON_CATEGORY_LABEL, ICON_LABEL } from "../../utils/iconLabels";
import { useT } from "../../i18n";

interface IconPickerProps {
  selectedId: string | null;
  onSelect: (iconId: string) => void;
  onClose: () => void;
  anchorRect: DOMRect;
}

export function IconPicker({ selectedId, onSelect, onClose, anchorRect }: IconPickerProps) {
  const t = useT();
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Matches the translated label so search works in the reading language, and the
  // English keywords, which stay untranslated as a synonym index.
  const q = query.trim().toLowerCase();
  const filtered = q
    ? iconRegistry.filter(
        (entry) =>
          t(ICON_LABEL[entry.id].labelKey).toLowerCase().includes(q) ||
          t(ICON_CATEGORY_LABEL[entry.category].labelKey).toLowerCase().includes(q) ||
          entry.keywords.some((kw) => kw.toLowerCase().includes(q)),
      )
    : null;

  const renderIcon = (entry: IconEntry) => {
    const Icon = entry.component;
    const isSelected = entry.id === selectedId;
    return (
      <button
        key={entry.id}
        onClick={() => onSelect(entry.id)}
        title={t(ICON_LABEL[entry.id].labelKey)}
        className={`flex items-center justify-center w-9 h-9 rounded cursor-pointer transition-colors ${
          isSelected
            ? "bg-primary-600 text-white"
            : "hover:bg-gray-100 text-gray-600"
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
      className="bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] w-[280px] max-h-[400px] flex flex-col"
      style={{ position: "fixed", left: anchorRect.right + 8, top }}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
        <PiMagnifyingGlass size={14} className="text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("editor.icon.search")}
          className="flex-1 text-xs text-gray-800 placeholder:text-gray-400 outline-none bg-transparent"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered ? (
          filtered.length === 0 ? (
            <p className="text-xs text-gray-400 p-2">{t("editor.icon.noResults")}</p>
          ) : (
            <div className="flex flex-wrap gap-0.5">
              {filtered.map(renderIcon)}
            </div>
          )
        ) : (
          ICON_CATEGORIES.map((category) => (
            <div key={category} className="mb-3">
              <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide px-1 mb-1">
                {t(ICON_CATEGORY_LABEL[category].labelKey)}
              </div>
              <div className="flex flex-wrap gap-0.5">
                {iconRegistry
                  .filter((e) => e.category === category)
                  .map(renderIcon)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
