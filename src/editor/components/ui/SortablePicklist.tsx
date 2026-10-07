import { useRef, useState } from "react";
import { PiCaretDown, PiDotsSixVertical, PiX } from "react-icons/pi";
import { DropdownMenu } from "./DropdownMenu";
import { moveItem, pickedValues } from "./picklist";

interface PicklistOption {
  value: string;
  label: string;
}

interface SortablePicklistProps {
  options: PicklistOption[];
  value: string[];
  onChange: (value: string[]) => void;
  addLabel: string;
  emptyTitle: string;
  emptyHint: string;
  removeLabel: (label: string) => string;
}

export function SortablePicklist({
  options,
  value,
  onChange,
  addLabel,
  emptyTitle,
  emptyHint,
  removeLabel,
}: SortablePicklistProps) {
  const dragIndexRef = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const codes = pickedValues(value, options);
  const picked = codes.map(code =>
    options.find(option => option.value === code)!,
  );
  const available = options.filter(option => !codes.includes(option.value));

  const endDrag = () => {
    dragIndexRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="flex flex-col gap-xxs">
      {picked.length ? (
        <ol className="flex flex-col border border-border-neutral-light rounded bg-white">
          {picked.map((option, index) => (
            <li
              key={option.value}
              draggable
              onDragStart={e => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", option.value);
                dragIndexRef.current = index;
                setDragIndex(index);
              }}
              onDragOver={e => {
                if (dragIndexRef.current === null) return;
                e.preventDefault();
                setOverIndex(index);
              }}
              onDrop={e => {
                e.preventDefault();
                const from = dragIndexRef.current;
                if (from !== null && from !== index) {
                  onChange(moveItem(codes, from, index));
                }
                endDrag();
              }}
              onDragEnd={endDrag}
              className={[
                "flex items-center gap-xxxs px-xxxs py-xxxs text-xs text-text-body cursor-grab select-none",
                index > 0 ? "border-t border-border-neutral-faint" : "",
                dragIndex === index ? "opacity-40" : "",
                overIndex === index && dragIndex !== index
                  ? "bg-surface-neutral"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <PiDotsSixVertical
                size={13}
                aria-hidden
                className="text-text-subtle shrink-0"
              />
              <span className="text-text-subtle tabular-nums shrink-0">
                {index + 1}.
              </span>
              <span className="flex-1 min-w-0 truncate" title={option.label}>
                {option.label}
              </span>
              <button
                type="button"
                title={removeLabel(option.label)}
                aria-label={removeLabel(option.label)}
                onClick={() =>
                  onChange(codes.filter(code => code !== option.value))
                }
                className="shrink-0 p-hair rounded text-text-subtle hover:text-text-body hover:bg-surface-neutral"
              >
                <PiX size={12} />
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <div className="flex flex-col gap-hair px-xs py-xxs rounded border border-dashed border-border-neutral-light bg-surface-neutral">
          <span className="text-xs font-medium text-text-heading">
            {emptyTitle}
          </span>
          <span className="text-xs text-text-subtle">{emptyHint}</span>
        </div>
      )}

      {available.length > 0 && (
        <div className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={adding}
            onClick={() => setAdding(open => !open)}
            className="flex items-center justify-between w-full px-xxs py-xxxs text-xs text-left text-text-body border border-border-neutral-light rounded bg-white"
          >
            {addLabel}
            <PiCaretDown size={12} className="text-text-subtle shrink-0" />
          </button>
          {adding && (
            <DropdownMenu
              fullWidth
              items={available.map(option => ({
                label: option.label,
                onClick: () => onChange([...codes, option.value]),
              }))}
              onClose={() => setAdding(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
