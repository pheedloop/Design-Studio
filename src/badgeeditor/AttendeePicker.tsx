import { useEffect, useRef, useState } from "react";
import { PiMagnifyingGlass, PiX, PiCaretDown } from "react-icons/pi";
import { IconButton } from "@/components/IconButton";
import type { AttendeeOption, AttendeeProvider } from "./badgeData";
import { useDismiss } from "@/hooks/useDismiss";

interface AttendeePickerProps {
  provider: AttendeeProvider;
  value: AttendeeOption | null;
  onChange: (option: AttendeeOption | null) => void;
}

/**
 * Compact async searchable attendee picker for the OptionsBar. Debounced
 * server-side search (like raichu's AttendeeSelect), built from primitives so
 * the library carries no react-select dependency.
 */
export function AttendeePicker({
  provider,
  value,
  onChange,
}: AttendeePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AttendeeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Debounced search while open. `loading` flips true the moment a new search
  // cycle starts — in the event handlers below, not here — since an effect
  // body should only run the deferred fetch, not set state synchronously.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      provider
        .search(query)
        .then(r => setResults(r))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [query, open, provider]);

  useDismiss(rootRef, () => setOpen(false), open);

  return (
    <div ref={rootRef} className="relative">
      <div
        className={`flex items-center gap-tight h-7 pl-2 pr-1 rounded border text-xs ${
          open ? "border-primary-400" : "border-border-neutral-light"
        } bg-white`}
      >
        <PiMagnifyingGlass size={13} className="text-text-subtle shrink-0" />
        <button
          type="button"
          onClick={() =>
            setOpen(o => {
              const next = !o;
              if (next) setLoading(true);
              return next;
            })
          }
          className="min-w-[9rem] max-w-[14rem] truncate text-left text-text-body"
        >
          {value ? (
            value.name
          ) : (
            <span className="text-text-subtle">Preview data…</span>
          )}
        </button>
        {value ? (
          <IconButton
            variant="bare"
            size="sm"
            title="Clear"
            onClick={() => onChange(null)}
            className="shrink-0"
          >
            <PiX size={13} />
          </IconButton>
        ) : (
          <PiCaretDown size={12} className="text-text-subtle shrink-0" />
        )}
      </div>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-border-neutral-light rounded-md shadow-lg z-dialog overflow-hidden">
          <div className="p-2 border-b border-border-neutral-faint">
            <input
              autoFocus
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setLoading(true);
              }}
              placeholder="Search attendee…"
              className="w-full px-2 py-1 text-xs border border-border-neutral-light rounded outline-none focus:border-primary-400"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {loading ? (
              <div className="px-3 py-2 text-xs text-text-subtle">
                Searching…
              </div>
            ) : results.length === 0 ? (
              <div className="px-3 py-2 text-xs text-text-subtle">
                No attendees found
              </div>
            ) : (
              results.map(o => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-surface-neutral"
                >
                  <div className="text-xs text-text-heading truncate">
                    {o.name}
                  </div>
                  {o.subtitle && (
                    <div className="text-[11px] text-text-subtle truncate">
                      {o.subtitle}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
