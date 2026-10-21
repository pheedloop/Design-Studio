import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/IconButton";
import type { AttendeeOption, AttendeeProvider } from "./badgeData";
import { useDismiss } from "@/hooks/useDismiss";
import { useT } from "./i18n";
import { ChevronDownIcon, SearchIcon, CloseIcon } from "@/icons/icons";

/** About one row. */
const NEAR_BOTTOM_PX = 40;

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
  const t = useT();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AttendeeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreFailed, setMoreFailed] = useState(false);
  // Bumped whenever the query changes or the list closes, so a response for an
  // earlier query (first page or next page) is dropped.
  const generation = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);

  // Debounced search while open. `loading` flips true the moment a new search
  // cycle starts — in the event handlers below, not here — since an effect
  // body should only run the deferred fetch, not set state synchronously.
  useEffect(() => {
    if (!open) return;
    const invalidate = () => {
      generation.current++;
    };
    invalidate();
    const gen = generation.current;
    const timer = setTimeout(() => {
      provider
        .search(query, 1)
        .then(
          p => ({ p, ok: true }),
          () => ({ p: null, ok: false }),
        )
        .then(({ p, ok }) => {
          if (gen !== generation.current) return;
          setResults(p?.options ?? []);
          setPage(1);
          setHasMore(p?.hasMore ?? false);
          setFailed(!ok);
          setLoading(false);
          setLoadingMore(false);
          setMoreFailed(false);
        });
    }, 200);
    return () => {
      invalidate();
      clearTimeout(timer);
    };
  }, [query, open, provider]);

  const loadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    const gen = generation.current;
    setLoadingMore(true);
    setMoreFailed(false);
    provider.search(query, page + 1).then(
      p => {
        if (gen !== generation.current) return;
        setResults(prev => {
          const seen = new Set(prev.map(o => o.id));
          return [...prev, ...p.options.filter(o => !seen.has(o.id))];
        });
        setPage(page + 1);
        setHasMore(p.hasMore);
        setLoadingMore(false);
      },
      () => {
        if (gen !== generation.current) return;
        setMoreFailed(true);
        setLoadingMore(false);
      },
    );
  };

  useDismiss(rootRef, () => setOpen(false), open);

  return (
    <div ref={rootRef} className="relative">
      <div
        className={`flex items-center gap-tight h-7 pl-xxs pr-xxxs rounded border text-xs ${
          open ? "border-primary-400" : "border-border-neutral-light"
        } bg-white`}
      >
        <SearchIcon size={13} className="text-text-subtle shrink-0" />
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
            <span className="text-text-subtle">
              {t("badgeeditor.attendee.placeholder")}
            </span>
          )}
        </button>
        {value ? (
          <IconButton
            variant="bare"
            size="sm"
            title={t("badgeeditor.attendee.clear")}
            onClick={() => onChange(null)}
            className="shrink-0"
          >
            <CloseIcon size={13} />
          </IconButton>
        ) : (
          <ChevronDownIcon size={12} className="text-text-subtle shrink-0" />
        )}
      </div>

      {open && (
        <div className="absolute right-0 top-full mt-xxxs w-72 bg-white border border-border-neutral-light rounded-md shadow-lg z-dialog overflow-hidden">
          <div className="p-xxs border-b border-border-neutral-faint">
            <input
              autoFocus
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setLoading(true);
              }}
              placeholder={t("badgeeditor.attendee.search")}
              className="w-full px-xxs py-xxxs text-xs border border-border-neutral-light rounded outline-none focus:border-primary-400"
            />
          </div>
          <div
            className="max-h-64 overflow-y-auto py-xxxs"
            onScroll={e => {
              const el = e.currentTarget;
              if (
                el.scrollHeight - el.scrollTop - el.clientHeight <=
                NEAR_BOTTOM_PX
              )
                loadMore();
            }}
          >
            {loading ? (
              <div className="px-xs py-xxs text-xs text-text-subtle">
                {t("badgeeditor.attendee.searching")}
              </div>
            ) : failed ? (
              <div role="alert" className="px-xs py-xxs text-xs text-red-700">
                {t("badgeeditor.attendee.searchFailed")}
              </div>
            ) : results.length === 0 ? (
              <div className="px-xs py-xxs text-xs text-text-subtle">
                {t("badgeeditor.attendee.noResults")}
              </div>
            ) : (
              <>
                {results.map(o => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      onChange(o);
                      setOpen(false);
                    }}
                    className="w-full text-left px-xs py-tight hover:bg-surface-neutral"
                  >
                    <div className="text-xs text-text-heading truncate">
                      {o.name}
                    </div>
                    {o.subtitle && (
                      <div className="text-xs text-text-subtle truncate">
                        {o.subtitle}
                      </div>
                    )}
                  </button>
                ))}
                {loadingMore && (
                  <div className="px-xs py-xxs text-xs text-text-subtle">
                    {t("badgeeditor.attendee.searching")}
                  </div>
                )}
                {moreFailed && (
                  <div
                    role="alert"
                    className="px-xs py-xxs text-xs text-red-700"
                  >
                    {t("badgeeditor.attendee.searchFailed")}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
