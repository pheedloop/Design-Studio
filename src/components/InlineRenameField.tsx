import { useEffect, useRef, useState } from "react";

interface InlineRenameFieldProps {
  value: string;
  /** Called with the trimmed value on Enter or blur. Never called empty. */
  onCommit: (next: string) => void;
  /** Translated by the caller — each surface has its own narrowed `t`. */
  title: string;
}

/**
 * A title that becomes a text input when clicked. Enter or blur commits, Escape
 * reverts, and an empty value is refused rather than saved.
 */
export function InlineRenameField({
  value,
  onCommit,
  title,
}: InlineRenameFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // No sync effect needed: `draft` is only read while editing, and both entry
  // points reinitialize it from `value` at that moment.
  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) onCommit(trimmed);
    else setDraft(value);
    setEditing(false);
  };

  return editing ? (
    <input
      ref={inputRef}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      className="flex-1 text-base font-semibold text-text-heading bg-white border border-primary-400 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary-400"
    />
  ) : (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className="flex-1 text-left text-base font-semibold text-text-heading truncate hover:text-primary-600 transition-colors"
      title={title}
    >
      {value}
    </button>
  );
}
