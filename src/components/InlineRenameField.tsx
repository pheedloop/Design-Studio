import { useEffect, useRef, useState } from "react";

interface InlineRenameFieldProps {
  value: string;
  /** Called with the trimmed value on Enter or blur. Never called empty. */
  onCommit: (next: string) => void;
  /** Tooltip on the click-to-rename affordance. Translated by the caller: this
   *  component is shared across surfaces, and each surface has its own narrowed
   *  `t`, so it can't pick one. */
  title: string;
}

/**
 * A title that turns into a text input when clicked: Enter or blur commits,
 * Escape reverts, and an empty value is refused rather than saved.
 *
 * Shared by the map editor's tool sidebar and the badge editor's sidebar, which
 * had grown byte-identical copies of the state, the focus effect, the commit
 * rule and both class strings.
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

  // No effect syncing `draft` from `value` while not editing: `draft` is only
  // ever read while `editing` is true, and both places that flip it on
  // (the rename button below, and Escape-to-cancel) already reinitialize
  // `draft` from the current `value` at that exact moment.
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
      className="flex-1 text-base font-semibold text-gray-800 bg-white border border-primary-400 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary-400"
    />
  ) : (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className="flex-1 text-left text-base font-semibold text-gray-800 truncate hover:text-primary-600 transition-colors"
      title={title}
    >
      {value}
    </button>
  );
}
