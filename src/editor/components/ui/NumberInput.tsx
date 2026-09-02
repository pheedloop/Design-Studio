import { useState } from "react";
import { PiCaretUp, PiCaretDown } from "react-icons/pi";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  step?: number;
}

export function NumberInput({
  value,
  onChange,
  disabled,
  step = 1,
}: NumberInputProps) {
  // A draft exists only while the field is being edited, so free-form input
  // ("", "-", "12.") is possible without the displayed value ever drifting from
  // the prop — the rest of the time it is derived, not stored.
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? String(Math.round(value));

  const commit = () => {
    if (draft === null) return;
    const parsed = Number(draft);
    if (!isNaN(parsed) && draft.trim() !== "") onChange(parsed);
    // Either way the draft is dropped: on success the prop carries the value, on
    // failure the display falls back to the last good one.
    setDraft(null);
  };

  const increment = () => {
    const next = Math.round(value) + step;
    onChange(next);
  };

  const decrement = () => {
    const next = Math.round(value) - step;
    onChange(next);
  };

  return (
    <div className="flex items-stretch">
      <input
        type="number"
        value={display}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === "Enter") {
            commit();
            (e.target as HTMLInputElement).blur();
          }
        }}
        disabled={disabled}
        className="w-full px-2 py-1 text-xs border border-border-neutral-light rounded-l bg-white disabled:bg-surface-neutral disabled:text-text-subtle [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {!disabled && (
        <div className="flex flex-col border border-l-0 border-border-neutral-light rounded-r overflow-hidden">
          <button
            type="button"
            onClick={increment}
            className="flex items-center justify-center px-1 h-1/2 hover:bg-surface-neutral cursor-pointer text-text-subtle hover:text-text-body transition-colors"
            tabIndex={-1}
          >
            <PiCaretUp size={10} />
          </button>
          <button
            type="button"
            onClick={decrement}
            className="flex items-center justify-center px-1 h-1/2 border-t border-border-neutral-light hover:bg-surface-neutral cursor-pointer text-text-subtle hover:text-text-body transition-colors"
            tabIndex={-1}
          >
            <PiCaretDown size={10} />
          </button>
        </div>
      )}
    </div>
  );
}
