import { useRef, useState } from "react";
import { PiMagnifyingGlass, PiX } from "react-icons/pi";
import { IconButton } from "@/components/IconButton";
import type { SearchResult } from "@/viewer/hooks/useSearch";
import { TYPE_BADGE, displayName } from "@/viewer/utils/elementTypes";
import { useT } from "@/viewer/i18n";

interface SearchBarProps {
  query: string;
  results: SearchResult[];
  placeholder: string;
  onQueryChange: (query: string) => void;
  onResultSelect: (result: SearchResult) => void;
}

export function SearchBar({
  query,
  results,
  placeholder,
  onQueryChange,
  onResultSelect,
}: SearchBarProps) {
  const t = useT();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const showDropdown = focused && query.trim().length > 0;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200">
        <PiMagnifyingGlass size={16} className="text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            // Delay to allow dropdown click to register
            setTimeout(() => setFocused(false), 150);
          }}
          placeholder={placeholder}
          className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 outline-none bg-transparent"
        />
        {query && (
          <IconButton
            variant="bare"
            size="sm"
            onClick={() => {
              onQueryChange("");
              inputRef.current?.focus();
            }}
          >
            <PiX size={14} />
          </IconButton>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-3 py-3 text-xs text-gray-400">
              {t("viewer.search.noResults")}
            </div>
          ) : (
            results.map(result => {
              const badge = TYPE_BADGE[result.elementType];
              return (
                <button
                  key={result.elementId}
                  onClick={() => {
                    onResultSelect(result);
                    onQueryChange("");
                    inputRef.current?.blur();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-800 truncate">
                      {result.exhibitorName || displayName(result, t)}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${badge.className}`}
                    >
                      {t(badge.labelKey)}
                    </span>
                  </div>
                  {result.exhibitorName && (
                    <div className="text-[11px] text-gray-400">
                      {displayName(result, t)}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
