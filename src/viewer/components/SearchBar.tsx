import { useRef, useState } from "react";
import { PiMagnifyingGlass, PiX } from "react-icons/pi";
import { IconButton } from "@/components/IconButton";
import type { SearchResult } from "@/viewer/hooks/useSearch";
import { TYPE_BADGE, displayName } from "@/viewer/utils/elementTypes";
import { useT } from "@/viewer/i18n";
import { Row } from "@/components/Row";
import { Text } from "@/components/Text";

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
      <Row
        gap="xxs"
        align="center"
        className="px-xs py-xxs bg-white border-b border-border-neutral-light"
      >
        <PiMagnifyingGlass size={16} className="text-text-subtle shrink-0" />
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
          className="flex-1 text-sm text-text-heading placeholder:text-text-subtle outline-none bg-transparent"
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
      </Row>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 bg-white border border-border-neutral-light border-t-0 rounded-b-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-xs py-xs text-xs text-text-subtle">
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
                  className="w-full text-left px-xs py-xxs hover:bg-surface-neutral cursor-pointer transition-colors"
                >
                  <Row gap="xxs" align="center" justify="between">
                    <Text
                      size="xs"
                      weight="medium"
                      color="heading"
                      as="span"
                      truncate
                    >
                      {result.exhibitorName || displayName(result, t)}
                    </Text>
                    <span
                      className={`text-[10px] font-medium px-tight py-hair rounded shrink-0 ${badge.className}`}
                    >
                      {t(badge.labelKey)}
                    </span>
                  </Row>
                  {result.exhibitorName && (
                    <div className="text-[11px] text-text-subtle">
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
