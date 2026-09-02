import { useState, useRef } from "react";
import { PiMagnifyingGlass, PiX } from "react-icons/pi";
import { IconButton } from "@/components/IconButton";
import type { SearchResult } from "@/viewer/hooks/useSearch";
import type { DirectionsLocation } from "@/viewer/hooks/useDirections";
import {
  TYPE_BADGE,
  displayName,
  locationLabel,
} from "@/viewer/utils/elementTypes";
import type { T } from "@/viewer/i18n";
import { Row } from "@/components/Row";
import { Text } from "@/components/Text";

export function LocationField({
  label,
  placeholder,
  value,
  onSearch,
  onSelect,
  onClear,
  t,
}: {
  label: string;
  placeholder: string;
  value: DirectionsLocation | null;
  onSearch: (query: string) => SearchResult[];
  onSelect: (result: SearchResult) => void;
  onClear: () => void;
  t: T;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = focused ? onSearch(query) : [];
  const showDropdown = focused && query.trim().length > 0;

  if (value) {
    return (
      <Row
        gap="xxs"
        align="center"
        className="px-3 py-2 bg-surface-neutral rounded-lg border border-border-neutral-light"
      >
        <span className="text-[10px] font-semibold text-text-subtle uppercase w-8 shrink-0">
          {label}
        </span>
        <span className="flex-1 text-xs font-medium text-text-heading truncate">
          {locationLabel(value, t)}
        </span>
        <IconButton
          variant="bare"
          size="sm"
          onClick={() => {
            onClear();
            setQuery("");
          }}
          className="shrink-0"
        >
          <PiX size={12} />
        </IconButton>
      </Row>
    );
  }

  return (
    <div className="relative">
      <Row
        gap="xxs"
        align="center"
        className="px-3 py-2 bg-white rounded-lg border border-border-neutral-light focus-within:border-blue-400"
      >
        <span className="text-[10px] font-semibold text-text-subtle uppercase w-8 shrink-0">
          {label}
        </span>
        <PiMagnifyingGlass size={12} className="text-text-disabled shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder}
          className="flex-1 text-xs text-text-heading placeholder:text-text-subtle outline-none bg-transparent"
        />
      </Row>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border-neutral-light rounded-lg shadow-lg z-50 max-h-44 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-3 py-2 text-xs text-text-subtle">
              {t("viewer.search.noResults")}
            </div>
          ) : (
            results.map(result => {
              const badge = TYPE_BADGE[result.elementType];
              return (
                <button
                  key={result.elementId}
                  onClick={() => {
                    onSelect(result);
                    setQuery("");
                    inputRef.current?.blur();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-surface-neutral cursor-pointer transition-colors"
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
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${badge.className}`}
                    >
                      {t(badge.labelKey)}
                    </span>
                  </Row>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
