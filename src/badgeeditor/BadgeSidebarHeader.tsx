import { useEffect, useRef, useState } from "react";

export function BadgeSidebarHeader({
  name,
  onNameChange,
}: {
  name: string;
  onNameChange: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // No effect syncing `draft` from `name` while not editing: `draft` is only
  // ever read while `editing` is true, and both places that flip it on
  // (the rename button below, and Escape-to-cancel) already reinitialize
  // `draft` from the current `name` at that exact moment.
  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) onNameChange(trimmed);
    else setDraft(name);
    setEditing(false);
  };

  return (
    <div className="px-3 h-[43px] shrink-0 border-b border-gray-200 flex items-center gap-2 min-w-0">
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(name);
              setEditing(false);
            }
          }}
          className="flex-1 text-base font-semibold text-gray-800 bg-white border border-primary-400 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary-400"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(name);
            setEditing(true);
          }}
          className="flex-1 text-left text-base font-semibold text-gray-800 truncate hover:text-primary-600 transition-colors"
          title="Click to rename"
        >
          {name}
        </button>
      )}
    </div>
  );
}
